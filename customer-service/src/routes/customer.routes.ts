import { Router } from "express";
import { customerController } from "../controllers/customer.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { RegisterCustomerDTO } from "../dtos/register.dto";
import { LoginCustomerDTO } from "../dtos/login.dto";

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

export const customerRoutes = router;
