import pino from "pino";
import { Request } from "express";
import { env } from "./env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: "api-gateway",
  },
  redact: {
    paths: [
      "password",
      "passwordHash",
      "token",
      "accessToken",
      "authorization",
      "documentNumber",
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
    ],
    remove: true,
  },
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            singleLine: true,
          },
        }
      : undefined,
});

export const createRequestLogger = (req: Request) =>
  logger.child({
    requestId: req.requestId,
    correlationId: req.correlationId,
  });

export const resolveUpstreamService = (url?: string): string | undefined => {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("/api/v1/customers")) {
    return "customer-service";
  }

  if (url.startsWith("/api/v1/accounts")) {
    return "account-service";
  }

  return undefined;
};
