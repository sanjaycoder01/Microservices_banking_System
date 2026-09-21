import { env } from "../config/env";
import { logger } from "../config/logger";
import { AppError } from "../types";

export interface AccountSummary {
  id: string;
  customerId: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  status: "ACTIVE" | "BLOCKED" | "CLOSED";
}

export interface InternalTransferResult {
  transactionId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  sourceBalance: number;
  destinationBalance: number;
}

interface AccountApiResponse {
  message: string;
  data: AccountSummary;
}

interface TransferApiResponse {
  message: string;
  data: InternalTransferResult;
}

export class AccountClient {
  async getAccount(accountId: string): Promise<AccountSummary> {
    const url = `${env.ACCOUNT_SERVICE_URL}/internal/accounts/${accountId}`;

    try {
      const response = await fetch(url);

      if (response.status === 404) {
        throw new AppError(404, "Account not found");
      }

      if (!response.ok) {
        logger.error(
          { status: response.status, accountId },
          "Account service getAccount failed"
        );
        throw new AppError(502, "Account service unavailable");
      }

      const body = (await response.json()) as AccountApiResponse;
      return body.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({ err: error, accountId }, "Failed to call account service");
      throw new AppError(502, "Account service unavailable");
    }
  }

  async transfer(input: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    currency: string;
    transactionId: string;
  }): Promise<InternalTransferResult> {
    const url = `${env.ACCOUNT_SERVICE_URL}/internal/accounts/transfer`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;

        if (response.status >= 400 && response.status < 500) {
          throw new AppError(
            response.status,
            body?.message || "Transfer rejected by account service"
          );
        }

        logger.error(
          { status: response.status },
          "Account service transfer failed"
        );
        throw new AppError(502, "Account service unavailable");
      }

      const body = (await response.json()) as TransferApiResponse;
      return body.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({ err: error }, "Failed to call account service transfer");
      throw new AppError(502, "Account service unavailable");
    }
  }
}

export const accountClient = new AccountClient();
