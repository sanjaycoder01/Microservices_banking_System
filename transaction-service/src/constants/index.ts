export const TRANSACTION_TYPES = [
  "INTERNAL_TRANSFER",
  "EXTERNAL_TRANSFER",
] as const;

export const TRANSACTION_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
] as const;

export const TRANSFER_SESSION_STATUSES = [
  "CREATED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "EXPIRED",
] as const;

/** Default session TTL before EXPIRED (minutes). */
export const TRANSFER_SESSION_TTL_MINUTES = 15;

export const DEFAULT_CURRENCY = "INR";

export const IDEMPOTENCY_HEADER = "idempotency-key";
