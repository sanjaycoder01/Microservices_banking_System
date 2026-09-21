import { TransactionModel } from "../models/transaction.model";
import { TransactionStatus, TransactionType } from "../types";

export type CreateTransactionData = {
  transactionId: string;
  customerId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status?: TransactionStatus;
  idempotencyKey: string;
  failureReason?: string;
};

export const transactionRepository = {
  async findByIdempotencyKey(idempotencyKey: string) {
    return TransactionModel.findOne({ idempotencyKey });
  },

  async findByTransactionId(transactionId: string) {
    return TransactionModel.findOne({ transactionId });
  },

  async findByCustomerId(customerId: string, limit = 50) {
    return TransactionModel.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(limit);
  },

  async create(data: CreateTransactionData) {
    return TransactionModel.create(data);
  },

  async updateStatus(
    transactionId: string,
    status: TransactionStatus,
    failureReason?: string
  ) {
    return TransactionModel.findOneAndUpdate(
      { transactionId },
      {
        status,
        ...(failureReason !== undefined ? { failureReason } : {}),
      },
      { new: true }
    );
  },
};
