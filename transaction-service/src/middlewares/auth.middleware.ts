import { Request, Response, NextFunction } from "express";
import { AppError } from "../types";

const COOKIE_NAME = "accessToken";

/** Reads access token from cookie and attaches it for downstream service calls. */
export const requireAccessToken = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;

  if (!token) {
    return next(new AppError(401, "Authentication required"));
  }

  req.accessToken = token;
  next();
};
