import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

export const REQUEST_ID_HEADER = "x-request-id";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const incoming = req.headers[REQUEST_ID_HEADER];
  const requestId =
    typeof incoming === "string" && incoming.length > 0
      ? incoming
      : randomUUID();

  req.headers[REQUEST_ID_HEADER] = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);

  next();
};
