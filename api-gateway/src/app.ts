import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { requestIdMiddleware } from "./middlewares/request-id.middleware";
import { httpLoggerMiddleware } from "./middlewares/http-logger.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { customerProxy } from "./routes/customer.proxy";
import { accountProxy } from "./routes/account.proxy";
import { transactionProxy } from "./routes/transaction.proxy";

const app = express();

// Needed so client IP is correct behind proxies/load balancers.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());

// 1) Correlation / request id
app.use(requestIdMiddleware);

// 2) Centralized HTTP access logs
app.use(httpLoggerMiddleware);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "api-gateway",
  });
});

// Do not use express.json() before proxies — keep the raw body stream intact.
app.use(customerProxy);
app.use(accountProxy);
app.use(transactionProxy);

app.use(errorMiddleware);

export default app;
