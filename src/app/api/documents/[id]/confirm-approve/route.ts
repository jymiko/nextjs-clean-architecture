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

// Schema for confirm approval request
const confirmApprovalSchema = z.object({
  approvalId: z.string().cuid("Invalid approval ID"),
});

// POST /api/documents/[id]/confirm-approve - Confirm approval after signing
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
    const validatedData = confirmApprovalSchema.parse(body);

    // Get the document with all approvals
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        approvals: {
          where: { isDeleted: false },
          orderBy: [{ level: "asc" }, { createdAt: "asc" }],
          include: {
            approver: {
              select: { id: true, name: true },
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

    // Find the approval to confirm
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
        { error: "You are not authorized to confirm this approval" },
        { status: 403 }
      );
    }

    // Check if approval is in SIGNED status (must be signed before confirming)
    if (approval.status !== "SIGNED") {
      if (approval.status === "APPROVED") {
        return NextResponse.json(
          { error: "This approval has already been confirmed" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "You must sign the document before confirming approval" },
        { status: 400 }
      );
    }

    // Update the approval to APPROVED status
    const updatedApproval = await prisma.documentApproval.update({
      where: { id: validatedData.approvalId },
      data: {
        status: "APPROVED",
        confirmedAt: new Date(),
        approvedAt: new Date(),
      },
      include: {
        approver: {
          select: { id: true, name: true },
        },
      },
    });

    // Check if all approvals at the current level are now approved
    const currentLevelApprovals = document.approvals.filter(a => a.level === approval.level);
    const allCurrentLevelApproved = currentLevelApprovals.every(a =>
      a.id === approval.id ? true : a.status === "APPROVED"
    );

    // Determine the new document status based on approval progression
    let newDocumentStatus = document.status;
    let newApprovalStatus = document.approvalStatus;

    // Get counts per level
    const level1Approvals = document.approvals.filter(a => a.level === 1);
    const level2Approvals = document.approvals.filter(a => a.level === 2);
    const level3Approvals = document.approvals.filter(a => a.level === 3);

    // Check if all levels are approved (after this approval is confirmed)
    const allLevel1Approved = level1Approvals.every(a =>
      a.id === approval.id ? true : a.status === "APPROVED"
    );
    const allLevel2Approved = level2Approvals.length === 0 || level2Approvals.every(a =>
      a.id === approval.id ? true : a.status === "APPROVED"
    );
    const allLevel3Approved = level3Approvals.length === 0 || level3Approvals.every(a =>
      a.id === approval.id ? true : a.status === "APPROVED"
    );

    // Determine new status based on which level just got fully approved
    if (allLevel1Approved && allLevel2Approved && allLevel3Approved) {
      // All levels are approved - move to WAITING_VALIDATION
      newDocumentStatus = "WAITING_VALIDATION";
      newApprovalStatus = "IN_PROGRESS"; // Keep as IN_PROGRESS until admin validates
    } else if (allLevel1Approved && allLevel2Approved && level3Approvals.length > 0) {
      // All reviewers and approvers approved, but acknowledged pending - move to PENDING_ACKNOWLEDGED
      newDocumentStatus = "PENDING_ACKNOWLEDGED";
      newApprovalStatus = "IN_PROGRESS";
    } else if (approval.level === 1 && allLevel1Approved) {
      // All reviewers approved - move to ON_APPROVAL
      newDocumentStatus = "ON_APPROVAL";
      newApprovalStatus = "IN_PROGRESS";
    } else if (approval.level === 2 && allLevel1Approved && allLevel2Approved && level3Approvals.length === 0) {
      // All reviewers and approvers approved, no acknowledged needed - move to WAITING_VALIDATION
      newDocumentStatus = "WAITING_VALIDATION";
      newApprovalStatus = "IN_PROGRESS";
    } else {
      // Still in progress
      newApprovalStatus = "IN_PROGRESS";
    }

    // Update document status if changed
    if (newDocumentStatus !== document.status || newApprovalStatus !== document.approvalStatus) {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: newDocumentStatus,
          approvalStatus: newApprovalStatus,
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "APPROVAL_COMPLETED",
        entity: "DocumentApproval",
        entityId: updatedApproval.id,
        description: `Confirmed approval for document: ${document.title}`,
        metadata: {
          documentId: document.id,
          documentNumber: document.documentNumber,
          approvalLevel: approval.level,
          newDocumentStatus,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Approval confirmed successfully",
      approval: {
        id: updatedApproval.id,
        level: updatedApproval.level,
        status: updatedApproval.status,
        confirmedAt: updatedApproval.confirmedAt,
        approver: updatedApproval.approver,
      },
      documentStatus: newDocumentStatus,
      approvalStatus: newApprovalStatus,
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
