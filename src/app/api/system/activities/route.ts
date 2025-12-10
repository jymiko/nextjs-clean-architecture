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
      level: searchParams.get('level') || undefined, // INFO, WARNING, ERROR, CRITICAL
      category: searchParams.get('category') || undefined, // AUTH, DATABASE, API, SYSTEM
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    // TODO: Implement SystemActivityService
    // const activityService = container.cradle.systemActivityService;
    // const result = await activityService.findAll(queryParams);

    // Mock response with detailed system activities
    const mockActivities = [
      {
        id: 'act_1',
        level: 'INFO',
        category: 'AUTH',
        message: 'User login successful',
        details: {
          userId: 'user_1',
          email: 'admin@example.com',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: 'act_2',
        level: 'WARNING',
        category: 'API',
        message: 'Rate limit exceeded for IP',
        details: {
          ipAddress: '192.168.1.200',
          endpoint: '/api/users',
          requestsPerMinute: 150,
          limit: 100
        },
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: 'act_3',
        level: 'ERROR',
        category: 'DATABASE',
        message: 'Database connection timeout',
        details: {
          query: 'SELECT * FROM users WHERE active = true',
          timeout: 5000,
          retryCount: 3
        },
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
      {
        id: 'act_4',
        level: 'CRITICAL',
        category: 'SYSTEM',
        message: 'Disk space running low',
        details: {
          usedSpace: '9.2GB',
          totalSpace: '10GB',
          percentage: 92,
          threshold: 90
        },
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'act_5',
        level: 'INFO',
        category: 'SYSTEM',
        message: 'System backup completed successfully',
        details: {
          backupType: 'daily',
          size: '1.2GB',
          duration: '5 minutes',
          location: 'cloud-storage'
        },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      }
    ];

    const page = parseInt(queryParams.page);
    const limit = parseInt(queryParams.limit);
    const total = mockActivities.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: mockActivities,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        summary: {
          total: mockActivities.length,
          critical: mockActivities.filter(a => a.level === 'CRITICAL').length,
          errors: mockActivities.filter(a => a.level === 'ERROR').length,
          warnings: mockActivities.filter(a => a.level === 'WARNING').length,
          info: mockActivities.filter(a => a.level === 'INFO').length,
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