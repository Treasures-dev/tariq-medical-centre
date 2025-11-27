// lib/rate-limit.ts
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * checkRateLimit(request, opts)
 * returns { rateLimited: boolean, limit, remaining, reset }
 *
 * Fixed-window implementation using INCR + EXPIRE.
 */
export async function checkRateLimit(request: Request | NextRequest, opts?: {
  keyPrefix?: string;
  limit?: number;
  windowSeconds?: number;
}) {
  const limit = opts?.limit ?? 2;           // requests
  const windowSeconds = opts?.windowSeconds ?? 60; // per N seconds
  const keyPrefix = opts?.keyPrefix ?? 'rl';

  // identify caller (IP preferred). For server-side routes you can use request.headers.get("x-forwarded-for") fallback
  const ip = (request as any).headers?.get?.('x-forwarded-for') ||
             (request as any).headers?.get?.('x-real-ip') ||
             (request as any).headers?.get?.('x-client-ip') ||
             'anon';

  const key = `${keyPrefix}:${ip}`;

  try {
    // INCR the counter
    const count = await redis.incr(key);
    if (count === 1) {
      // set expiry when first created (fixed window)
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key); // seconds until reset
    const remaining = Math.max(0, limit - count);

    const rateLimited = count > limit;

    return {
      rateLimited,
      limit,
      remaining,
      reset: ttl >= 0 ? ttl : windowSeconds,
      count,
    };
  } catch (err) {
    // On Redis failure, fail open (or fail closed if you prefer)
    console.error('Rate limit redis error:', err);
    return { rateLimited: false, limit, remaining: limit, reset: windowSeconds, count: 0 };
  }
}
