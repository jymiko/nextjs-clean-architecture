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

// Schema for request revision
const requestRevisionSchema = z.object({
  approvalId: z.string().cuid("Invalid approval ID"),
  reason: z.string().min(10, "Revision reason must be at least 10 characters"),
});

// POST /api/documents/[id]/request-revision - Request document revision
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
    const validatedData = requestRevisionSchema.parse(body);

    // Get the document with all approvals
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        approvals: {
          where: { isDeleted: false },
          orderBy: [{ level: "asc" }, { createdAt: "asc" }],
          include: {
            approver: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Find the approval making the revision request
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
        { error: "You are not authorized to request revision for this document" },
        { status: 403 }
      );
    }

    // Check if document is in a state that allows revision requests
    const allowedStatuses = ["IN_REVIEW", "ON_APPROVAL"];
    if (!allowedStatuses.includes(document.status)) {
      return NextResponse.json(
        { error: `Cannot request revision for document in ${document.status} status` },
        { status: 400 }
      );
    }

    // Create snapshot of current signatures before resetting
    const signatureSnapshot = {
      preparedBy: {
        signature: document.preparedBySignature,
        signedAt: document.preparedBySignedAt,
      },
      approvals: document.approvals.map(a => ({
        id: a.id,
        level: a.level,
        approverId: a.approverId,
        approverName: a.approver.name,
        signatureImage: a.signatureImage,
        signedAt: a.signedAt,
        status: a.status,
        confirmedAt: a.confirmedAt,
      })),
    };

    // Create revision request record
    const revisionRequest = await prisma.documentRevisionRequest.create({
      data: {
        documentId,
        requestedById: userId,
        reason: validatedData.reason,
        approvalLevel: approval.level,
        approvalId: approval.id,
        signatureSnapshot: signatureSnapshot,
      },
    });

    // Reset ALL approval signatures and statuses to PENDING
    // Creator's signature (preparedBySignature) is kept intact
    await prisma.documentApproval.updateMany({
      where: {
        documentId,
        isDeleted: false,
      },
      data: {
        signatureImage: null,
        signedAt: null,
        status: "PENDING",
        confirmedAt: null,
        approvedAt: null,
        rejectedAt: null,
      },
    });

    // Increment revision cycle and update document status
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "ON_REVISION",
        approvalStatus: "NEEDS_REVISION",
        revisionCycle: {
          increment: 1,
        },
      },
    });

    // Update approval revision cycles to match document
    await prisma.documentApproval.updateMany({
      where: {
        documentId,
        isDeleted: false,
      },
      data: {
        revisionCycle: updatedDocument.revisionCycle,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "REVISION_REQUESTED",
        entity: "Document",
        entityId: documentId,
        description: `Requested revision for document: ${document.title}`,
        metadata: {
          documentId: document.id,
          documentNumber: document.documentNumber,
          approvalLevel: approval.level,
          revisionRequestId: revisionRequest.id,
          reason: validatedData.reason,
          revisionCycle: updatedDocument.revisionCycle,
        },
      },
    });

    // Create notification for document creator
    await prisma.notification.create({
      data: {
        userId: document.createdById,
        type: "REVISION_NEEDED",
        title: "Document Revision Requested",
        message: `Your document "${document.title}" requires revision. Reason: ${validatedData.reason}`,
        link: `/document-control/submission?id=${documentId}`,
        priority: "HIGH",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Revision requested successfully. All signatures have been reset.",
      revisionRequest: {
        id: revisionRequest.id,
        reason: revisionRequest.reason,
        approvalLevel: revisionRequest.approvalLevel,
        createdAt: revisionRequest.createdAt,
      },
      documentStatus: "ON_REVISION",
      revisionCycle: updatedDocument.revisionCycle,
    });
  } catch (error) {
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
