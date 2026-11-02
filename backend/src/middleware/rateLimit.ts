import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * The visitor's own address. Requests reach this server through Vercel's rewrite and then Render's proxy,
 * so `req.ip` is a Vercel address shared by every visitor and a per-address limit on it would lock out
 * everyone at once. Vercel sets the first `X-Forwarded-For` entry to the real client.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim();
  return first || req.ip || "unknown";
}

type Bucket = { count: number; resetAt: number };

/**
 * A fixed-window counter per visitor address, kept in memory (one server, so no shared store needed).
 * Limits are set well above normal use: they stop scripts, not people sharing a school network.
 */
export function rateLimit(options: { name: string; windowMs: number; max: number }): RequestHandler {
  const buckets = new Map<string, Bucket>();
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) if (bucket.resetAt < now) buckets.delete(key);
  }, 60_000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = clientIp(req);
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: now + options.windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > options.max) {
      res.set("Retry-After", String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
      res.status(429).json({ error: "rate_limited", scope: options.name });
      return;
    }
    next();
  };
}
