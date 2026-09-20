import {
  createProxyMiddleware,
  Options,
  fixRequestBody,
} from "http-proxy-middleware";
import { RequestHandler, Request } from "express";
import { env } from "../config/env";
import { createRequestLogger } from "../config/logger";
import {
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
  getCorrelationId,
  getRequestId,
} from "../middlewares/request-id.middleware";
import { mapProxyError } from "../utils/proxy-error";

export const createServiceProxy = (
  target: string,
  pathPrefix: string,
  serviceName: string
): RequestHandler => {
  const options: Options = {
    target,
    changeOrigin: true,
    cookieDomainRewrite: "",
    pathFilter: pathPrefix,
    // Fail the upstream call if no response within this window.
    proxyTimeout: env.PROXY_TIMEOUT_MS,
    // Fail if the client/proxy socket stalls.
    timeout: env.PROXY_TIMEOUT_MS,
    on: {
      proxyReq: (proxyReq, req) => {
        const request = req as Request;
        const requestId = getRequestId(request);
        const correlationId = getCorrelationId(request);

        if (requestId) {
          proxyReq.setHeader(REQUEST_ID_HEADER, requestId);
        }
        if (correlationId) {
          proxyReq.setHeader(CORRELATION_ID_HEADER, correlationId);
        }

        proxyReq.setTimeout(env.PROXY_TIMEOUT_MS);

        createRequestLogger(request).info(
          {
            upstream: serviceName,
            target,
            method: request.method,
            url: request.originalUrl || request.url,
            timeoutMs: env.PROXY_TIMEOUT_MS,
          },
          "Proxying request to upstream"
        );

        fixRequestBody(proxyReq, req);
      },
      proxyRes: (proxyRes, req) => {
        const request = req as Request;

        createRequestLogger(request).info(
          {
            upstream: serviceName,
            statusCode: proxyRes.statusCode,
            method: request.method,
            url: request.originalUrl || request.url,
          },
          "Received upstream response"
        );
      },
      error: (err, req, res) => {
        const request = req as Request;
        const mapped = mapProxyError(
          err as Error & { code?: string },
          serviceName
        );

        createRequestLogger(request).error(
          {
            err,
            upstream: serviceName,
            method: req.method,
            url: req.url,
            errorKind: mapped.kind,
            errorCode: mapped.code,
            statusCode: mapped.statusCode,
            timeoutMs: env.PROXY_TIMEOUT_MS,
          },
          mapped.kind === "TIMEOUT"
            ? "Upstream service timed out"
            : "Upstream service proxy error"
        );

        const response = res as import("http").ServerResponse;
        if (!response.headersSent) {
          response.writeHead(mapped.statusCode, {
            "Content-Type": "application/json",
          });
          response.end(
            JSON.stringify({
              message: mapped.message,
              code: mapped.code,
              service: serviceName,
              requestId: getRequestId(request),
              correlationId: getCorrelationId(request),
            })
          );
        }
      },
    },
  };

  return createProxyMiddleware(options);
};
