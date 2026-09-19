import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { CustomerRole } from "../types";

export interface JwtPayload {
  sub: string;
  email: string;
  role: CustomerRole;
}

export const signToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
