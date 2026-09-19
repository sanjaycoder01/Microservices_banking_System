import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      console.log(`Customer service running on port ${env.PORT}`);
    });

    const shutdown = (signal: string) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start customer service:", error);
    process.exit(1);
  }
};

startServer();
