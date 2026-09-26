import { Kafka, logLevel } from "kafkajs";
import { env } from "./env";

export const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: [env.KAFKA_BROKER],
  logLevel: env.NODE_ENV === "development" ? logLevel.WARN : logLevel.ERROR,
});
