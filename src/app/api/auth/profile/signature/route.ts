import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { withAuth } from '@/infrastructure/middleware';
import { updateSignatureSchema } from '@/infrastructure/validation';
import { ZodError, ZodIssue } from 'zod';

/**
 * GET /api/auth/profile/signature
 * Get current user signature
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

    return NextResponse.json({
      success: true,
      data: {
        signature: user.signature || null,
        hasSignature: !!user.signature,
      },
    });
  } catch (error) {
    return handleError(error, request);
  }
}

/**
 * PUT /api/auth/profile/signature
 * Update or set user signature (base64 image from canvas drawing)
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
    const validatedData = updateSignatureSchema.parse(body);

    const userRepository = container.cradle.userRepository;

    // Check if user exists
    const existingUser = await userRepository.findById(authenticatedRequest.user.userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate signature size (max 500KB for base64)
    if (validatedData.signature) {
      const sizeInBytes = Buffer.byteLength(validatedData.signature, 'utf8');
      const maxSizeBytes = 500 * 1024; // 500KB

      if (sizeInBytes > maxSizeBytes) {
        return NextResponse.json(
          {
            error: 'Signature image is too large',
            details: [{ field: 'signature', message: 'Signature must be less than 500KB' }]
          },
          { status: 400 }
        );
      }
    }

    // Update signature
    const updatedUser = await userRepository.update(
      authenticatedRequest.user.userId,
      { signature: validatedData.signature }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update signature' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: validatedData.signature
        ? 'Signature updated successfully'
        : 'Signature removed successfully',
      data: {
        signature: updatedUser.signature || null,
        hasSignature: !!updatedUser.signature,
      },
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
 * DELETE /api/auth/profile/signature
 * Remove user signature
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

    const userRepository = container.cradle.userRepository;

    // Check if user exists
    const existingUser = await userRepository.findById(authenticatedRequest.user.userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove signature
    await userRepository.update(
      authenticatedRequest.user.userId,
      { signature: null }
    );

    return NextResponse.json({
      success: true,
      message: 'Signature removed successfully',
    });
  } catch (error) {
    return handleError(error, request);
  }
}
