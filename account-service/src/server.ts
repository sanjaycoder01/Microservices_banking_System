import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { logger } from "./config/logger";

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info({ port: env.PORT }, "Account service started");
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
    logger.error({ err: error }, "Failed to start account service");
    process.exit(1);
  }
};

startServer();
