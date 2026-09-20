import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { logger } from "./config/logger";
import { requestIdMiddleware } from "./middlewares/request-id.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { customerProxy } from "./routes/customer.proxy";
import { accountProxy } from "./routes/account.proxy";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(requestIdMiddleware);
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
    service: "api-gateway",
  });
});

// Do not use express.json() before proxies — keep the raw body stream intact.
app.use(customerProxy);
app.use(accountProxy);

app.use(errorMiddleware);

export default app;
