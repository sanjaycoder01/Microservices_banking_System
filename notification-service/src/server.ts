import { logger } from "./config/logger";
import { startTransactionConsumer } from "./consumers/transaction.consumer";

const start = async (): Promise<void> => {
  try {
    await startTransactionConsumer();
    logger.info("Notification service started");
  } catch (err) {
    logger.error({ err }, "Failed to start notification service");
    process.exit(1);
  }
};

start();
