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

export interface CustomerAddress {
  line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface CustomerResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: CustomerAddress;
  role: CustomerRole;
  status: CustomerStatus;
  kycStatus: KycStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface KycResponse {
  id: string;
  customerId: string;
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  status: KycStatus;
  rejectionReason?: string;
  submittedAt?: Date;
  verifiedAt?: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
