import { Request, Response, NextFunction } from "express";
import { createRequestLogger } from "../config/logger";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  createRequestLogger(req).error(
    {
      err,
      method: req.method,
      url: req.originalUrl || req.url,
    },
    "Gateway unhandled error"
  );

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    message: "Internal server error",
    requestId: req.requestId,
    correlationId: req.correlationId,
  });
};
