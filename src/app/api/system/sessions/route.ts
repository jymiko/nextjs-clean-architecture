import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { withAuthHandler } from '@/infrastructure/middleware/auth';
import { ZodError, ZodIssue } from 'zod';

const rateLimiter = createRateLimitMiddleware();

export const GET = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search') || undefined,
      userId: searchParams.get('userId') || undefined,
      isActive: searchParams.get('isActive') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    // TODO: Implement SystemSessionService
    // const sessionService = container.cradle.systemSessionService;
    // const result = await sessionService.findAll(queryParams);

    // Mock response with active sessions
    const mockSessions = [
      {
        id: 'sess_1',
        userId: 'user_1',
        userName: 'John Doe',
        email: 'john@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        loginTime: new Date(Date.now() - 3600000).toISOString(),
        lastActivity: new Date(Date.now() - 60000).toISOString(),
        isActive: true,
        expiresAt: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
        deviceInfo: {
          platform: 'Windows',
          browser: 'Chrome',
          version: '119.0.0.0'
        },
        location: {
          country: 'Indonesia',
          city: 'Jakarta'
        }
      },
      {
        id: 'sess_2',
        userId: 'user_2',
        userName: 'Jane Smith',
        email: 'jane@example.com',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        loginTime: new Date(Date.now() - 7200000).toISOString(),
        lastActivity: new Date(Date.now() - 300000).toISOString(),
        isActive: true,
        expiresAt: new Date(Date.now() + 604800000).toISOString(),
        deviceInfo: {
          platform: 'macOS',
          browser: 'Safari',
          version: '16.1'
        },
        location: {
          country: 'Indonesia',
          city: 'Surabaya'
        }
      },
      {
        id: 'sess_3',
        userId: 'user_3',
        userName: 'Bob Johnson',
        email: 'bob@example.com',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        loginTime: new Date(Date.now() - 86400000).toISOString(),
        lastActivity: new Date(Date.now() - 86400000).toISOString(),
        isActive: false,
        expiresAt: new Date(Date.now() + 604800000).toISOString(),
        deviceInfo: {
          platform: 'iOS',
          browser: 'Mobile Safari',
          version: '16.0'
        },
        location: {
          country: 'Indonesia',
          city: 'Bandung'
        }
      }
    ];

    const page = parseInt(queryParams.page);
    const limit = parseInt(queryParams.limit);
    const total = mockSessions.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: mockSessions,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        summary: {
          total: mockSessions.length,
          active: mockSessions.filter(s => s.isActive).length,
          inactive: mockSessions.filter(s => !s.isActive).length,
          uniqueUsers: new Set(mockSessions.map(s => s.userId)).size
        }
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          details: error.issues.map((err: ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });

export const DELETE = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const all = searchParams.get('all') === 'true';

    // TODO: Implement SystemSessionService
    // const sessionService = container.cradle.systemSessionService;

    let message = '';
    if (all) {
      // await sessionService.terminateAllSessions();
      message = 'All sessions terminated successfully';
    } else if (sessionId) {
      // await sessionService.terminateSession(sessionId);
      message = 'Session terminated successfully';
    } else if (userId) {
      // await sessionService.terminateUserSessions(userId);
      message = 'User sessions terminated successfully';
    } else {
      return NextResponse.json(
        { error: 'Must specify sessionId, userId, or all=true' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });