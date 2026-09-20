import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

export const REQUEST_ID_HEADER = "x-request-id";
export const CORRELATION_ID_HEADER = "x-correlation-id";

const readHeader = (value: string | string[] | undefined): string | undefined => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return undefined;
};

/**
 * Ensures every request has a stable correlation/request id.
 * - Reuses client-provided x-request-id or x-correlation-id when present
 * - Otherwise generates a UUID
 * - Sets both headers on the request and response for end-to-end tracing
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const incomingRequestId = readHeader(req.headers[REQUEST_ID_HEADER]);
  const incomingCorrelationId = readHeader(req.headers[CORRELATION_ID_HEADER]);

  const correlationId =
    incomingCorrelationId || incomingRequestId || randomUUID();

  // Keep request-id aligned with correlation-id for this hop unless client sent both.
  const requestId = incomingRequestId || correlationId;

  req.headers[REQUEST_ID_HEADER] = requestId;
  req.headers[CORRELATION_ID_HEADER] = correlationId;

  req.requestId = requestId;
  req.correlationId = correlationId;

  res.setHeader(REQUEST_ID_HEADER, requestId);
  res.setHeader(CORRELATION_ID_HEADER, correlationId);

  next();
};

export const getRequestId = (req: Request): string | undefined =>
  req.requestId || readHeader(req.headers[REQUEST_ID_HEADER]);

export const getCorrelationId = (req: Request): string | undefined =>
  req.correlationId || readHeader(req.headers[CORRELATION_ID_HEADER]);
