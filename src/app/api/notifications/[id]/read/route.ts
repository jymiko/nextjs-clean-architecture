import { NextRequest, NextResponse } from 'next/server';
import { withAuth, RouteContext } from '@/infrastructure/middleware';
import { prisma } from '@/infrastructure/database';
import { handleError } from '@/infrastructure/errors';

interface RouteParams {
  id: string;
}

/**
 * PATCH /api/notifications/[id]/read
 * Mark a specific notification as read
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext<RouteParams>
) {
  try {
    const authenticatedRequest = await withAuth(request);

    if (!authenticatedRequest.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authenticatedRequest.user.userId;
    const params = await context.params;
    const notificationId = params.id;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true, isRead: true },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    if (notification.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot access this notification' },
        { status: 403 }
      );
    }

    // Already read - return success without updating
    if (notification.isRead) {
      return NextResponse.json({
        success: true,
        message: 'Notification already marked as read',
      });
    }

    // Mark as read
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Get updated unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
      unreadCount,
    });
  } catch (error) {
    return handleError(error, request);
  }
}
