import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { updatePositionSchema } from '@/infrastructure/validation';
import { ZodError, ZodIssue } from 'zod';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';

const rateLimiter = createRateLimitMiddleware();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const positionRepository = container.cradle.positionRepository;
    const position = await positionRepository.findById(id);

    if (!position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(position);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePositionSchema.parse(body);

    const positionRepository = container.cradle.positionRepository;
    const position = await positionRepository.update(id, validatedData);

    return NextResponse.json(position);
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const positionRepository = container.cradle.positionRepository;
    await positionRepository.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Position deleted successfully',
    });
  } catch (error) {
    return handleError(error, request);
  }
}
