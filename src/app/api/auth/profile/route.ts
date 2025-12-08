import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { withAuth } from '@/infrastructure/middleware';
import { updateProfileSchema } from '@/infrastructure/validation';
import { ZodError, ZodIssue } from 'zod';

/**
 * GET /api/auth/profile
 * Get current user profile with full details
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

    const userRepository = container.cradle.userRepository;
    const user = await userRepository.findById(authenticatedRequest.user.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    return handleError(error, request);
  }
}

/**
 * PUT /api/auth/profile
 * Update current user profile (name, phone, avatar)
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
    const validatedData = updateProfileSchema.parse(body);

    const userRepository = container.cradle.userRepository;

    // Check if user exists
    const existingUser = await userRepository.findById(authenticatedRequest.user.userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user profile
    const updatedUser = await userRepository.update(
      authenticatedRequest.user.userId,
      validatedData
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword,
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
