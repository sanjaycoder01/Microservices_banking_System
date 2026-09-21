export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** Permanent financial record type */
export type TransactionType = "INTERNAL_TRANSFER" | "EXTERNAL_TRANSFER";

/** Permanent financial record status */
export type TransactionStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

/** Temporary payment-attempt workflow status */
export type TransferSessionStatus =
  | "CREATED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";

export interface TransactionResponse {
  id: string;
  transactionId: string;
  customerId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  idempotencyKey: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransferSessionResponse {
  id: string;
  sessionId: string;
  customerId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  status: TransferSessionStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Minimal create-session API response (no money movement yet). */
export interface CreateTransferSessionResponse {
  sessionId: string;
  status: TransferSessionStatus;
  expiresAt: Date;
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
      user?: {
        sub: string;
        email: string;
        role: "CUSTOMER" | "ADMIN";
      };
    }
  }
}

export {};
