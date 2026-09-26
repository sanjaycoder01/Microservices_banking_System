import { kafka } from "../src/config/kafka";
import { env } from "../src/config/env";
import { logger } from "../src/config/logger";

/**
 * One-time admin: create transaction.events topic + partitions.
 * Run: npm run kafka:create-topics
 */
async function createTopics() {
  const admin = kafka.admin();

  logger.info("Kafka admin connecting...");
  await admin.connect();
  logger.info("Kafka admin connected");

  const topic = env.KAFKA_TRANSACTION_TOPIC;
  const numPartitions = env.KAFKA_TRANSACTION_PARTITIONS;

  logger.info({ topic, numPartitions }, "Creating Kafka topic");

  const created = await admin.createTopics({
    topics: [
      {
        topic,
        numPartitions,
        replicationFactor: 1,
      },
    ],
  });

  if (created) {
    logger.info({ topic }, "Topic created successfully");
  } else {
    logger.info({ topic }, "Topic already exists (no change)");
  }

  const meta = await admin.fetchTopicMetadata({ topics: [topic] });
  logger.info(
    {
      topics: meta.topics.map((t) => ({
        name: t.name,
        partitions: t.partitions.length,
      })),
    },
    "Topic metadata"
  );

  await admin.disconnect();
  logger.info("Kafka admin disconnected");
}

createTopics().catch((err) => {
  logger.error({ err }, "Failed to create Kafka topics");
  process.exit(1);
});
