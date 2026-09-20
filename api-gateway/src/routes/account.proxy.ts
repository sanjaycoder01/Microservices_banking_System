import {
  createProxyMiddleware,
  Options,
  fixRequestBody,
} from "http-proxy-middleware";
import { RequestHandler } from "express";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { REQUEST_ID_HEADER } from "../middlewares/request-id.middleware";

const createServiceProxy = (
  target: string,
  pathPrefix: string,
  serviceName: string
): RequestHandler => {
  const options: Options = {
    target,
    changeOrigin: true,
    cookieDomainRewrite: "",
    pathFilter: pathPrefix,
    on: {
      proxyReq: (proxyReq, req) => {
        const requestId = req.headers[REQUEST_ID_HEADER];
        if (typeof requestId === "string") {
          proxyReq.setHeader(REQUEST_ID_HEADER, requestId);
        }

        fixRequestBody(proxyReq, req);
      },
      error: (err, req, res) => {
        logger.error(
          {
            err,
            service: serviceName,
            method: req.method,
            url: req.url,
          },
          "Upstream service proxy error"
        );

        const response = res as import("http").ServerResponse;
        if (!response.headersSent) {
          response.writeHead(502, { "Content-Type": "application/json" });
          response.end(
            JSON.stringify({
              message: `${serviceName} unavailable`,
            })
          );
        }
      },
    },
  };

  return createProxyMiddleware(options);
};

export const accountProxy = createServiceProxy(
  env.ACCOUNT_SERVICE_URL,
  "/api/v1/accounts",
  "account-service"
);
