import { CreateAccountDTO } from "../dtos/create-account.dto";
import { accountRepository } from "../repositories/account.repository";
import { customerClient } from "../clients/customer.client";
import { generateAccountNumber } from "../utils/account-number";
import {
  AppError,
  AccountBalanceResponse,
  AccountResponse,
  CustomerSummary,
} from "../types";
import { logger } from "../config/logger";

const toAccountResponse = (account: {
  _id: { toString(): string };
  customerId: { toString(): string };
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): AccountResponse => ({
  id: account._id.toString(),
  customerId: account.customerId.toString(),
  accountNumber: account.accountNumber,
  accountType: account.accountType as AccountResponse["accountType"],
  balance: account.balance,
  currency: account.currency,
  status: account.status as AccountResponse["status"],
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
});

export class AccountService {
  async createAccount(
    accessToken: string,
    dto: CreateAccountDTO
  ): Promise<AccountResponse> {
    try {
      const customer = await customerClient.getAuthenticatedCustomer(accessToken);

      if (customer.status !== "ACTIVE") {
        throw new AppError(403, "Customer account is not active");
      }

      if (customer.kycStatus !== "VERIFIED") {
        throw new AppError(
          403,
          "Customer KYC must be verified before opening an account"
        );
      }

      const accountNumber = await this.generateUniqueAccountNumber();

      const account = await accountRepository.create({
        customerId: customer.id,
        accountNumber,
        accountType: dto.accountType,
        balance: 0,
        currency: "INR",
        status: "ACTIVE",
      });

      logger.info(
        {
          accountId: account._id.toString(),
          customerId: customer.id,
          accountType: dto.accountType,
        },
        "Account created"
      );

      return toAccountResponse(account);
    } catch (error) {
      if (!(error instanceof AppError)) {
        logger.error({ err: error }, "Account creation failed");
      }
      throw error;
    }
  }

  async getMyAccounts(accessToken: string): Promise<AccountResponse[]> {
    try {
      const customer = await customerClient.getAuthenticatedCustomer(accessToken);
      const accounts = await accountRepository.findByCustomerId(customer.id);

      logger.info(
        { customerId: customer.id, count: accounts.length },
        "Customer accounts listed"
      );

      return accounts.map(toAccountResponse);
    } catch (error) {
      if (!(error instanceof AppError)) {
        logger.error({ err: error }, "Failed to list customer accounts");
      }
      throw error;
    }
  }

  async getAccountById(
    accessToken: string,
    accountId: string
  ): Promise<AccountResponse> {
    try {
      const account = await this.getOwnedAccount(accessToken, accountId);
      return toAccountResponse(account);
    } catch (error) {
      if (!(error instanceof AppError)) {
        logger.error({ err: error, accountId }, "Failed to get account");
      }
      throw error;
    }
  }

  async getAccountBalance(
    accessToken: string,
    accountId: string
  ): Promise<AccountBalanceResponse> {
    try {
      const account = await this.getOwnedAccount(accessToken, accountId);

      return {
        accountId: account._id.toString(),
        accountNumber: account.accountNumber,
        balance: account.balance,
        currency: account.currency,
        status: account.status as AccountBalanceResponse["status"],
      };
    } catch (error) {
      if (!(error instanceof AppError)) {
        logger.error({ err: error, accountId }, "Failed to get account balance");
      }
      throw error;
    }
  }

  private async getOwnedAccount(accessToken: string, accountId: string) {
    const customer = await customerClient.getAuthenticatedCustomer(accessToken);
    const account = await accountRepository.findById(accountId);

    if (!account) {
      throw new AppError(404, "Account not found");
    }

    this.assertAccountAccess(customer, account.customerId.toString());

    return account;
  }

  private assertAccountAccess(customer: CustomerSummary, accountCustomerId: string) {
    if (customer.role === "ADMIN") {
      return;
    }

    if (accountCustomerId !== customer.id) {
      throw new AppError(403, "You do not have access to this account");
    }
  }

  private async generateUniqueAccountNumber(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const accountNumber = generateAccountNumber();
      const existing =
        await accountRepository.findByAccountNumber(accountNumber);
      if (!existing) {
        return accountNumber;
      }
    }

    throw new AppError(500, "Failed to generate unique account number");
  }
}

export const accountService = new AccountService();
