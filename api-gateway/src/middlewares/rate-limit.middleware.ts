import { Request, Response, NextFunction } from "express";

// Placeholder for future rate limiting (e.g. express-rate-limit).
export const rateLimitMiddleware = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  next();
};
