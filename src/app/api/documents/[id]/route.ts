import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { handleError } from "@/infrastructure/errors";
import { updateDocumentSchema } from "@/infrastructure/validation/document";
import { ZodError, ZodIssue } from "zod";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler } from "@/infrastructure/middleware/auth";
import { DocumentStatus } from "@/domain/entities/Document";

const rateLimiter = createRateLimitMiddleware();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/documents/[id] - Get a specific document by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const documentRepository = container.cradle.documentRepository;
    const document = await documentRepository.findById(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    return handleError(error, request);
  }
}

// PUT /api/documents/[id] - Update a specific document
export const PUT = withAuthHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateDocumentSchema.parse(body);

    const documentRepository = container.cradle.documentRepository;
    const document = await documentRepository.update(id, {
      ...validatedData,
      status: validatedData.status as DocumentStatus | undefined,
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
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
}, { allowedRoles: ['ADMIN', 'USER'] });

// DELETE /api/documents/[id] - Delete a specific document
// Users can delete their own documents, Admins can delete any document
export const DELETE = withAuthHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const documentRepository = container.cradle.documentRepository;

    // First, get the document to check ownership
    const existingDocument = await documentRepository.findById(id);

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get the current user from the request
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);

    // Import and use verifyToken to get user info
    const { verifyToken } = await import('@/infrastructure/auth');
    const payload = token ? await verifyToken(token) : null;

    // Check if user is authorized to delete this document
    // Admin/SuperAdmin can delete any document, users can only delete their own
    if (payload && payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
      if (existingDocument.createdById !== payload.userId && existingDocument.ownerId !== payload.userId) {
        return NextResponse.json(
          { error: 'You can only delete your own documents' },
          { status: 403 }
        );
      }
    }

    const document = await documentRepository.delete(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN', 'USER'] });