import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { handleError } from "@/infrastructure/errors";
import { createDocumentSchema, documentQuerySchema } from "@/infrastructure/validation/document";
import { ZodError, ZodIssue } from "zod";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler } from "@/infrastructure/middleware/auth";
import { DocumentStatus, ApprovalStatus } from "@/domain/entities/Document";

const rateLimiter = createRateLimitMiddleware();

// GET /api/documents - List all documents with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      status: searchParams.get('status') || undefined,
      approvalStatus: searchParams.get('approvalStatus') || undefined,
      ownerId: searchParams.get('ownerId') || undefined,
      createdById: searchParams.get('createdById') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      isObsolete: searchParams.get('isObsolete') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedParams = documentQuerySchema.parse(queryParams);

    const documentRepository = container.cradle.documentRepository;
    const result = await documentRepository.findAll({
      ...validatedParams,
      status: validatedParams.status as DocumentStatus | undefined,
      approvalStatus: validatedParams.approvalStatus as ApprovalStatus | undefined,
    });

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

// POST /api/documents - Create a new document
export const POST = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const validatedData = createDocumentSchema.parse(body);

    const documentRepository = container.cradle.documentRepository;
    const document = await documentRepository.create(validatedData);

    return NextResponse.json(document, { status: 201 });
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