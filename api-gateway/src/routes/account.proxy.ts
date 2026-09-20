import { env } from "../config/env";
import { createServiceProxy } from "./create-service-proxy";

export const accountProxy = createServiceProxy(
  env.ACCOUNT_SERVICE_URL,
  "/api/v1/accounts",
  "account-service"
);
