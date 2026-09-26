import { Producer } from "kafkajs";
import { kafka } from "../../config/kafka";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { TransactionCompletedEvent } from "../types";

let producer: Producer | null = null;
let connected = false;

export const transactionProducer = {
  async connect(): Promise<void> {
    if (connected && producer) {
      return;
    }

    producer = kafka.producer();
    await producer.connect();
    connected = true;
    logger.info(
      { broker: env.KAFKA_BROKER, topic: env.KAFKA_TRANSACTION_TOPIC },
      "Kafka producer connected"
    );
  },

  async disconnect(): Promise<void> {
    if (producer && connected) {
      await producer.disconnect();
      connected = false;
      producer = null;
      logger.info("Kafka producer disconnected");
    }
  },

  /**
   * Publishes transaction.completed. Failures are logged only —
   * transfer money already moved; notification must not fail the API.
   */
  async publishCompleted(
    event: Omit<TransactionCompletedEvent, "eventType" | "occurredAt">
  ): Promise<void> {
    try {
      if (!producer || !connected) {
        await this.connect();
      }

      const payload: TransactionCompletedEvent = {
        eventType: "transaction.completed",
        occurredAt: new Date().toISOString(),
        ...event,
      };

      await producer!.send({
        topic: env.KAFKA_TRANSACTION_TOPIC,
        messages: [
          {
            key: event.transactionId,
            value: JSON.stringify(payload),
          },
        ],
      });

      logger.info(
        { transactionId: event.transactionId, topic: env.KAFKA_TRANSACTION_TOPIC },
        "Published transaction.completed event"
      );
    } catch (err) {
      logger.error(
        { err, transactionId: event.transactionId },
        "Failed to publish transaction.completed (transfer still succeeded)"
      );
    }
  },
};
