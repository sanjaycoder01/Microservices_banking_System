import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { requireAccessToken } from "../middlewares/auth.middleware";
import { CreateTransferSessionDTO } from "../dtos/create-transfer-session.dto";
import { ProcessTransferDTO } from "../dtos/process-transfer.dto";

const router = Router();

/**
 * POST /api/v1/transactions/sessions
 * Validates source/destination accounts, then creates CREATED session.
 * Does not move money.
 */
router.post(
  "/sessions",
  requireAccessToken,
  validateBody(CreateTransferSessionDTO),
  (req, res, next) => transactionController.createSession(req, res, next)
);

/**
 * POST /api/v1/transactions/transfers
 * Uses stored session data; moves money via Account Service.
 * Requires Idempotency-Key header.
 */
router.post(
  "/transfers",
  requireAccessToken,
  validateBody(ProcessTransferDTO),
  (req, res, next) => transactionController.processTransfer(req, res, next)
);

/**
 * GET /api/v1/transactions
 * Lists the authenticated customer's transactions.
 */
router.get(
  "/",
  requireAccessToken,
  (req, res, next) => transactionController.listMine(req, res, next)
);

/**
 * GET /api/v1/transactions/:transactionId
 * Returns one transaction owned by the authenticated customer.
 */
router.get(
  "/:transactionId",
  requireAccessToken,
  (req, res, next) => transactionController.getById(req, res, next)
);

export const transactionRoutes = router;
