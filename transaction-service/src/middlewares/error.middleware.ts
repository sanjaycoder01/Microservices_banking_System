import { Request, Response, NextFunction } from "express";
import { AppError } from "../types";
import { logger } from "../config/logger";

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn(
      { statusCode: err.statusCode, message: err.message },
      "Request handled with application error"
    );

    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  logger.error({ err }, "Unhandled error");

  return res.status(500).json({
    message: "Internal server error",
  });
};
