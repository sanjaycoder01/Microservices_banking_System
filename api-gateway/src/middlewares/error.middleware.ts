import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error({ err }, "Gateway unhandled error");

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    message: "Internal server error",
  });
};
