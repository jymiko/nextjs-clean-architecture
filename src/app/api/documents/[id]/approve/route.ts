import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { handleError } from "@/infrastructure/errors";
import { documentApprovalSchema } from "@/infrastructure/validation/document";
import { ZodError, ZodIssue } from "zod";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler, type AuthenticatedRequest } from "@/infrastructure/middleware/auth";
import { ApprovalStatus } from "@/domain/entities/Document";

const rateLimiter = createRateLimitMiddleware();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/documents/[id]/approve - Approve or reject a document
export const POST = withAuthHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();
    const validatedData = documentApprovalSchema.parse(body);

    // Get user from request (should be added by auth middleware)
    const userId = (request as AuthenticatedRequest).user?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const documentRepository = container.cradle.documentRepository;
    const result = await documentRepository.updateApproval(id, {
      approverId: userId,
      status: validatedData.status as ApprovalStatus,
      comments: validatedData.comments,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Document not found or approval not permitted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Document ${validatedData.status.toLowerCase()} successfully`,
      document: result,
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
}, { allowedRoles: ['ADMIN', 'USER'] });