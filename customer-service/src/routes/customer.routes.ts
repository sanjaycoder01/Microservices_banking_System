import { Router } from "express";
import { customerController } from "../controllers/customer.controller";
import { kycController } from "../controllers/kyc.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { authMiddleware, requireAdmin } from "../middlewares/auth.middleware";
import { RegisterCustomerDTO } from "../dtos/register.dto";
import { LoginCustomerDTO } from "../dtos/login.dto";
import { UpdateCustomerDTO } from "../dtos/update-customer.dto";
import { SubmitKycDTO } from "../dtos/submit-kyc.dto";
import { UpdateKycStatusDTO } from "../dtos/update-kyc-status.dto";

const router = Router();

router.post(
  "/register",
  validateBody(RegisterCustomerDTO),
  (req, res, next) => customerController.register(req, res, next)
);

router.post(
  "/login",
  validateBody(LoginCustomerDTO),
  (req, res, next) => customerController.login(req, res, next)
);

router.get(
  "/me",
  authMiddleware,
  (req, res, next) => customerController.getMe(req, res, next)
);

router.patch(
  "/me",
  authMiddleware,
  validateBody(UpdateCustomerDTO),
  (req, res, next) => customerController.updateMe(req, res, next)
);

router.post(
  "/me/kyc",
  authMiddleware,
  validateBody(SubmitKycDTO),
  (req, res, next) => kycController.submit(req, res, next)
);

router.get(
  "/me/kyc",
  authMiddleware,
  (req, res, next) => kycController.getMine(req, res, next)
);

router.patch(
  "/:id/kyc/status",
  authMiddleware,
  requireAdmin,
  validateBody(UpdateKycStatusDTO),
  (req, res, next) => kycController.updateStatus(req, res, next)
);

export const customerRoutes = router;
