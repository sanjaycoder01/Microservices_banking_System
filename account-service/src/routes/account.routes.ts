import { Router } from "express";
import { accountController } from "../controllers/account.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { requireAccessToken } from "../middlewares/auth.middleware";
import { CreateAccountDTO } from "../dtos/create-account.dto";

const router = Router();

router.post(
  "/",
  requireAccessToken,
  validateBody(CreateAccountDTO),
  (req, res, next) => accountController.create(req, res, next)
);

router.get(
  "/me",
  requireAccessToken,
  (req, res, next) => accountController.getMine(req, res, next)
);

export const accountRoutes = router;
