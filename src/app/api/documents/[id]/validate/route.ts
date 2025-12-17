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

// Schema for validation request
const validateDocumentSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  comments: z.string().optional(),
});

// POST /api/documents/[id]/validate - Admin validation of document
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
    const validatedData = validateDocumentSchema.parse(body);

    // Get the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        approvals: {
          where: { isDeleted: false },
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

    // Check if document is in WAITING_VALIDATION status
    if (document.status !== "WAITING_VALIDATION") {
      return NextResponse.json(
        { error: `Document must be in WAITING_VALIDATION status to validate. Current status: ${document.status}` },
        { status: 400 }
      );
    }

    if (validatedData.action === "APPROVE") {
      // Approve the document
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "APPROVED",
          approvalStatus: "APPROVED",
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          action: "DOCUMENT_APPROVED",
          entity: "Document",
          entityId: documentId,
          description: `Admin validated and approved document: ${document.title}`,
          metadata: {
            documentId: document.id,
            documentNumber: document.documentNumber,
            action: "ADMIN_VALIDATION_APPROVE",
            comments: validatedData.comments,
          },
        },
      });

      // Notify document creator
      await prisma.notification.create({
        data: {
          userId: document.createdById,
          type: "DOCUMENT_APPROVED",
          title: "Document Approved",
          message: `Your document "${document.title}" has been validated and approved.`,
          link: `/document-control/submission?id=${documentId}`,
          priority: "MEDIUM",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Document validated and approved successfully",
        documentStatus: "APPROVED",
      });
    } else {
      // Reject - same as requesting revision but by admin
      // Create snapshot of current signatures
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
          reason: validatedData.comments || "Admin rejected during validation",
          approvalLevel: 0, // 0 indicates admin/system level
          signatureSnapshot: signatureSnapshot,
        },
      });

      // Reset ALL approval signatures and statuses
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

      // Update document status
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

      // Update approval revision cycles
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
          action: "DOCUMENT_REJECTED",
          entity: "Document",
          entityId: documentId,
          description: `Admin rejected document during validation: ${document.title}`,
          metadata: {
            documentId: document.id,
            documentNumber: document.documentNumber,
            action: "ADMIN_VALIDATION_REJECT",
            revisionRequestId: revisionRequest.id,
            comments: validatedData.comments,
            revisionCycle: updatedDocument.revisionCycle,
          },
        },
      });

      // Notify document creator
      await prisma.notification.create({
        data: {
          userId: document.createdById,
          type: "REVISION_NEEDED",
          title: "Document Rejected by Admin",
          message: `Your document "${document.title}" was rejected during validation. ${validatedData.comments ? `Reason: ${validatedData.comments}` : "Please check and revise."}`,
          link: `/document-control/submission?id=${documentId}`,
          priority: "HIGH",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Document rejected. All signatures have been reset for revision.",
        documentStatus: "ON_REVISION",
        revisionCycle: updatedDocument.revisionCycle,
      });
    }
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
}, { allowedRoles: ["ADMIN"] }); // Only admin can validate
