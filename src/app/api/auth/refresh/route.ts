import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { refreshAccessToken } from '@/infrastructure/auth/refresh-token';
import { UnauthorizedError } from '@/infrastructure/errors';

// Input validation schema
const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Create rate limiter instance
const rateLimiter = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 refresh requests per windowMs
});

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = refreshSchema.parse(body);

    // Get device ID from request headers or generate one
    const deviceId = request.headers.get('x-device-id') || undefined;

    // Refresh the access token
    const tokenPair = await refreshAccessToken(refreshToken, deviceId);

    if (!tokenPair) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    return NextResponse.json({
      success: true,
      data: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        tokenType: 'Bearer',
        expiresIn: 900, // 15 minutes in seconds
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Apply rate limiting to the refresh endpoint
export async function POST(request: NextRequest) {
  // Rate limiting check
  const rateLimitResponse = await rateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  return postHandler(request);
}