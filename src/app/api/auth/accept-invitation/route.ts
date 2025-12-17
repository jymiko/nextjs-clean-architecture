import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { acceptInvitationSchema } from '@/infrastructure/validation';
import { ZodError, ZodIssue } from 'zod';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';

// Rate limit: 10 requests per 15 minutes
const rateLimiter = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const validatedData = acceptInvitationSchema.parse(body);

    const invitationRepository = container.cradle.invitationRepository;
    const result = await invitationRepository.acceptInvitation({
      token: validatedData.token,
      password: validatedData.password,
    });

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
