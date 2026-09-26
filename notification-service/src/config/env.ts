import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  KAFKA_BROKER: process.env.KAFKA_BROKER || "localhost:9092",
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID || "notification-service",
  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || "notification-service",
  KAFKA_TRANSACTION_TOPIC:
    process.env.KAFKA_TRANSACTION_TOPIC || "transaction.events",
};
