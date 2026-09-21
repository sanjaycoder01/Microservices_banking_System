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

  async findById(id: string) {
    return AccountModel.findById(id);
  }

  async findByCustomerId(customerId: string) {
    return AccountModel.find({ customerId });
  }

  async create(data: CreateAccountData) {
    return AccountModel.create(data);
  }

  /** Debit only if account is ACTIVE and has enough balance. */
  async debitIfSufficient(accountId: string, amount: number) {
    return AccountModel.findOneAndUpdate(
      {
        _id: accountId,
        status: "ACTIVE",
        balance: { $gte: amount },
      },
      { $inc: { balance: -amount } },
      { new: true }
    );
  }

  /** Credit only if account is ACTIVE. */
  async creditIfActive(accountId: string, amount: number) {
    return AccountModel.findOneAndUpdate(
      {
        _id: accountId,
        status: "ACTIVE",
      },
      { $inc: { balance: amount } },
      { new: true }
    );
  }

  /** Used to reverse a debit if credit fails. */
  async creditUnconditionally(accountId: string, amount: number) {
    return AccountModel.findOneAndUpdate(
      { _id: accountId },
      { $inc: { balance: amount } },
      { new: true }
    );
  }
}

export const accountRepository = new AccountRepository();
