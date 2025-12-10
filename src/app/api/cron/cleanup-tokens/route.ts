import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredTokens } from '@/infrastructure/auth/refresh-token';
import { revokeToken } from '@/infrastructure/auth';
import { prisma } from '@/infrastructure/database';

/**
 * This endpoint should be called by a cron job to clean up expired tokens
 * Recommended schedule: Run every hour
 * Example cron: 0 * * * *
 */

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a trusted source (e.g., cron job service)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Clean up expired refresh tokens
    await cleanupExpiredTokens();

    // Additional cleanup: Remove orphaned sessions that don't have corresponding refresh tokens
    const now = new Date();

    // Delete expired sessions
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // Optional: Delete very old refresh tokens (older than 90 days) even if not expired
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deletedOldRefreshTokens = await prisma.refreshToken.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Token cleanup completed successfully',
      data: {
        deletedSessionsCount: deletedSessions.count,
        deletedOldRefreshTokensCount: deletedOldRefreshTokens.count,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error during token cleanup:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during token cleanup',
      },
      { status: 500 }
    );
  }
}