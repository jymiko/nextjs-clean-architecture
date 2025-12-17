import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { handleError } from "@/infrastructure/errors";
import { z } from "zod";
import { ZodError, ZodIssue } from "zod";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler, type AuthenticatedRequest } from "@/infrastructure/middleware/auth";

const rateLimiter = createRateLimitMiddleware();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Schema for sign request
const signDocumentSchema = z.object({
  approvalId: z.string().cuid("Invalid approval ID"),
  signatureImage: z.string().min(1, "Signature is required"), // base64 or "use-profile"
});

// POST /api/documents/[id]/sign - Sign a document approval
export const POST = withAuthHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id: documentId } = await params;
    const authRequest = request as AuthenticatedRequest;
    const authUser = authRequest.user;

    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = authUser.userId;
    const body = await request.json();
    const validatedData = signDocumentSchema.parse(body);

    // Get the document with all approvals
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        approvals: {
          orderBy: [{ level: "asc" }, { createdAt: "asc" }],
          include: {
            approver: {
              select: { id: true, name: true, signature: true },
            },
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Find the approval to sign
    const approval = document.approvals.find(a => a.id === validatedData.approvalId);

    if (!approval) {
      return NextResponse.json(
        { error: "Approval not found" },
        { status: 404 }
      );
    }

    // Verify the current user is the approver
    if (approval.approverId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to sign this approval" },
        { status: 403 }
      );
    }

    // Check if already approved (confirmed) - can't re-sign after confirmed approval
    if (approval.confirmedAt) {
      return NextResponse.json(
        { error: "This approval has already been confirmed and cannot be re-signed" },
        { status: 400 }
      );
    }

    // Allow re-signing if already signed but not yet confirmed (for editing signature)

    // Validate sequential signing order
    // 1. Check if "Prepared By" is signed (document.preparedBySignedAt must exist)
    if (!document.preparedBySignedAt) {
      return NextResponse.json(
        { error: "Document must be signed by the creator first" },
        { status: 400 }
      );
    }

    // 2. Check all previous approvals are fully approved (signed AND confirmed)
    // Filter approvals that should be approved before this one can sign
    const previousApprovals = document.approvals.filter(a => {
      if (a.id === approval.id) return false;
      // Lower level must be fully approved first
      if (a.level < approval.level) return true;
      // Same level: check creation order (earlier created = must approve first)
      if (a.level === approval.level && a.createdAt < approval.createdAt) return true;
      return false;
    });

    // Previous approvals must have status APPROVED (not just SIGNED)
    const unapprovedPrevious = previousApprovals.filter(a => a.status !== "APPROVED");
    if (unapprovedPrevious.length > 0) {
      return NextResponse.json(
        { error: "Previous approvals must be fully approved first" },
        { status: 400 }
      );
    }

    // Determine the signature to use
    let signatureImage = validatedData.signatureImage;

    if (signatureImage === "use-profile") {
      // Get user's profile signature
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { signature: true },
      });

      if (!user?.signature) {
        return NextResponse.json(
          { error: "No saved signature found in your profile" },
          { status: 400 }
        );
      }

      signatureImage = user.signature;
    }

    // Update the approval with signature only - status changes to SIGNED (not APPROVED yet)
    // User needs to click "Approve" button separately to confirm approval
    const updatedApproval = await prisma.documentApproval.update({
      where: { id: validatedData.approvalId },
      data: {
        signatureImage,
        signedAt: new Date(),
        status: "SIGNED", // Changed from APPROVED - user must confirm approval separately
        // Don't set approvedAt or confirmedAt - that happens when user clicks "Approve"
      },
      include: {
        approver: {
          select: { id: true, name: true },
        },
      },
    });

    // Document status remains unchanged - will be updated when user confirms approval

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "DOCUMENT_APPROVED", // Could create a new action type "DOCUMENT_SIGNED" if needed
        entity: "DocumentApproval",
        entityId: updatedApproval.id,
        description: `Signed document (pending approval): ${document.title}`,
        metadata: {
          documentId: document.id,
          documentNumber: document.documentNumber,
          approvalLevel: approval.level,
          action: "SIGNED", // Indicate this was just a signature, not approval
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Document signed successfully. Please click 'Approve' to confirm your approval.",
      approval: {
        id: updatedApproval.id,
        level: updatedApproval.level,
        status: updatedApproval.status,
        signedAt: updatedApproval.signedAt,
        approver: updatedApproval.approver,
      },
      // Indicate that approval confirmation is still required
      requiresApprovalConfirmation: true,
    });
  } catch (error) {
    // Enhanced error logging for debugging
    console.error('[Sign Route Error]', {
      errorType: error?.constructor?.name,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorCode: (error as any)?.code,
      errorMeta: (error as any)?.meta,
    });

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: error.issues.map((err: ZodIssue) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return handleError(error, request);
  }
}, { allowedRoles: ["ADMIN", "USER"] });
