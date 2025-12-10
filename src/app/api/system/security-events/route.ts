import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { withAuthHandler } from '@/infrastructure/middleware/auth';
import { ZodError, ZodIssue } from 'zod';

const rateLimiter = createRateLimitMiddleware();

const securityEventQuerySchema = {
  page: '1',
  limit: '10',
  search: undefined,
  type: undefined,
  severity: undefined,
  isResolved: undefined,
  startDate: undefined,
  endDate: undefined,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const GET = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') || undefined,
      severity: searchParams.get('severity') || undefined,
      isResolved: searchParams.get('isResolved') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    // TODO: Implement SecurityEventService to fetch security events
    // const securityEventService = container.cradle.securityEventService;
    // const result = await securityEventService.findAll(queryParams);

    // Mock response
    const mockEvents = [
      {
        id: 'sec_1',
        type: 'LOGIN_FAILED',
        severity: 'HIGH',
        userId: null,
        email: 'unknown@hacker.com',
        ipAddress: '192.168.1.200',
        userAgent: 'Python/3.9 scrappy',
        details: 'Failed login attempt with unknown email',
        isResolved: false,
        resolvedAt: null,
        resolvedBy: null,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'sec_2',
        type: 'MULTIPLE_LOGIN_ATTEMPTS',
        severity: 'MEDIUM',
        userId: 'user_1',
        email: 'john@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        details: '5 failed login attempts within 5 minutes',
        isResolved: true,
        resolvedAt: new Date(Date.now() - 900000).toISOString(),
        resolvedBy: 'admin_1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'sec_3',
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'LOW',
        userId: 'user_2',
        email: 'jane@example.com',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        details: 'Access from unusual location',
        isResolved: false,
        resolvedAt: null,
        resolvedBy: null,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      }
    ];

    const page = parseInt(queryParams.page);
    const limit = parseInt(queryParams.limit);
    const total = mockEvents.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: mockEvents,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
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