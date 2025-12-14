import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { createDivisionSchema, divisionQuerySchema } from '@/infrastructure/validation';
import { ZodError, ZodIssue } from 'zod';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { withAuthHandler } from '@/infrastructure/middleware/auth';

const rateLimiter = createRateLimitMiddleware();

export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search') || undefined,
      isActive: searchParams.get('isActive') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedParams = divisionQuerySchema.parse(queryParams);

    const divisionRepository = container.cradle.divisionRepository;
    const result = await divisionRepository.findAll(validatedParams);

    return NextResponse.json(result);
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
}

export const POST = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const validatedData = createDivisionSchema.parse(body);

    const divisionRepository = container.cradle.divisionRepository;
    const division = await divisionRepository.create(validatedData);

    return NextResponse.json(division, { status: 201 });
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
