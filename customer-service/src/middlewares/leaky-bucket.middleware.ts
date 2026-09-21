import { Request, Response, NextFunction } from "express";

type Bucket = {
  level: number;
  lastLeakAt: number;
};

type LeakyBucketOptions = {
  capacity: number;
  leakRate: number;
  message: string;
  /** Prefix so auth and global buckets do not share state. */
  keyPrefix?: string;
  /** One or more keys to enforce (e.g. IP and email). Defaults to IP. */
  resolveKeys?: (req: Request) => string[];
};

const IDLE_TTL_MS = 60_000;

const getIpKey = (req: Request): string =>
  req.ip || req.socket.remoteAddress || "unknown";

const getEmailKey = (req: Request): string => {
  const email =
    typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  return email || "missing-email";
};

const leak = (bucket: Bucket, now: number, leakRate: number): void => {
  const elapsedSec = (now - bucket.lastLeakAt) / 1000;
  bucket.level = Math.max(0, bucket.level - elapsedSec * leakRate);
  bucket.lastLeakAt = now;
};

/**
 * Factory for leaky-bucket rate limiters.
 * Capacity = max burst; leakRate = sustained requests per second.
 * When multiple keys are returned, every key must have room or the request is rejected.
 */
export const createLeakyBucketMiddleware = (options: LeakyBucketOptions) => {
  const {
    capacity,
    leakRate,
    message,
    keyPrefix = "default",
    resolveKeys = (req) => [getIpKey(req)],
  } = options;
  const buckets = new Map<string, Bucket>();

  const pruneIdleBuckets = (now: number): void => {
    for (const [key, bucket] of buckets) {
      const elapsedMs = now - bucket.lastLeakAt;
      const level = Math.max(0, bucket.level - (elapsedMs / 1000) * leakRate);
      if (level === 0 && elapsedMs >= IDLE_TTL_MS) {
        buckets.delete(key);
      }
    }
  };

  const getOrCreateBucket = (key: string, now: number): Bucket => {
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { level: 0, lastLeakAt: now };
      buckets.set(key, bucket);
    }
    return bucket;
  };

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const keys = resolveKeys(req).map((part) => `${keyPrefix}:${part}`);

    if (buckets.size > 1_000) {
      pruneIdleBuckets(now);
    }

    const resolved = keys.map((key) => {
      const bucket = getOrCreateBucket(key, now);
      leak(bucket, now, leakRate);
      return bucket;
    });

    const blocked = resolved.find((bucket) => bucket.level + 1 > capacity);
    if (blocked) {
      const retryAfterSec = Math.ceil((blocked.level + 1 - capacity) / leakRate);
      res.setHeader("Retry-After", String(Math.max(1, retryAfterSec)));
      return res.status(429).json({ message });
    }

    for (const bucket of resolved) {
      bucket.level += 1;
    }

    next();
  };
};

/**
 * Auth limit for login/register: burst 3, then ~3 req/s.
 * Enforced independently per IP and per email (either can trigger 429).
 */
export const authLeakyBucketMiddleware = createLeakyBucketMiddleware({
  capacity: 3,
  leakRate: 3,
  keyPrefix: "auth",
  resolveKeys: (req) => [`ip:${getIpKey(req)}`, `email:${getEmailKey(req)}`],
  message: "Too many authentication attempts, please try again later",
});

/** Global limit for public customer API: burst 100, ~100 req/min sustained per IP. */
export const globalLeakyBucketMiddleware = createLeakyBucketMiddleware({
  capacity: 100,
  leakRate: 100 / 60,
  keyPrefix: "global",
  resolveKeys: (req) => [getIpKey(req)],
  message: "Too many requests, please try again later",
});
