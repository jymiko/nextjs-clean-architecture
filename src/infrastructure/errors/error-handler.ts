import { NextRequest, NextResponse } from 'next/server';
import { AppError } from './app-error';
import { ZodError } from 'zod';

export const handleError = (error: unknown, request: NextRequest) => {
  console.error('Error:', error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation Error',
        details: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
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
          { error: 'Unique constraint violation' },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
    }
  }

  // Generic error
  return NextResponse.json(
    {
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && {
        errorDetails: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
    },
    { status: 500 }
  );
};