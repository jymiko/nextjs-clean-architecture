import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { handleError } from "@/infrastructure/errors";
import { createUserAdminSchema, userQuerySchema } from "@/infrastructure/validation";
import { ZodError, ZodIssue } from "zod";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler } from "@/infrastructure/middleware/auth";
import { UserQueryParams, CreateUserDTO } from "@/domain/entities/User";

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
      role: searchParams.get('role') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
      positionId: searchParams.get('positionId') || undefined,
      isActive: searchParams.get('isActive') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedParams = userQuerySchema.parse(queryParams);

    const userRepository = container.cradle.userRepository;
    const result = await userRepository.findAll(validatedParams as UserQueryParams);

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
});

export const POST = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const validatedData = createUserAdminSchema.parse(body);

    const userRepository = container.cradle.userRepository;
    const user = await userRepository.create(validatedData as CreateUserDTO);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
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
