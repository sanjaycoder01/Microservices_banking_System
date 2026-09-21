import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { logger } from "./config/logger";
import { customerRoutes } from "./routes/customer.routes";
import { internalCustomerRoutes } from "./routes/internal-customer.routes";
import { globalLeakyBucketMiddleware } from "./middlewares/leaky-bucket.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

// Needed so rate limiting uses the real client IP behind the API gateway.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/health",
    },
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "customer-service",
  });
});

app.use("/api/v1/customers", globalLeakyBucketMiddleware, customerRoutes);
app.use("/internal/customers", internalCustomerRoutes);

app.use(errorMiddleware);

export default app;
