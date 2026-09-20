export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export type AccountType = "SAVINGS" | "CURRENT";
export type AccountStatus = "ACTIVE" | "BLOCKED" | "CLOSED";

export interface AccountResponse {
  id: string;
  customerId: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountBalanceResponse {
  accountId: string;
  accountNumber: string;
  balance: number;
  currency: string;
  status: AccountStatus;
}

export interface CustomerSummary {
  id: string;
  email: string;
  status: "ACTIVE" | "BLOCKED";
  kycStatus: "PENDING" | "VERIFIED" | "REJECTED";
  role?: "CUSTOMER" | "ADMIN";
}

declare global {
  namespace Express {
    interface Request {
      accessToken?: string;
    }
  }
}

export {};
