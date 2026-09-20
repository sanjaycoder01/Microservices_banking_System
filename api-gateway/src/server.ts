import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

const startServer = (): void => {
  try {
    const server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          customerServiceUrl: env.CUSTOMER_SERVICE_URL,
          accountServiceUrl: env.ACCOUNT_SERVICE_URL,
        },
        "API Gateway started"
      );
    });

    const shutdown = (signal: string) => {
      logger.info({ signal }, "Shutting down gracefully");
      server.close(() => {
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error({ err: error }, "Failed to start API Gateway");
    process.exit(1);
  }
};

startServer();
