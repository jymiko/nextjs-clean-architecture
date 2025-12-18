import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { handleError } from "@/infrastructure/errors";
import { z } from "zod";
import { ZodError, ZodIssue } from "zod";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler, type AuthenticatedRequest } from "@/infrastructure/middleware/auth";
import { NotificationType, Priority } from "@prisma/client";
import { container } from "@/infrastructure/di/container";
import {
  getMessageKeyByLevel,
  getRoleLabelByLevel,
} from "@/infrastructure/services/NotificationService";

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

    // ===== NOTIFICATIONS: After Approval Confirmation =====
    try {
      const notificationService = container.cradle.notificationService;

      // Get requester info
      const requester = await prisma.user.findUnique({
        where: { id: document.createdById },
        select: { id: true, name: true },
      });

      // Get signer's language for role label
      const signerLanguage = await notificationService.getUserLanguage(userId);
      const roleLabel = getRoleLabelByLevel(approval.level, signerLanguage);

      // 1. Notify requester that someone signed their document
      if (requester) {
        await notificationService.sendLocalizedNotification(
          document.createdById,
          NotificationType.DOCUMENT_APPROVED,
          "DOCUMENT_SIGNED",
          {
            docTitle: document.title,
            signerName: updatedApproval.approver.name,
            role: roleLabel,
          },
          `/document-control/submission?id=${documentId}`,
          Priority.MEDIUM
        );

        console.log(
          `[ConfirmApprove] Notification sent to requester: ${requester.name}`
        );
      }

      // 2. Find and notify next signer (if not yet WAITING_VALIDATION)
      if (newDocumentStatus !== "WAITING_VALIDATION") {
        // Get fresh approval list with approver info
        const allApprovals = await prisma.documentApproval.findMany({
          where: { documentId, isDeleted: false },
          orderBy: [{ level: "asc" }, { createdAt: "asc" }],
          include: {
            approver: { select: { id: true, name: true } },
          },
        });

        // Check if there are more PENDING at current level
        const pendingAtCurrentLevel = allApprovals.filter(
          (a) => a.level === approval.level && a.status === "PENDING"
        );

        if (pendingAtCurrentLevel.length > 0) {
          // Still have pending at current level - notify FIRST one only (sequential at same level)
          const nextSigner = pendingAtCurrentLevel[0];
          const messageKey = getMessageKeyByLevel(nextSigner.level);

          await notificationService.sendLocalizedNotification(
            nextSigner.approverId,
            NotificationType.APPROVAL_NEEDED,
            messageKey,
            {
              docTitle: document.title,
              requesterName: requester?.name || "Unknown",
            },
            `/document-control/approval/${documentId}`,
            Priority.HIGH
          );

          console.log(
            `[ConfirmApprove] Notification sent to next signer at current level: ${nextSigner.approver.name}`
          );
        } else {
          // All at current level done, check next level
          const allCurrentLevelApproved = allApprovals
            .filter((a) => a.level === approval.level)
            .every((a) => a.status === "APPROVED");

          if (allCurrentLevelApproved) {
            const nextLevel = approval.level + 1;
            // Get ALL pending at next level (notify all when transitioning to new level)
            const pendingAtNextLevel = allApprovals.filter(
              (a) => a.level === nextLevel && a.status === "PENDING"
            );

            if (pendingAtNextLevel.length > 0) {
              const messageKey = getMessageKeyByLevel(nextLevel);

              // Notify ALL pending at next level
              for (const nextSigner of pendingAtNextLevel) {
                await notificationService.sendLocalizedNotification(
                  nextSigner.approverId,
                  NotificationType.APPROVAL_NEEDED,
                  messageKey,
                  {
                    docTitle: document.title,
                    requesterName: requester?.name || "Unknown",
                  },
                  `/document-control/approval/${documentId}`,
                  Priority.HIGH
                );

                console.log(
                  `[ConfirmApprove] Notification sent to next level signer: ${nextSigner.approver.name}`
                );
              }

              console.log(
                `[ConfirmApprove] Total ${pendingAtNextLevel.length} signers at level ${nextLevel} notified`
              );
            }
          }
        }
      }

      // 3. Notify all admins when document reaches WAITING_VALIDATION
      if (newDocumentStatus === "WAITING_VALIDATION") {
        // Get all active admins
        const admins = await prisma.user.findMany({
          where: {
            role: "ADMIN",
            isActive: true,
            deletedAt: null,
          },
          select: { id: true, name: true },
        });

        for (const admin of admins) {
          await notificationService.sendLocalizedNotification(
            admin.id,
            NotificationType.APPROVAL_NEEDED,
            "VALIDATION_REQUIRED",
            {
              docTitle: document.title,
              docNumber: document.documentNumber,
            },
            `/document-control/validation/${documentId}`,
            Priority.HIGH
          );

          console.log(
            `[ConfirmApprove] Validation notification sent to admin: ${admin.name}`
          );
        }

        // Also notify requester that document is awaiting validation
        if (requester) {
          await notificationService.sendLocalizedNotification(
            document.createdById,
            NotificationType.GENERAL,
            "AWAITING_VALIDATION",
            {
              docTitle: document.title,
            },
            `/document-control/submission?id=${documentId}`,
            Priority.MEDIUM
          );

          console.log(
            `[ConfirmApprove] Awaiting validation notification sent to requester: ${requester.name}`
          );
        }
      }
    } catch (notificationError) {
      // Don't fail the approval if notification fails
      console.error(
        "[ConfirmApprove] Failed to send notification:",
        notificationError
      );
    }

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
