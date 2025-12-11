import { NextRequest, NextResponse } from 'next/server';
import { AppError } from './app-error';
import { ZodError } from 'zod';
import { getUserFriendlyMessage, createErrorResponse } from './user-friendly-messages';

export const handleError = (error: unknown, request: NextRequest) => {
  console.error('Error:', error);

  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((err) => ({
      field: err.path.join('.'),
      message: getUserFriendlyMessage(err.message) || err.message,
    }));

    return NextResponse.json(
      createErrorResponse(
        'Validation Error',
        400,
        formattedErrors
      ),
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    const friendlyMessage = getUserFriendlyMessage(error.message);
    return NextResponse.json(
      {
        error: friendlyMessage || error.message,
        ...(process.env.NODE_ENV === 'development' && {
          errorDetails: error.message,
          stack: error.stack
        }),
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message?: string };

    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          createErrorResponse('Unique constraint violation', 409),
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          createErrorResponse('Record not found', 404),
          { status: 404 }
        );
      default:
        return NextResponse.json(
          createErrorResponse('Database error', 500),
          { status: 500 }
        );
    }
  }

  // Generic error
  return NextResponse.json(
    createErrorResponse('Internal server error', 500),
    { status: 500 }
  );
};