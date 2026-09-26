import { kafka } from "../config/kafka";
import { env } from "../config/env";
import { logger } from "../config/logger";

type TransactionCompletedEvent = {
  eventType: string;
  transactionId: string;
  customerId: string;
  amount: number;
  currency: string;
};

export const startTransactionConsumer = async (): Promise<void> => {
  const consumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID });

  await consumer.connect();
  await consumer.subscribe({
    topic: env.KAFKA_TRANSACTION_TOPIC,
    fromBeginning: false,
  });

  logger.info(
    {
      topic: env.KAFKA_TRANSACTION_TOPIC,
      groupId: env.KAFKA_GROUP_ID,
      broker: env.KAFKA_BROKER,
    },
    "Notification consumer subscribed"
  );

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const raw = message.value?.toString();
      if (!raw) {
        return;
      }

      try {
        const event = JSON.parse(raw) as TransactionCompletedEvent;

        if (event.eventType !== "transaction.completed") {
          logger.debug({ eventType: event.eventType }, "Ignoring event");
          return;
        }

        // Placeholder for email/SMS — log for now.
        logger.info(
          {
            topic,
            partition,
            transactionId: event.transactionId,
            customerId: event.customerId,
            amount: event.amount,
            currency: event.currency,
          },
          `Notification: ₹${event.amount} ${event.currency} transfer completed`
        );
      } catch (err) {
        logger.error({ err, raw }, "Failed to process Kafka message");
      }
    },
  });
};
