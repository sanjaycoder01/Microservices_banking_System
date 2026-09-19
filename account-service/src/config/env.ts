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
  PORT: Number(process.env.PORT) || 3002,
  MONGODB_URI: required("MONGODB_URI"),
  CUSTOMER_SERVICE_URL: required("CUSTOMER_SERVICE_URL"),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};
