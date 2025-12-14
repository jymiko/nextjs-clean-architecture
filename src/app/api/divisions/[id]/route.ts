import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { updateDivisionSchema } from '@/infrastructure/validation';
import { ZodError, ZodIssue } from 'zod';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { withAuthHandler } from '@/infrastructure/middleware/auth';

const rateLimiter = createRateLimitMiddleware();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const divisionRepository = container.cradle.divisionRepository;
    const division = await divisionRepository.findById(id);

    if (!division) {
      return NextResponse.json(
        { error: 'Division not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(division);
  } catch (error) {
    return handleError(error, request);
  }
}

export const PUT = withAuthHandler(async (request: NextRequest, { params }: RouteParams) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateDivisionSchema.parse(body);

    const divisionRepository = container.cradle.divisionRepository;
    const division = await divisionRepository.update(id, validatedData);

    return NextResponse.json(division);
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

export const DELETE = withAuthHandler(async (request: NextRequest, { params }: RouteParams) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const divisionRepository = container.cradle.divisionRepository;
    await divisionRepository.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Division deleted successfully',
    });
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });
