import { CreateTransferSessionDTO } from "../dtos/create-transfer-session.dto";
import { ProcessTransferDTO } from "../dtos/process-transfer.dto";
import { transferSessionRepository } from "../repositories/transfer-session.repository";
import { transactionRepository } from "../repositories/transaction.repository";
import { customerClient } from "../clients/customer.client";
import { accountClient } from "../clients/account.client";
import { generateSessionId, generateTransactionId } from "../utils/ids";
import { IDEMPOTENCY_HEADER, TRANSFER_SESSION_TTL_MINUTES } from "../constants";
import { transactionProducer } from "../events/producers/transaction.producer";
import {
  AppError,
  CreateTransferSessionResponse,
  TransactionResponse,
} from "../types";
import { logger } from "../config/logger";

const toTransactionResponse = (txn: {
  _id: { toString(): string };
  transactionId: string;
  customerId: { toString(): string };
  sourceAccountId: { toString(): string };
  destinationAccountId: { toString(): string };
  type: string;
  amount: number;
  currency: string;
  status: string;
  idempotencyKey: string;
  failureReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): TransactionResponse => ({
  id: txn._id.toString(),
  transactionId: txn.transactionId,
  customerId: txn.customerId.toString(),
  sourceAccountId: txn.sourceAccountId.toString(),
  destinationAccountId: txn.destinationAccountId.toString(),
  type: txn.type as TransactionResponse["type"],
  amount: txn.amount,
  currency: txn.currency,
  status: txn.status as TransactionResponse["status"],
  idempotencyKey: txn.idempotencyKey,
  failureReason: txn.failureReason ?? undefined,
  createdAt: txn.createdAt,
  updatedAt: txn.updatedAt,
});

/**
 * Owns transfer sessions + transaction records.
 * Does not own balances — Account Service performs debit/credit.
 *
 * Create session: resolve/validate accounts once.
 * Process transfer: move money using stored session data.
 */
export class TransactionService {
  /**
   * Creates a temporary transfer session (CREATED).
   * Validates sender + source ownership + destination exists/active.
   * No debit/credit here.
   */
  async createTransferSession(
    accessToken: string,
    dto: CreateTransferSessionDTO
  ): Promise<CreateTransferSessionResponse> {
    try {
      if (dto.sourceAccountId === dto.destinationAccountId) {
        throw new AppError(
          400,
          "Source and destination accounts must be different"
        );
      }

      const customer = await customerClient.getAuthenticatedCustomer(accessToken);

      if (customer.status !== "ACTIVE") {
        throw new AppError(403, "Customer account is not active");
      }

      const currency = dto.currency.toUpperCase();

      const [sourceAccount, destinationAccount] = await Promise.all([
        accountClient.getAccount(dto.sourceAccountId),
        accountClient.getAccount(dto.destinationAccountId),
      ]);

      if (sourceAccount.customerId !== customer.id) {
        throw new AppError(403, "Source account does not belong to you");
      }

      if (sourceAccount.status !== "ACTIVE") {
        throw new AppError(400, "Source account is not active");
      }

      if (destinationAccount.status !== "ACTIVE") {
        throw new AppError(400, "Destination account is not active");
      }

      if (
        sourceAccount.currency !== currency ||
        destinationAccount.currency !== currency
      ) {
        throw new AppError(400, "Currency mismatch between accounts and request");
      }

      const expiresAt = new Date(
        Date.now() + TRANSFER_SESSION_TTL_MINUTES * 60 * 1000
      );

      const session = await transferSessionRepository.create({
        sessionId: generateSessionId(),
        customerId: customer.id,
        sourceAccountId: dto.sourceAccountId,
        destinationAccountId: dto.destinationAccountId,
        amount: dto.amount,
        currency,
        status: "CREATED",
        expiresAt,
      });

      logger.info(
        {
          sessionId: session.sessionId,
          customerId: customer.id,
          sourceAccountId: dto.sourceAccountId,
          destinationAccountId: dto.destinationAccountId,
          amount: dto.amount,
          currency,
        },
        "Transfer session created"
      );

      return {
        sessionId: session.sessionId,
        status: session.status as CreateTransferSessionResponse["status"],
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      if (!(error instanceof AppError)) {
        logger.error({ err: error }, "Failed to create transfer session");
      }
      throw error;
    }
  }

  /**
   * Processes a transfer using validated session data.
   * Inter-service: Customer /me + Account transfer only.
   */
  async processTransfer(
    accessToken: string,
    dto: ProcessTransferDTO,
    idempotencyKey: string
  ): Promise<TransactionResponse> {
    let transactionId: string | undefined;
    let sessionMarkedProcessing = false;

    try {
      if (!idempotencyKey?.trim()) {
        throw new AppError(400, `${IDEMPOTENCY_HEADER} header is required`);
      }

      const existing =
        await transactionRepository.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        logger.info(
          { idempotencyKey, transactionId: existing.transactionId },
          "Returning existing transaction for idempotency key"
        );
        return toTransactionResponse(existing);
      }

      const customer = await customerClient.getAuthenticatedCustomer(accessToken);

      if (customer.status !== "ACTIVE") {
        throw new AppError(403, "Customer account is not active");
      }

      const session = await transferSessionRepository.findBySessionId(
        dto.sessionId
      );

      if (!session) {
        throw new AppError(404, "Transfer session not found");
      }

      if (session.customerId.toString() !== customer.id) {
        throw new AppError(403, "You do not own this transfer session");
      }

      if (session.status === "COMPLETED") {
        throw new AppError(409, "Transfer session already completed");
      }

      if (session.status === "FAILED" || session.status === "EXPIRED") {
        throw new AppError(
          409,
          `Transfer session is ${session.status.toLowerCase()}`
        );
      }

      if (session.expiresAt.getTime() < Date.now()) {
        await transferSessionRepository.updateStatus(session.sessionId, "EXPIRED");
        throw new AppError(410, "Transfer session has expired");
      }

      if (session.status !== "CREATED") {
        throw new AppError(409, "Transfer session cannot be processed");
      }

      await transferSessionRepository.updateStatus(
        session.sessionId,
        "PROCESSING"
      );
      sessionMarkedProcessing = true;

      transactionId = generateTransactionId();

      const transaction = await transactionRepository.create({
        transactionId,
        customerId: customer.id,
        sourceAccountId: session.sourceAccountId.toString(),
        destinationAccountId: session.destinationAccountId.toString(),
        type: "INTERNAL_TRANSFER",
        amount: session.amount,
        currency: session.currency,
        status: "PROCESSING",
        idempotencyKey,
      });

      await accountClient.transfer({
        sourceAccountId: session.sourceAccountId.toString(),
        destinationAccountId: session.destinationAccountId.toString(),
        amount: session.amount,
        currency: session.currency,
        transactionId,
      });

      const completed = await transactionRepository.updateStatus(
        transactionId,
        "COMPLETED"
      );
      await transferSessionRepository.updateStatus(
        session.sessionId,
        "COMPLETED"
      );

      logger.info(
        {
          transactionId,
          sessionId: session.sessionId,
          customerId: customer.id,
          amount: session.amount,
        },
        "Transfer processed successfully"
      );

      await transactionProducer.publishCompleted({
        transactionId,
        customerId: customer.id,
        sourceAccountId: session.sourceAccountId.toString(),
        destinationAccountId: session.destinationAccountId.toString(),
        amount: session.amount,
        currency: session.currency,
      });

      return toTransactionResponse(completed ?? transaction);
    } catch (error) {
      const reason =
        error instanceof AppError ? error.message : "Transfer processing failed";

      if (transactionId) {
        await transactionRepository.updateStatus(
          transactionId,
          "FAILED",
          reason
        );
      }

      if (sessionMarkedProcessing) {
        await transferSessionRepository.updateStatus(dto.sessionId, "FAILED");
      }

      if (!(error instanceof AppError)) {
        logger.error({ err: error }, "Failed to process transfer");
      }
      throw error;
    }
  }

  /** Returns one transaction if it belongs to the authenticated customer. */
  async getTransaction(
    accessToken: string,
    transactionId: string
  ): Promise<TransactionResponse> {
    try {
      const customer = await customerClient.getAuthenticatedCustomer(accessToken);
      const transaction =
        await transactionRepository.findByTransactionId(transactionId);

      if (!transaction) {
        throw new AppError(404, "Transaction not found");
      }

      if (
        customer.role !== "ADMIN" &&
        transaction.customerId.toString() !== customer.id
      ) {
        throw new AppError(403, "You do not have access to this transaction");
      }

      return toTransactionResponse(transaction);
    } catch (error) {
      if (!(error instanceof AppError)) {
        logger.error({ err: error, transactionId }, "Failed to get transaction");
      }
      throw error;
    }
  }

  /** Lists transactions for the authenticated customer (newest first). */
  async listMyTransactions(
    accessToken: string,
    limit = 50
  ): Promise<TransactionResponse[]> {
    try {
      const customer = await customerClient.getAuthenticatedCustomer(accessToken);
      const safeLimit = Math.min(Math.max(limit, 1), 100);
      const transactions = await transactionRepository.findByCustomerId(
        customer.id,
        safeLimit
      );

      logger.info(
        { customerId: customer.id, count: transactions.length },
        "Customer transactions listed"
      );

      return transactions.map(toTransactionResponse);
    } catch (error) {
      if (!(error instanceof AppError)) {
        logger.error({ err: error }, "Failed to list transactions");
      }
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
