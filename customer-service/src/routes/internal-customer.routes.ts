import { Router } from "express";
import { customerController } from "../controllers/customer.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/me",
  authMiddleware,
  (req, res, next) => customerController.getMe(req, res, next)
);

router.get("/:id", (req, res, next) =>
  customerController.getById(req, res, next)
);

export const internalCustomerRoutes = router;
