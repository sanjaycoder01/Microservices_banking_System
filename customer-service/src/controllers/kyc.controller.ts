import { Request, Response, NextFunction } from "express";
import { kycService } from "../services/kyc.service";
import { SubmitKycDTO } from "../dtos/submit-kyc.dto";
import { UpdateKycStatusDTO } from "../dtos/update-kyc-status.dto";
import { AppError } from "../types";

export class KycController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const dto = req.body as SubmitKycDTO;
      const kyc = await kycService.submit(req.user.sub, dto);

      res.status(201).json({
        message: "KYC submitted successfully",
        data: kyc,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const kyc = await kycService.getByCustomerId(req.user.sub);

      res.status(200).json({
        message: "KYC retrieved successfully",
        data: kyc,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        throw new AppError(400, "Customer id is required");
      }

      const dto = req.body as UpdateKycStatusDTO;
      const kyc = await kycService.updateStatus(id, dto);

      res.status(200).json({
        message: "KYC status updated successfully",
        data: kyc,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const kycController = new KycController();
