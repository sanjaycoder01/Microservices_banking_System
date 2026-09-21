import { Router } from "express";
import { accountController } from "../controllers/account.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { InternalTransferDTO } from "../dtos/internal-transfer.dto";

const router = Router();

/** Service-to-service: debit source + credit destination. */
router.post(
  "/transfer",
  validateBody(InternalTransferDTO),
  (req, res, next) => accountController.transferInternal(req, res, next)
);

/** Service-to-service: get any account by id (no ownership check). */
router.get("/:id", (req, res, next) =>
  accountController.getByIdInternal(req, res, next)
);

export const internalAccountRoutes = router;
