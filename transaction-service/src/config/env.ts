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
  PORT: Number(process.env.PORT) || 3003,
  MONGODB_URI: required("MONGODB_URI"),
  ACCOUNT_SERVICE_URL: required("ACCOUNT_SERVICE_URL"),
  CUSTOMER_SERVICE_URL: required("CUSTOMER_SERVICE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};
