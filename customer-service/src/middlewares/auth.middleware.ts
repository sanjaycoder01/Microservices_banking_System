import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../types";

const COOKIE_NAME = "accessToken";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.[COOKIE_NAME] as string | undefined;

    if (!token) {
      throw new AppError(401, "Authentication required");
    }

    const payload = verifyToken(token);

    req.user = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(new AppError(401, "Invalid or expired token"));
  }
};

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "ADMIN") {
    return next(new AppError(403, "Admin access required"));
  }

  next();
};
