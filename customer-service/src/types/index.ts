import { JwtPayload } from "../utils/jwt";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export type CustomerRole = "CUSTOMER" | "ADMIN";
export type CustomerStatus = "ACTIVE" | "BLOCKED";
export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface CustomerResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: CustomerRole;
  status: CustomerStatus;
  kycStatus: KycStatus;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
