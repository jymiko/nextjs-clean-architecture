import { NextRequest, NextResponse } from 'next/server';
import rateLimit from 'express-rate-limit';

// In-memory store for rate limiting
const store = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
};

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

export const createRateLimitMiddleware = (options: RateLimitOptions = {}) => {
  const { windowMs, max, message } = { ...DEFAULT_OPTIONS, ...options };

  return async (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Create unique key based on IP and window
    const now = Date.now();
    const key = `rate-limit:${ip}:${windowMs}:${max}`;
    const record = store.get(key);

    if (!record || now > record.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs! });
      return null;
    }

    if (record.count >= max!) {
      return NextResponse.json(
        { error: message },
        { status: 429 }
      );
    }

    record.count++;
    return null;
  };
};