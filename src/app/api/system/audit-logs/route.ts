import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { withAuthHandler } from '@/infrastructure/middleware/auth';
import { ZodError, ZodIssue } from 'zod';

const rateLimiter = createRateLimitMiddleware();

const auditLogQuerySchema = {
  page: '1',
  limit: '10',
  search: undefined,
  action: undefined,
  userId: undefined,
  resource: undefined,
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
      action: searchParams.get('action') || undefined,
      userId: searchParams.get('userId') || undefined,
      resource: searchParams.get('resource') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    // TODO: Implement AuditLogService to fetch audit logs
    // const auditLogService = container.cradle.auditLogService;
    // const result = await auditLogService.findAll(queryParams);

    // Mock response
    const mockLogs = [
      {
        id: 'audit_1',
        userId: 'user_1',
        userName: 'John Doe',
        action: 'CREATE',
        resource: 'User',
        resourceId: 'user_2',
        details: 'Created new user account',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'audit_2',
        userId: 'user_1',
        userName: 'John Doe',
        action: 'UPDATE',
        resource: 'Department',
        resourceId: 'dept_1',
        details: 'Updated department name',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'audit_3',
        userId: 'user_3',
        userName: 'Jane Smith',
        action: 'DELETE',
        resource: 'Position',
        resourceId: 'pos_1',
        details: 'Deleted position',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
      }
    ];

    const page = parseInt(queryParams.page);
    const limit = parseInt(queryParams.limit);
    const total = mockLogs.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: mockLogs,
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