import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3000,
  CUSTOMER_SERVICE_URL: required("CUSTOMER_SERVICE_URL"),
  ACCOUNT_SERVICE_URL: required("ACCOUNT_SERVICE_URL"),
  TRANSACTION_SERVICE_URL: required("TRANSACTION_SERVICE_URL"),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  /** Upstream proxy timeout in milliseconds */
  PROXY_TIMEOUT_MS: Number(process.env.PROXY_TIMEOUT_MS) || 10_000,
};
