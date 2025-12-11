import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { handleError } from "@/infrastructure/errors";
import { documentDistributionSchema, documentQuerySchema } from "@/infrastructure/validation/document";
import { ZodError, ZodIssue } from "zod";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler } from "@/infrastructure/middleware/auth";
import { DistributionMethod } from "@/domain/entities/Document";

const rateLimiter = createRateLimitMiddleware();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/documents/[id]/distribute - Get distribution history for a document
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'distributedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedParams = documentQuerySchema.parse(queryParams);

    const documentRepository = container.cradle.documentRepository;
    const result = await documentRepository.getDistributionHistory(id, validatedParams);

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

// POST /api/documents/[id]/distribute - Distribute a document to users
export const POST = withAuthHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();
    const validatedData = documentDistributionSchema.parse(body);

    // Get user from request (should be added by auth middleware)
    const userId = (request as any).user?.id;

    const documentRepository = container.cradle.documentRepository;
    const distribution = await documentRepository.distributeDocument(id, {
      ...validatedData,
      method: validatedData.method as DistributionMethod,
      distributedBy: userId,
    });

    if (!distribution) {
      return NextResponse.json(
        { error: 'Document not found or distribution failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Document distributed successfully',
      distribution,
    }, { status: 201 });
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