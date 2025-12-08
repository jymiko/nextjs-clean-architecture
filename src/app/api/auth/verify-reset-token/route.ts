import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { verifyResetTokenSchema } from '@/infrastructure/validation';
import { ZodError, ZodIssue } from 'zod';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';

const rateLimiter = createRateLimitMiddleware();

/**
 * @swagger
 * /api/auth/verify-reset-token:
 *   get:
 *     summary: Verify reset token
 *     description: Checks if a password reset token is valid and not expired
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token to verify
 *     responses:
 *       200:
 *         description: Token verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Email associated with the token (only if valid)
 *                   example: user@example.com
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   description: Token expiration time (only if valid)
 *       400:
 *         description: Token not provided
 *       429:
 *         description: Too many requests
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Get token from query params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validate input
    const validatedData = verifyResetTokenSchema.parse({ token });

    // Verify token
    const passwordResetRepository = container.cradle.passwordResetRepository;
    const result = await passwordResetRepository.verifyToken(validatedData.token);

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
