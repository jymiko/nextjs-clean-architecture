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

    // TODO: Implement actual health checks
    // - Database connection
    // - External service status
    // - Disk space
    // - Memory usage
    // - CPU usage

    // Mock health data
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      services: {
        database: {
          status: 'connected',
          responseTime: 5
        },
        email: {
          status: 'connected',
          lastCheck: new Date().toISOString()
        },
        storage: {
          status: 'healthy',
          used: '2.5GB',
          total: '10GB',
          percentage: 25
        }
      },
      metrics: {
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        cpu: {
          usage: Math.random() * 100 // Mock CPU usage
        }
      }
    };

    // If any service is down, return degraded status
    const hasUnhealthyService = Object.values(health.services)
      .some(service => service.status !== 'connected' && service.status !== 'healthy');

    if (hasUnhealthyService) {
      health.status = 'degraded';
      return NextResponse.json(health, { status: 200 });
    }

    return NextResponse.json(health);
  } catch (error) {
    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error)
    };
    return NextResponse.json(health, { status: 503 });
  }
}, { allowedRoles: ['ADMIN'] });