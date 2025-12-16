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

    // Check if already signed
    if (approval.signedAt) {
      return NextResponse.json(
        { error: "This approval has already been signed" },
        { status: 400 }
      );
    }

    // Validate sequential signing order
    // 1. Check if "Prepared By" is signed (document.preparedBySignedAt must exist)
    if (!document.preparedBySignedAt) {
      return NextResponse.json(
        { error: "Document must be signed by the creator first" },
        { status: 400 }
      );
    }

    // 2. Check all previous approvals are signed
    // Filter approvals that should be signed before this one
    const previousApprovals = document.approvals.filter(a => {
      if (a.id === approval.id) return false;
      // Lower level must be signed first
      if (a.level < approval.level) return true;
      // Same level: check creation order (earlier created = must sign first)
      if (a.level === approval.level && a.createdAt < approval.createdAt) return true;
      return false;
    });

    const unsignedPrevious = previousApprovals.filter(a => !a.signedAt);
    if (unsignedPrevious.length > 0) {
      return NextResponse.json(
        { error: "Previous approvals must be signed first" },
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

    // Update the approval with signature
    const updatedApproval = await prisma.documentApproval.update({
      where: { id: validatedData.approvalId },
      data: {
        signatureImage,
        signedAt: new Date(),
        status: "APPROVED",
        approvedAt: new Date(),
      },
      include: {
        approver: {
          select: { id: true, name: true },
        },
      },
    });

    // Check if all approvals are now signed
    const allApprovals = await prisma.documentApproval.findMany({
      where: { documentId, isDeleted: false },
    });

    const allSigned = allApprovals.every(a => a.signedAt !== null);
    const allApproved = allApprovals.every(a => a.status === "APPROVED");

    // Update document approval status if all are approved
    if (allApproved) {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          approvalStatus: "APPROVED",
          status: "APPROVED",
        },
      });
    } else {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          approvalStatus: "IN_PROGRESS",
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "DOCUMENT_APPROVED",
        entity: "DocumentApproval",
        entityId: updatedApproval.id,
        description: `Signed document: ${document.title}`,
        metadata: {
          documentId: document.id,
          documentNumber: document.documentNumber,
          approvalLevel: approval.level,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Document signed successfully",
      approval: {
        id: updatedApproval.id,
        level: updatedApproval.level,
        status: updatedApproval.status,
        signedAt: updatedApproval.signedAt,
        approver: updatedApproval.approver,
      },
      documentStatus: allApproved ? "APPROVED" : "IN_PROGRESS",
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
