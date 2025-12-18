import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { withAuth } from '@/infrastructure/middleware';
import { NotificationType, Priority } from '@prisma/client';

/**
 * POST /api/notifications/test
 * Send a test notification to the current user (for testing purposes)
 * This creates a real notification in the database and sends via Pusher/FCM
 */
export async function POST(request: NextRequest) {
  try {
    const authenticatedRequest = await withAuth(request);

    if (!authenticatedRequest.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authenticatedRequest.user.userId;
    const notificationService = container.cradle.notificationService;

    // Parse optional custom notification data from request body
    let customData: { title?: string; message?: string; priority?: Priority } = {};
    try {
      const body = await request.json();
      customData = body;
    } catch {
      // No body provided, use defaults
    }

    // Create and send notification using the NotificationService
    // This will:
    // 1. Create a notification record in the database
    // 2. Send real-time notification via Pusher (if configured and user has notifyInApp enabled)
    // 3. Send push notification via FCM (if configured and user has notifyPush enabled)
    const notificationId = await notificationService.sendNotification({
      userId,
      type: NotificationType.GENERAL,
      title: customData.title || 'Test Notification',
      message: customData.message || 'This is a test notification to verify the notification system is working correctly.',
      link: '/dashboard',
      priority: customData.priority || Priority.MEDIUM,
    });

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
      notificationId,
      channel: `private-user-${userId}`,
    });
  } catch (error) {
    console.error('[Test Notification] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
