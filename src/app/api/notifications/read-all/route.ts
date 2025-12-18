import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/infrastructure/middleware';
import { prisma } from '@/infrastructure/database';
import { handleError } from '@/infrastructure/errors';

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the current user
 */
export async function PATCH(request: NextRequest) {
  try {
    const authenticatedRequest = await withAuth(request);

    if (!authenticatedRequest.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authenticatedRequest.user.userId;

    // Mark all unread notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Marked ${result.count} notifications as read`,
      count: result.count,
      unreadCount: 0,
    });
  } catch (error) {
    return handleError(error, request);
  }
}
