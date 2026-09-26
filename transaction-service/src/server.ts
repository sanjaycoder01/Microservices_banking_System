import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { logger } from "./config/logger";
import { transactionProducer } from "./events/producers/transaction.producer";

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    try {
      await transactionProducer.connect();
    } catch (err) {
      logger.warn(
        { err },
        "Kafka producer failed to connect at startup; will retry on publish"
      );
    }

    const server = app.listen(env.PORT, () => {
      logger.info({ port: env.PORT }, "Transaction service started");
    });

    const shutdown = async (signal: string) => {
      logger.info({ signal }, "Shutting down gracefully");
      await transactionProducer.disconnect().catch(() => undefined);
      server.close(() => {
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start transaction service");
    process.exit(1);
  }
};

startServer();
