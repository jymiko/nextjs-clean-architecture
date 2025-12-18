import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/infrastructure/middleware';
import { prisma } from '@/infrastructure/database';
import { handleError } from '@/infrastructure/errors';

/**
 * GET /api/notifications
 * Retrieve notifications for the current user with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const authenticatedRequest = await withAuth(request);

    if (!authenticatedRequest.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authenticatedRequest.user.userId;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Validate pagination
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(100, Math.max(1, limit));
    const skip = (validatedPage - 1) * validatedLimit;

    // Build where clause
    const whereClause = {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    };

    // Fetch notifications and count in parallel
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: validatedLimit,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          link: true,
          priority: true,
          isRead: true,
          readAt: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where: whereClause }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / validatedLimit);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          totalCount,
          totalPages,
          hasMore: validatedPage < totalPages,
        },
        unreadCount,
      },
    });
  } catch (error) {
    return handleError(error, request);
  }
}
