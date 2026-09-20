export type ProxyErrorKind = "TIMEOUT" | "UNAVAILABLE" | "PROXY_ERROR";

export interface MappedProxyError {
  kind: ProxyErrorKind;
  statusCode: number;
  code: string;
  message: string;
}

const TIMEOUT_CODES = new Set([
  "ETIMEDOUT",
  "ESOCKETTIMEDOUT",
  "ECONNRESET",
]);

const UNAVAILABLE_CODES = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
]);

export const mapProxyError = (
  err: Error & { code?: string },
  serviceName: string
): MappedProxyError => {
  const code = err.code || "PROXY_ERROR";

  if (TIMEOUT_CODES.has(code) || /timeout/i.test(err.message)) {
    return {
      kind: "TIMEOUT",
      statusCode: 504,
      code: "GATEWAY_TIMEOUT",
      message: `${serviceName} did not respond in time`,
    };
  }

  if (UNAVAILABLE_CODES.has(code)) {
    return {
      kind: "UNAVAILABLE",
      statusCode: 502,
      code: "SERVICE_UNAVAILABLE",
      message: `${serviceName} is unavailable`,
    };
  }

  return {
    kind: "PROXY_ERROR",
    statusCode: 502,
    code: "BAD_GATEWAY",
    message: `${serviceName} request failed`,
  };
};
