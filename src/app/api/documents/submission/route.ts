import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { handleError } from "@/infrastructure/errors";
import { z } from "zod";
import { ZodError, ZodIssue } from "zod";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler, getRequestUser, type AuthenticatedRequest } from "@/infrastructure/middleware/auth";
import { Prisma, DocumentStatus, NotificationType, Priority } from "@prisma/client";
import { container } from "@/infrastructure/di/container";
import { getMessageKeyByLevel } from "@/infrastructure/services/NotificationService";

const rateLimiter = createRateLimitMiddleware();

// GET /api/documents/submission - List user's document submissions
export const GET = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Get user from WeakMap (more reliable) or request property
    // withAuthHandler guarantees user is set, but we still need to get it
    const authUser = getRequestUser(request) || (request as AuthenticatedRequest).user;
    if (!authUser) {
      // This should never happen if withAuthHandler is working correctly
      console.error('[documents/submission] CRITICAL: User not found after withAuthHandler');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const documentType = searchParams.get("documentType") || "";
    const excludeDraft = searchParams.get("excludeDraft") === "true";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    const skip = (page - 1) * limit;

    // Build where clause - show all documents (not filtered by user)
    const where: Prisma.DocumentWhereInput = {};

    if (search) {
      where.OR = [
        { documentNumber: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ];
    }

    // Handle status filtering - excludeDraft takes precedence
    // Also exclude WAITING_VALIDATION as those documents should appear in validation page
    if (excludeDraft) {
      where.status = { notIn: ["DRAFT", "WAITING_VALIDATION"] };
    } else if (status) {
      where.status = status.toUpperCase() as DocumentStatus;
    }

    if (documentType) {
      where.category = {
        code: documentType.toUpperCase(),
      };
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Set to end of day for dateTo
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          createdBy: {
            select: { id: true, name: true },
          },
          approvals: {
            include: {
              approver: {
                select: { id: true, name: true },
              },
            },
            orderBy: { level: "asc" },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    // Map to response format
    const data = documents.map((doc) => {
      // Find current approver based on status
      const pendingApproval = doc.approvals.find((a) => a.status === "PENDING");
      const approverName = pendingApproval?.approver.name || "-";

      return {
        id: doc.id,
        code: doc.documentNumber,
        title: doc.title,
        type: doc.category.name,
        createdBy: doc.createdBy.name,
        submissionDate: doc.createdAt.toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: mapDocumentStatus(doc.status, doc.approvalStatus),
        approver: approverName,
        lastEdited: formatRelativeTime(doc.updatedAt),
      };
    });

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ["ADMIN", "USER"] });

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "Minute" : "Minutes"} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "Hour" : "Hours"} ago`;
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} Days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
}

// Helper function to map document status
function mapDocumentStatus(status: string, approvalStatus: string): string {
  if (status === "DRAFT") return "draft";
  if (status === "IN_REVIEW" || status === "PENDING_REVIEW") return "on_review";
  if (status === "UNDER_REVIEW") return "on_review";
  if (status === "ON_APPROVAL" || status === "PENDING_APPROVAL") return "on_approval";
  if (status === "PENDING_ACKNOWLEDGED") return "pending_ack";
  if (status === "ON_REVISION") return "on_revision";
  if (status === "WAITING_VALIDATION") return "waiting_validation";
  if (status === "APPROVED" || status === "ACTIVE") return "approved";
  if (status === "REJECTED" || approvalStatus === "REJECTED") return "rejected";
  if (status === "REVISION_REQUIRED" || status === "REVISION_REQUESTED") return "revision_by_reviewer";
  if (status === "PUBLISHED") return "approved";
  if (status === "OBSOLETE") return "obsolete";
  if (status === "ARCHIVED") return "archived";
  // For any other status, check approvalStatus as fallback
  if (approvalStatus === "PENDING") return "on_review";
  if (approvalStatus === "IN_PROGRESS") return "on_review";
  if (approvalStatus === "APPROVED") return "approved";
  return "draft";
}

// Schema for document submission
const documentSubmissionSchema = z.object({
  // Step 1: Document Information
  documentTypeId: z.string().cuid("Invalid document type ID"),
  documentTitle: z.string().min(3, "Document title must be at least 3 characters"),
  destinationDepartmentId: z.string().cuid("Invalid destination department ID"),
  estimatedDistributionDate: z.string().optional(),

  // Step 2: Detail Document
  purpose: z.string().optional(),
  scope: z.string().optional(),
  // Support both array (new format) and single string (legacy format)
  reviewerIds: z.array(z.string().cuid("Invalid reviewer ID")).optional().default([]),
  approverIds: z.array(z.string().cuid("Invalid approver ID")).optional().default([]),
  acknowledgedIds: z.array(z.string().cuid("Invalid acknowledged ID")).optional().default([]),
  responsibleDocument: z.string().optional(),
  termsAndAbbreviations: z.string().optional(),
  warning: z.string().optional(),
  relatedDocuments: z.string().optional(),

  // Step 3: Procedure Document
  procedureContent: z.string().optional(),

  // Step 4: Signature Document
  signature: z.string().optional(),

  // Submission status (from step 5 preview)
  status: z.enum(["DRAFT", "IN_REVIEW"]).optional().default("IN_REVIEW"),
});

export type DocumentSubmissionInput = z.infer<typeof documentSubmissionSchema>;

// POST /api/documents/submission - Submit a new document
export const POST = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Get current user from auth (attached by withAuthHandler)
    const authRequest = request as AuthenticatedRequest;
    const authUser = authRequest.user;
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use userId from token
    const userId = authUser.userId;

    const body = await request.json();
    const validatedData = documentSubmissionSchema.parse(body);

    // Get user's department and signature
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true, position: true },
    });

    if (!user || !user.departmentId) {
      return NextResponse.json(
        { error: "User department not found" },
        { status: 400 }
      );
    }

    // Get category for generating document code
    const category = await prisma.documentCategory.findUnique({
      where: { id: validatedData.documentTypeId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Document category not found" },
        { status: 400 }
      );
    }

    // Generate document number by finding the highest existing number
    const deptCode = user.department?.code || "DOC";
    const basePattern = `${category.code}-${deptCode}-`;

    // Find the highest document number for this category and department
    const latestDocument = await prisma.document.findFirst({
      where: {
        documentNumber: {
          contains: basePattern,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        documentNumber: true,
      },
    });

    let nextNumber = 1;
    if (latestDocument) {
      // Extract the number from document number (e.g., "WI-DT-001" or "DRAFT-WI-DT-001")
      const docNum = latestDocument.documentNumber.replace("DRAFT-", "");
      const match = docNum.match(new RegExp(`${basePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)`));
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    let documentNumber = `${basePattern}${String(nextNumber).padStart(3, "0")}`;

    // Add DRAFT- prefix if status is DRAFT
    if (validatedData.status === "DRAFT") {
      documentNumber = `DRAFT-${documentNumber}`;
    }

    // Ensure uniqueness with retry logic
    let isUnique = false;
    let retryCount = 0;
    const maxRetries = 10;

    while (!isUnique && retryCount < maxRetries) {
      const existing = await prisma.document.findUnique({
        where: { documentNumber },
        select: { id: true },
      });

      if (!existing) {
        isUnique = true;
      } else {
        // Increment and try again
        nextNumber++;
        documentNumber = `${basePattern}${String(nextNumber).padStart(3, "0")}`;
        if (validatedData.status === "DRAFT") {
          documentNumber = `DRAFT-${documentNumber}`;
        }
        retryCount++;
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: "Gagal membuat nomor dokumen unik. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // Determine the signature to use for "Prepared By"
    // Use new signature from step 4 if provided, otherwise use existing user signature
    const preparedBySignature = validatedData.signature || user.signature || null;

    // Determine document status and approval status based on submission type
    const documentStatus = validatedData.status || "IN_REVIEW";
    const approvalStatus = documentStatus === "DRAFT" ? "PENDING" : "PENDING";

    // Create document with all submission data
    const document = await prisma.document.create({
      data: {
        documentNumber,
        title: validatedData.documentTitle,
        description: validatedData.purpose || null,
        categoryId: validatedData.documentTypeId,
        version: "1.0",
        revisionNumber: 0,
        status: documentStatus,
        approvalStatus: approvalStatus,
        fileUrl: "", // Will be generated later
        fileName: `${documentNumber}.pdf`,
        fileSize: 0,
        mimeType: "application/pdf",
        createdById: userId,
        ownerId: userId,

        // Step 1: Document Information
        destinationDepartmentId: validatedData.destinationDepartmentId,
        estimatedDistributionDate: validatedData.estimatedDistributionDate
          ? new Date(validatedData.estimatedDistributionDate)
          : null,

        // Step 2: Detail Document
        scope: validatedData.scope || null,
        responsibleDocument: validatedData.responsibleDocument || null,
        termsAndAbbreviations: validatedData.termsAndAbbreviations || null,
        warning: validatedData.warning || null,
        relatedDocumentsText: validatedData.relatedDocuments || null,

        // Step 3: Procedure Document
        procedureContent: validatedData.procedureContent || null,

        // Auto-capture creator's signature as "Prepared By"
        preparedBySignature: preparedBySignature,
        preparedBySignedAt: preparedBySignature ? new Date() : null,
      },
    });

    // Update user signature if provided (from signature pad in step 4)
    if (validatedData.signature) {
      await prisma.user.update({
        where: { id: userId },
        data: { signature: validatedData.signature },
      });
    }

    // Create approval workflow entries for multiple users per level
    const approvalEntries: { userId: string; level: number; role: string }[] = [];

    // Level 1: Reviewers
    if (validatedData.reviewerIds && validatedData.reviewerIds.length > 0) {
      validatedData.reviewerIds.forEach((userId) => {
        approvalEntries.push({ userId, level: 1, role: "Reviewer" });
      });
    }

    // Level 2: Approvers
    if (validatedData.approverIds && validatedData.approverIds.length > 0) {
      validatedData.approverIds.forEach((userId) => {
        approvalEntries.push({ userId, level: 2, role: "Approver" });
      });
    }

    // Level 3: Acknowledged
    if (validatedData.acknowledgedIds && validatedData.acknowledgedIds.length > 0) {
      validatedData.acknowledgedIds.forEach((userId) => {
        approvalEntries.push({ userId, level: 3, role: "Acknowledged" });
      });
    }

    // Create all approval entries
    for (const approver of approvalEntries) {
      await prisma.documentApproval.create({
        data: {
          documentId: document.id,
          approverId: approver.userId,
          level: approver.level,
          status: "PENDING",
        },
      });
    }

    // Log activity
    const actionDescription = documentStatus === "DRAFT"
      ? `Saved document as draft: ${document.title}`
      : `Submitted document for review: ${document.title}`;

    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: "DOCUMENT_CREATED",
        entity: "Document",
        entityId: document.id,
        description: actionDescription,
        metadata: {
          documentNumber: document.documentNumber,
          categoryId: document.categoryId,
          destinationDepartmentId: validatedData.destinationDepartmentId,
          status: documentStatus,
        },
      },
    });

    // ===== NOTIFICATION: Document Submitted =====
    // Send notification to ALL reviewers when document is submitted for review
    if (documentStatus === "IN_REVIEW" && approvalEntries.length > 0) {
      try {
        const notificationService = container.cradle.notificationService;

        // Find ALL reviewers at level 1 (not just the first one)
        const allReviewers = approvalEntries.filter((a) => a.level === 1);

        if (allReviewers.length > 0) {
          // Get all reviewer details
          const reviewerIds = allReviewers.map((r) => r.userId);
          const reviewers = await prisma.user.findMany({
            where: { id: { in: reviewerIds } },
            select: { id: true, name: true },
          });

          const messageKey = getMessageKeyByLevel(1); // REVIEW_REQUIRED

          // Send notification to each reviewer
          for (const reviewer of reviewers) {
            await notificationService.sendLocalizedNotification(
              reviewer.id,
              NotificationType.APPROVAL_NEEDED,
              messageKey,
              {
                docTitle: document.title,
                requesterName: user.name || "Unknown",
              },
              `/document-control/approval/${document.id}`,
              Priority.HIGH
            );

            console.log(
              `[DocumentSubmission] Notification sent to reviewer: ${reviewer.name}`
            );
          }

          console.log(
            `[DocumentSubmission] Total ${reviewers.length} reviewers notified`
          );
        }
      } catch (notificationError) {
        // Don't fail the submission if notification fails
        console.error(
          "[DocumentSubmission] Failed to send notification:",
          notificationError
        );
      }
    }

    const successMessage = documentStatus === "DRAFT"
      ? "Document saved as draft successfully"
      : "Document submitted for review successfully";

    return NextResponse.json(
      {
        message: successMessage,
        document: {
          id: document.id,
          documentNumber: document.documentNumber,
          title: document.title,
          status: document.status,
        },
      },
      { status: 201 }
    );
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
