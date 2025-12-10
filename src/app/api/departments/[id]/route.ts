import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { updateDepartmentSchema } from '@/infrastructure/validation';
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

    const departmentRepository = container.cradle.departmentRepository;
    const department = await departmentRepository.findById(id);

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(department);
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
    const validatedData = updateDepartmentSchema.parse(body);

    const departmentRepository = container.cradle.departmentRepository;
    const department = await departmentRepository.update(id, validatedData);

    return NextResponse.json(department);
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

    const departmentRepository = container.cradle.departmentRepository;
    await departmentRepository.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });
