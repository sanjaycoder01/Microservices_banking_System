import { env } from "../config/env";
import { createServiceProxy } from "./create-service-proxy";

export const transactionProxy = createServiceProxy(
  env.TRANSACTION_SERVICE_URL,
  "/api/v1/transactions",
  "transaction-service"
);
