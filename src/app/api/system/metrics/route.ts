import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { withAuthHandler } from '@/infrastructure/middleware/auth';

const rateLimiter = createRateLimitMiddleware();

export const GET = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h'; // 1h, 24h, 7d, 30d

    // TODO: Implement SystemMetricsService
    // const metricsService = container.cradle.systemMetricsService;
    // const metrics = await metricsService.getMetrics(timeRange);

    // Mock metrics data
    const metrics = {
      timeRange,
      timestamp: new Date().toISOString(),
      users: {
        total: 1000,
        active: 850,
        newThisPeriod: 25,
        growth: 5.2
      },
      storage: {
        used: 2.5,
        total: 10,
        percentage: 25,
        trend: 'increasing'
      },
      api: {
        totalRequests: 50000,
        averageResponseTime: 125,
        errorRate: 0.5,
        topEndpoints: [
          { path: '/api/users', requests: 15000 },
          { path: '/api/auth/login', requests: 12000 },
          { path: '/api/departments', requests: 8000 },
          { path: '/api/positions', requests: 7000 },
          { path: '/api/permissions', requests: 5000 }
        ]
      },
      performance: {
        cpu: [
          { timestamp: new Date(Date.now() - 3600000).toISOString(), value: 45 },
          { timestamp: new Date(Date.now() - 3000000).toISOString(), value: 52 },
          { timestamp: new Date(Date.now() - 2400000).toISOString(), value: 48 },
          { timestamp: new Date(Date.now() - 1800000).toISOString(), value: 55 },
          { timestamp: new Date(Date.now() - 1200000).toISOString(), value: 50 },
          { timestamp: new Date(Date.now() - 600000).toISOString(), value: 47 },
          { timestamp: new Date().toISOString(), value: 43 }
        ],
        memory: [
          { timestamp: new Date(Date.now() - 3600000).toISOString(), value: 60 },
          { timestamp: new Date(Date.now() - 3000000).toISOString(), value: 65 },
          { timestamp: new Date(Date.now() - 2400000).toISOString(), value: 62 },
          { timestamp: new Date(Date.now() - 1800000).toISOString(), value: 70 },
          { timestamp: new Date(Date.now() - 1200000).toISOString(), value: 68 },
          { timestamp: new Date(Date.now() - 600000).toISOString(), value: 64 },
          { timestamp: new Date().toISOString(), value: 61 }
        ]
      },
      security: {
        eventsThisPeriod: 12,
        resolvedEvents: 8,
        blockedIPs: 3,
        suspiciousActivities: 5
      },
      database: {
        connections: 15,
        avgQueryTime: 25,
        slowQueries: 2,
        cacheHitRate: 95.5
      }
    };

    return NextResponse.json(metrics);
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });