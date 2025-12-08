import { NextRequest, NextResponse } from 'next/server';
import rateLimit from 'express-rate-limit';

// In-memory store for rate limiting
const store = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom store for edge compatibility
  store: {
    incr: async (key: string) => {
      const now = Date.now();
      const record = store.get(key);

      if (!record || now > record.resetTime) {
        store.set(key, { count: 1, resetTime: now + 15 * 60 * 1000 });
        return 1;
      }

      record.count++;
      return record.count;
    },
    decrement: async (key: string) => {
      const record = store.get(key);
      if (record && record.count > 0) {
        record.count--;
      }
    },
    resetKey: async (key: string) => {
      store.delete(key);
    },
  },
});

export const createRateLimitMiddleware = () => {
  return async (request: NextRequest) => {
    const ip = request.ip ||
               request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Simulate rate limiting check
    const now = Date.now();
    const key = `rate-limit:${ip}`;
    const record = store.get(key);

    if (!record || now > record.resetTime) {
      store.set(key, { count: 1, resetTime: now + 15 * 60 * 1000 });
      return null;
    }

    if (record.count >= 100) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }

    record.count++;
    return null;
  };
};