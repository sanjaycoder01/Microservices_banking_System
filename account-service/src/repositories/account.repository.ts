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
}

export const accountRepository = new AccountRepository();
