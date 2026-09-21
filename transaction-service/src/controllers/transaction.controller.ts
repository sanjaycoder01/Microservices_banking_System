import { Request, Response, NextFunction } from "express";
import { transactionService } from "../services/transaction.service";
import { CreateTransferSessionDTO } from "../dtos/create-transfer-session.dto";
import { ProcessTransferDTO } from "../dtos/process-transfer.dto";
import { IDEMPOTENCY_HEADER } from "../constants";
import { AppError } from "../types";

export class TransactionController {
  async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.accessToken) {
        throw new AppError(401, "Authentication required");
      }

      const dto = req.body as CreateTransferSessionDTO;
      const session = await transactionService.createTransferSession(
        req.accessToken,
        dto
      );

      res.status(201).json({
        message: "Transfer session created successfully",
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  async processTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.accessToken) {
        throw new AppError(401, "Authentication required");
      }

      const rawKey = req.headers[IDEMPOTENCY_HEADER];
      const idempotencyKey = Array.isArray(rawKey) ? rawKey[0] : rawKey;

      if (!idempotencyKey) {
        throw new AppError(400, `${IDEMPOTENCY_HEADER} header is required`);
      }

      const dto = req.body as ProcessTransferDTO;
      const transaction = await transactionService.processTransfer(
        req.accessToken,
        dto,
        idempotencyKey
      );

      res.status(200).json({
        message: "Transfer processed successfully",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.accessToken) {
        throw new AppError(401, "Authentication required");
      }

      const rawLimit = Array.isArray(req.query.limit)
        ? req.query.limit[0]
        : req.query.limit;
      const limit = rawLimit ? Number(rawLimit) : 50;

      if (Number.isNaN(limit)) {
        throw new AppError(400, "limit must be a number");
      }

      const transactions = await transactionService.listMyTransactions(
        req.accessToken,
        limit
      );

      res.status(200).json({
        message: "Transactions retrieved successfully",
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.accessToken) {
        throw new AppError(401, "Authentication required");
      }

      const transactionId = Array.isArray(req.params.transactionId)
        ? req.params.transactionId[0]
        : req.params.transactionId;

      if (!transactionId) {
        throw new AppError(400, "Transaction id is required");
      }

      const transaction = await transactionService.getTransaction(
        req.accessToken,
        transactionId
      );

      res.status(200).json({
        message: "Transaction retrieved successfully",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
