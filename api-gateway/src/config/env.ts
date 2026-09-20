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
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  /** Upstream proxy timeout in milliseconds */
  PROXY_TIMEOUT_MS: Number(process.env.PROXY_TIMEOUT_MS) || 10_000,
  /** Global rate limit window */
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  /** Max requests per IP in the global window */
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
  /** Auth endpoints rate limit window */
  AUTH_RATE_LIMIT_WINDOW_MS:
    Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 60_000,
  /** Max login/register attempts per IP in the auth window */
  AUTH_RATE_LIMIT_MAX: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
};
