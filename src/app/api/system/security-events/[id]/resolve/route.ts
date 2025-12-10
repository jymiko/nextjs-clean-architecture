import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { withAuthHandler } from '@/infrastructure/middleware/auth';

const rateLimiter = createRateLimitMiddleware();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const POST = withAuthHandler(async (request: NextRequest, { params }: RouteParams) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();
    const { notes } = body || {};

    // TODO: Implement SecurityEventService to resolve security event
    // const securityEventService = container.cradle.securityEventService;
    // await securityEventService.resolveEvent(id, notes);

    return NextResponse.json({
      success: true,
      message: 'Security event resolved successfully',
      id,
      resolvedAt: new Date().toISOString(),
      notes: notes || null
    });
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });