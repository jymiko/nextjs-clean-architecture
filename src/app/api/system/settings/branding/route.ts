import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { withAuthHandler, getRequestUser } from '@/infrastructure/middleware/auth';
import { updateBrandingSchema } from '@/infrastructure/validation';

const rateLimiter = createRateLimitMiddleware();

/**
 * GET /api/system/settings/branding
 * Get branding settings (public - no auth required)
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const systemSettingRepository = container.cradle.systemSettingRepository;
    const branding = await systemSettingRepository.getBranding();

    return NextResponse.json({
      success: true,
      data: branding,
    });
  } catch (error) {
    return handleError(error, request);
  }
}

/**
 * PUT /api/system/settings/branding
 * Update branding settings (admin only)
 */
export const PUT = withAuthHandler(
  async (request: NextRequest) => {
    try {
      const rateLimitResponse = await rateLimiter(request);
      if (rateLimitResponse) return rateLimitResponse;

      const body = await request.json();

      // Validate input
      const validatedData = updateBrandingSchema.parse(body);

      // Get authenticated user
      const user = getRequestUser(request);

      const systemSettingRepository = container.cradle.systemSettingRepository;
      const branding = await systemSettingRepository.updateBranding({
        ...validatedData,
        updatedBy: user?.userId,
      });

      return NextResponse.json({
        success: true,
        message: 'Branding settings updated successfully',
        data: branding,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: 'Validation error',
            errors: error.issues.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      return handleError(error, request);
    }
  },
  { allowedRoles: ['ADMIN'] }
);
