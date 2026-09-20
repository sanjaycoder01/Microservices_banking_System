import { Request, Response, NextFunction } from "express";
import { accountService } from "../services/account.service";
import { CreateAccountDTO } from "../dtos/create-account.dto";
import { AppError } from "../types";

export class AccountController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.accessToken) {
        throw new AppError(401, "Authentication required");
      }

      const dto = req.body as CreateAccountDTO;
      const account = await accountService.createAccount(req.accessToken, dto);

      res.status(201).json({
        message: "Account created successfully",
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.accessToken) {
        throw new AppError(401, "Authentication required");
      }

      const accounts = await accountService.getMyAccounts(req.accessToken);

      res.status(200).json({
        message: "Accounts retrieved successfully",
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.accessToken) {
        throw new AppError(401, "Authentication required");
      }

      const accountId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      if (!accountId) {
        throw new AppError(400, "Account id is required");
      }

      const account = await accountService.getAccountById(
        req.accessToken,
        accountId
      );

      res.status(200).json({
        message: "Account retrieved successfully",
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.accessToken) {
        throw new AppError(401, "Authentication required");
      }

      const accountId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      if (!accountId) {
        throw new AppError(400, "Account id is required");
      }

      const balance = await accountService.getAccountBalance(
        req.accessToken,
        accountId
      );

      res.status(200).json({
        message: "Account balance retrieved successfully",
        data: balance,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const accountController = new AccountController();
