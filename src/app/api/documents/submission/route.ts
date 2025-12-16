import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { handleError } from "@/infrastructure/errors";
import { z } from "zod";
import { ZodError, ZodIssue } from "zod";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler, getRequestUser, type AuthenticatedRequest } from "@/infrastructure/middleware/auth";

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

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      createdById: authUser.userId,
    };

    if (search) {
      where.OR = [
        { documentNumber: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    if (documentType) {
      where.category = {
        code: documentType.toUpperCase(),
      };
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

// Helper function to map document status
function mapDocumentStatus(status: string, approvalStatus: string): string {
  if (status === "DRAFT") return "draft";
  if (status === "IN_REVIEW" || status === "PENDING_REVIEW" || approvalStatus === "PENDING") return "on_review";
  if (status === "UNDER_REVIEW") return "on_review";
  if (status === "PENDING_APPROVAL") return "on_approval";
  if (status === "APPROVED") return "approved";
  if (status === "REJECTED") return "rejected";
  if (status === "REVISION_REQUESTED") return "revision_by_reviewer";
  if (status === "PUBLISHED") return "approved";
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
  reviewerId: z.string().cuid("Invalid reviewer ID").optional().or(z.literal("")),
  approverId: z.string().cuid("Invalid approver ID").optional().or(z.literal("")),
  acknowledgedId: z.string().cuid("Invalid acknowledged ID").optional().or(z.literal("")),
  responsibleDocument: z.string().optional(),
  termsAndAbbreviations: z.string().optional(),
  warning: z.string().optional(),
  relatedDocuments: z.string().optional(),

  // Step 3: Procedure Document
  procedureContent: z.string().optional(),

  // Step 4: Signature Document
  signature: z.string().optional(),
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

    // Generate document number
    const existingCount = await prisma.document.count({
      where: { categoryId: validatedData.documentTypeId },
    });
    const nextNumber = existingCount + 1;
    const documentNumber = `${category.code}-${user.department?.code || "DOC"}-${String(nextNumber).padStart(3, "0")}`;

    // Determine the signature to use for "Prepared By"
    // Use new signature from step 4 if provided, otherwise use existing user signature
    const preparedBySignature = validatedData.signature || user.signature || null;

    // Create document with all submission data
    const document = await prisma.document.create({
      data: {
        documentNumber,
        title: validatedData.documentTitle,
        description: validatedData.purpose || null,
        categoryId: validatedData.documentTypeId,
        version: "1.0",
        revisionNumber: 0,
        status: "IN_REVIEW",
        approvalStatus: "PENDING",
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

    // Create approval workflow entries
    const approvers = [
      { userId: validatedData.reviewerId, level: 1, role: "Reviewer" },
      { userId: validatedData.approverId, level: 2, role: "Approver" },
      { userId: validatedData.acknowledgedId, level: 3, role: "Acknowledged" },
    ].filter((a) => a.userId && a.userId !== "");

    for (const approver of approvers) {
      await prisma.documentApproval.create({
        data: {
          documentId: document.id,
          approverId: approver.userId!,
          level: approver.level,
          status: "PENDING",
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: "DOCUMENT_CREATED",
        entity: "Document",
        entityId: document.id,
        description: `Created document submission: ${document.title}`,
        metadata: {
          documentNumber: document.documentNumber,
          categoryId: document.categoryId,
          destinationDepartmentId: validatedData.destinationDepartmentId,
        },
      },
    });

    return NextResponse.json(
      {
        message: "Document submitted successfully",
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
