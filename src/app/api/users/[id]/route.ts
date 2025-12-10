import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { updateUserAdminSchema } from '@/infrastructure/validation';
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

    const userRepository = container.cradle.userRepository;
    const user = await userRepository.findById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
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
    const validatedData = updateUserAdminSchema.parse(body);

    const userRepository = container.cradle.userRepository;
    const user = await userRepository.update(id, validatedData);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
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

    const userRepository = container.cradle.userRepository;
    await userRepository.delete(id);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });
