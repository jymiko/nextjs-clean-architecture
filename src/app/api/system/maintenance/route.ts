import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { withAuthHandler } from '@/infrastructure/middleware/auth';

const rateLimiter = createRateLimitMiddleware();

// Mock maintenance state
let maintenanceMode = {
  enabled: false,
  message: 'System is under maintenance. Please try again later.',
  startTime: null,
  endTime: null,
  bypassKey: null
};

export const GET = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // TODO: Implement SystemMaintenanceService
    // const maintenanceService = container.cradle.systemMaintenanceService;
    // const status = await maintenanceService.getStatus();

    return NextResponse.json(maintenanceMode);
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });

export const POST = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { enabled, message, startTime, endTime, generateBypassKey } = body;

    // TODO: Implement SystemMaintenanceService
    // const maintenanceService = container.cradle.systemMaintenanceService;
    // await maintenanceService.updateStatus({ enabled, message, startTime, endTime });

    // Update mock state
    maintenanceMode = {
      enabled: enabled ?? false,
      message: message ?? maintenanceMode.message,
      startTime: startTime ?? null,
      endTime: endTime ?? null,
      bypassKey: generateBypassKey ? Math.random().toString(36).substring(7) : null
    };

    return NextResponse.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
      maintenanceMode
    });
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });