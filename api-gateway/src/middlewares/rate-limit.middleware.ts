import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { env } from "../config/env";
import { createRequestLogger } from "../config/logger";

const buildRateLimitHandler =
  (code: string, message: string) => (req: Request, res: Response) => {
    createRequestLogger(req).warn(
      {
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip,
        code,
      },
      "Rate limit exceeded"
    );

    res.status(429).json({
      message,
      code,
      requestId: req.requestId,
      correlationId: req.correlationId,
    });
  };

/** Global limit for all gateway traffic (except /health). */
export const rateLimitMiddleware = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: (req) => {
    const path = req.path || "";
    return path === "/health";
  },
  handler: buildRateLimitHandler(
    "RATE_LIMIT_EXCEEDED",
    "Too many requests, please try again later"
  ),
});

/** Stricter limit for auth endpoints (login/register). */
export const authRateLimitMiddleware = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: (req) => {
    const url = req.originalUrl || req.url || "";
    return !(
      url.includes("/api/v1/customers/login") ||
      url.includes("/api/v1/customers/register")
    );
  },
  handler: buildRateLimitHandler(
    "AUTH_RATE_LIMIT_EXCEEDED",
    "Too many authentication attempts, please try again later"
  ),
});
