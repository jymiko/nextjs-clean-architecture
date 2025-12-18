import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { withAuth } from '@/infrastructure/middleware';
import { updateUserPreferenceSchema } from '@/infrastructure/validation/user-preference';
import { ZodError, ZodIssue } from 'zod';
import { NotificationFrequency } from '@/domain/entities/UserPreference';

/**
 * GET /api/user/preferences
 * Get current user's notification and display preferences
 */
export async function GET(request: NextRequest) {
  try {
    const authenticatedRequest = await withAuth(request);

    if (!authenticatedRequest.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userPreferenceRepository = container.cradle.userPreferenceRepository;

    // Get or create preferences (creates with defaults if not exists)
    const preferences = await userPreferenceRepository.getOrCreate(
      authenticatedRequest.user.userId
    );

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    return handleError(error, request);
  }
}

/**
 * PUT /api/user/preferences
 * Update current user's preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const authenticatedRequest = await withAuth(request);

    if (!authenticatedRequest.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserPreferenceSchema.parse(body);

    const userPreferenceRepository = container.cradle.userPreferenceRepository;

    // Ensure preference exists
    await userPreferenceRepository.getOrCreate(authenticatedRequest.user.userId);

    // Update preferences with proper type casting
    const updatedPreferences = await userPreferenceRepository.update(
      authenticatedRequest.user.userId,
      {
        ...validatedData,
        notificationFrequency: validatedData.notificationFrequency as NotificationFrequency | undefined,
      }
    );

    if (!updatedPreferences) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedPreferences,
    });
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
