import mongoose, { ClientSession } from "mongoose";
import { AccountModel } from "../models/account.model";
import { AccountType } from "../types";

export interface CreateAccountData {
  customerId: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  status: "ACTIVE";
}

export class AccountRepository {
  async findByAccountNumber(accountNumber: string) {
    return AccountModel.findOne({ accountNumber });
  }

  async findById(id: string, session?: ClientSession) {
    return AccountModel.findById(id).session(session ?? null);
  }

  async findByCustomerId(customerId: string) {
    return AccountModel.find({ customerId });
  }

  async create(data: CreateAccountData) {
    return AccountModel.create(data);
  }

  /** Debit only if account is ACTIVE and has enough balance. */
  async debitIfSufficient(
    accountId: string,
    amount: number,
    session?: ClientSession
  ) {
    return AccountModel.findOneAndUpdate(
      {
        _id: accountId,
        status: "ACTIVE",
        balance: { $gte: amount },
      },
      { $inc: { balance: -amount } },
      { new: true, session }
    );
  }

  /** Credit only if account is ACTIVE. */
  async creditIfActive(
    accountId: string,
    amount: number,
    session?: ClientSession
  ) {
    return AccountModel.findOneAndUpdate(
      {
        _id: accountId,
        status: "ACTIVE",
      },
      { $inc: { balance: amount } },
      { new: true, session }
    );
  }
}

export const accountRepository = new AccountRepository();

/** Runs work inside a MongoDB multi-document transaction (requires replica set). */
export const withMongoTransaction = async <T>(
  work: (session: ClientSession) => Promise<T>
): Promise<T> => {
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};
