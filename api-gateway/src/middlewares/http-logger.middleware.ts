import express from "express";
import pinoHttp from "pino-http";
import {
  createRequestLogger,
  logger,
  resolveUpstreamService,
} from "../config/logger";
import {
  getCorrelationId,
  getRequestId,
} from "./request-id.middleware";

export const httpLoggerMiddleware = pinoHttp({
  logger,
  genReqId: (req) => getRequestId(req as express.Request) || "unknown",
  autoLogging: {
    ignore: (req) => {
      const url = req.url || "";
      return url === "/health" || url.startsWith("/health?");
    },
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) {
      return "error";
    }
    if (res.statusCode >= 400) {
      return "warn";
    }
    return "info";
  },
  customSuccessMessage: (req, res) => {
    const upstream = resolveUpstreamService(req.url);
    const target = upstream ? ` via ${upstream}` : "";
    return `${req.method} ${req.url} ${res.statusCode}${target}`;
  },
  customErrorMessage: (req, res) =>
    `${req.method} ${req.url} ${res.statusCode} failed`,
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
  customProps: (req) => {
    const request = req as express.Request;
    return {
      requestId: getRequestId(request),
      correlationId: getCorrelationId(request),
      upstream: resolveUpstreamService(request.url),
    };
  },
});

export { createRequestLogger };
