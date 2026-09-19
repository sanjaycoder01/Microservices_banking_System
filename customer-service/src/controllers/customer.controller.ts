import { Request, Response, NextFunction } from "express";
import { customerService } from "../services/customer.service";
import { RegisterCustomerDTO } from "../dtos/register.dto";
import { LoginCustomerDTO } from "../dtos/login.dto";
import { UpdateCustomerDTO } from "../dtos/update-customer.dto";
import { env } from "../config/env";
import { AppError } from "../types";

const COOKIE_NAME = "accessToken";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

export class CustomerController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as RegisterCustomerDTO;
      const customer = await customerService.register(dto);
      res.status(201).json({
        message: "Customer registered successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as LoginCustomerDTO;
      const { customer, token } = await customerService.login(dto);

      res.cookie(COOKIE_NAME, token, cookieOptions);

      res.status(200).json({
        message: "Login successful",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const customer = await customerService.getMe(req.user.sub);
      res.status(200).json({
        message: "Customer profile retrieved successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const dto = req.body as UpdateCustomerDTO;
      const customer = await customerService.updateMe(req.user.sub, dto);

      res.status(200).json({
        message: "Customer profile updated successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
