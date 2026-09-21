import { TransferSessionModel } from "../models/transfer-session.model";
import { TransferSessionStatus } from "../types";

export type CreateTransferSessionData = {
  sessionId: string;
  customerId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  status?: TransferSessionStatus;
  expiresAt: Date;
};

export const transferSessionRepository = {
  async findBySessionId(sessionId: string) {
    return TransferSessionModel.findOne({ sessionId });
  },

  async findByCustomerId(customerId: string, limit = 50) {
    return TransferSessionModel.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(limit);
  },

  async create(data: CreateTransferSessionData) {
    return TransferSessionModel.create(data);
  },

  async updateStatus(sessionId: string, status: TransferSessionStatus) {
    return TransferSessionModel.findOneAndUpdate(
      { sessionId },
      { status },
      { new: true }
    );
  },
};
