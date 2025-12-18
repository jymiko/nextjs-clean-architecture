import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { withAuth } from '@/infrastructure/middleware';
import { registerFcmTokenSchema } from '@/infrastructure/validation/user-preference';
import { ZodError, ZodIssue } from 'zod';

/**
 * POST /api/user/fcm-token
 * Register a new FCM token for push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const authenticatedRequest = await withAuth(request);

    if (!authenticatedRequest.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = registerFcmTokenSchema.parse(body);

    const userPreferenceRepository = container.cradle.userPreferenceRepository;

    const fcmToken = await userPreferenceRepository.addFcmToken(
      authenticatedRequest.user.userId,
      validatedData
    );

    return NextResponse.json({
      success: true,
      message: 'FCM token registered successfully',
      data: fcmToken,
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

/**
 * DELETE /api/user/fcm-token
 * Remove an FCM token (e.g., on logout or when user disables push notifications)
 */
export async function DELETE(request: NextRequest) {
  try {
    const authenticatedRequest = await withAuth(request);

    if (!authenticatedRequest.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token parameter is required' },
        { status: 400 }
      );
    }

    const userPreferenceRepository = container.cradle.userPreferenceRepository;
    const removed = await userPreferenceRepository.removeFcmToken(token);

    if (!removed) {
      return NextResponse.json(
        { error: 'Token not found or already removed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FCM token removed successfully',
    });
  } catch (error) {
    return handleError(error, request);
  }
}

/**
 * GET /api/user/fcm-token
 * Get all active FCM tokens for the current user
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
    const tokens = await userPreferenceRepository.getFcmTokensByUserId(
      authenticatedRequest.user.userId
    );

    return NextResponse.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    return handleError(error, request);
  }
}
