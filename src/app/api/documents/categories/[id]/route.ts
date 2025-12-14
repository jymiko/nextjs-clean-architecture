import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { updateDocumentCategorySchema } from '@/infrastructure/validation/document';
import { ZodError, ZodIssue } from 'zod';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { withAuthHandler } from '@/infrastructure/middleware/auth';

const rateLimiter = createRateLimitMiddleware();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/documents/categories/[id] - Get a single document category
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const documentRepository = container.cradle.documentRepository;
    const category = await documentRepository.getCategoryById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Document type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    return handleError(error, request);
  }
}

// PUT /api/documents/categories/[id] - Update a document category
export const PUT = withAuthHandler(async (request: NextRequest, { params }: RouteParams) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateDocumentCategorySchema.parse(body);

    const documentRepository = container.cradle.documentRepository;
    const category = await documentRepository.updateCategory(id, validatedData);

    return NextResponse.json(category);
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

// DELETE /api/documents/categories/[id] - Delete a document category
export const DELETE = withAuthHandler(async (request: NextRequest, { params }: RouteParams) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const documentRepository = container.cradle.documentRepository;
    await documentRepository.deleteCategory(id);

    return NextResponse.json({
      success: true,
      message: 'Document type deleted successfully',
    });
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN'] });
