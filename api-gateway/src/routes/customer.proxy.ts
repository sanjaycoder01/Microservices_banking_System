import { env } from "../config/env";
import { createServiceProxy } from "./create-service-proxy";

export const customerProxy = createServiceProxy(
  env.CUSTOMER_SERVICE_URL,
  "/api/v1/customers",
  "customer-service"
);
