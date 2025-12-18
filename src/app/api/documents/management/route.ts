import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { handleError } from "@/infrastructure/errors";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler, getRequestUser } from "@/infrastructure/middleware/auth";
import { z } from "zod";

const rateLimiter = createRateLimitMiddleware();

// Query schema for management documents
const managementQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  departmentId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(["all", "active", "pending_obsolete_approval", "expiring_soon"]).optional().default("all"),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Calculate days until expiry
function getDaysUntilExpiry(expiryDate: Date | null): number | null {
  if (!expiryDate) return null;
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Map document to management status
function getManagementStatus(
  status: string,
  approvalStatus: string | null,
  expiryDate: Date | null
): "active" | "pending_obsolete_approval" | "expiring_soon" {
  // Check if document is waiting for obsolete approval
  if (status === "WAITING_VALIDATION" || approvalStatus === "PENDING") {
    return "pending_obsolete_approval";
  }

  // Check if document is expiring soon (within 30 days)
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  if (daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
    return "expiring_soon";
  }

  return "active";
}

// Format date for display
function formatDate(date: Date | null): string | undefined {
  if (!date) return undefined;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// GET /api/documents/management - Get documents for management view
export const GET = withAuthHandler(
  async (request: NextRequest) => {
    try {
      const rateLimitResponse = await rateLimiter(request);
      if (rateLimitResponse) return rateLimitResponse;

      const user = getRequestUser(request);
      const { searchParams } = new URL(request.url);

      // Parse and validate query params
      const queryParams = {
        page: searchParams.get("page") || "1",
        limit: searchParams.get("limit") || "10",
        search: searchParams.get("search") || undefined,
        departmentId: searchParams.get("departmentId") || undefined,
        categoryId: searchParams.get("categoryId") || undefined,
        status: searchParams.get("status") || "all",
        sortBy: searchParams.get("sortBy") || "createdAt",
        sortOrder: searchParams.get("sortOrder") || "desc",
      };

      const validated = managementQuerySchema.parse(queryParams);
      const page = parseInt(validated.page);
      const limit = Math.min(parseInt(validated.limit), 100);
      const skip = (page - 1) * limit;

      // Check if user is admin
      const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        // Only show ACTIVE or APPROVED documents in management
        OR: [
          { status: "ACTIVE" },
          { status: "APPROVED" },
        ],
        isObsolete: false,
      };

      // For non-admin users, only show documents distributed to them
      if (!isAdmin && user?.userId) {
        where.distributions = {
          some: {
            distributedToId: user.userId,
            isDeleted: false,
          },
        };
      }

      // Search filter
      if (validated.search) {
        where.OR = [
          { documentNumber: { contains: validated.search, mode: "insensitive" } },
          { title: { contains: validated.search, mode: "insensitive" } },
        ];
      }

      // Department filter
      if (validated.departmentId) {
        where.destinationDepartmentId = validated.departmentId;
      }

      // Category filter
      if (validated.categoryId) {
        where.categoryId = validated.categoryId;
      }

      // Get documents with relations
      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [validated.sortBy]: validated.sortOrder,
          },
          include: {
            category: {
              select: { id: true, name: true, code: true },
            },
            destinationDepartment: {
              select: { id: true, name: true, code: true },
            },
            createdBy: {
              select: { id: true, name: true },
            },
            approvals: {
              where: { isDeleted: false },
              orderBy: { level: "asc" },
              select: {
                id: true,
                level: true,
                status: true,
                approvedAt: true,
              },
            },
            distributions: {
              where: { isDeleted: false },
              take: 1,
              select: {
                id: true,
              },
            },
          },
        }),
        prisma.document.count({ where }),
      ]);

      // Filter by management status if specified
      let filteredDocuments = documents;
      if (validated.status !== "all") {
        filteredDocuments = documents.filter((doc) => {
          const managementStatus = getManagementStatus(
            doc.status,
            doc.approvalStatus,
            doc.expiryDate
          );
          return managementStatus === validated.status;
        });
      }

      // Map documents to response format
      const mappedDocuments = filteredDocuments.map((doc) => {
        const managementStatus = getManagementStatus(
          doc.status,
          doc.approvalStatus,
          doc.expiryDate
        );

        // Get approved date from approvals
        const approvedApproval = doc.approvals?.find((a) => a.status === "APPROVED");
        const approvedDate = approvedApproval?.approvedAt || doc.validatedAt;

        // Get distributed date - use document createdAt as fallback
        const distributedDate = doc.createdAt;

        return {
          id: doc.id,
          code: doc.documentNumber,
          title: doc.title,
          type: doc.category?.name || "-",
          department: doc.destinationDepartment?.name,
          approvedDate: formatDate(approvedDate),
          distributedDate: formatDate(distributedDate),
          expiredDate: formatDate(doc.expiryDate),
          status: managementStatus,
          // Prioritize finalPdfUrl (with signatures) over fileUrl (original upload)
          pdfUrl: doc.finalPdfUrl || doc.fileUrl,
        };
      });

      // Calculate statistics
      const stats = {
        total: total,
        active: documents.filter(
          (doc) => getManagementStatus(doc.status, doc.approvalStatus, doc.expiryDate) === "active"
        ).length,
        pendingObsolete: documents.filter(
          (doc) => getManagementStatus(doc.status, doc.approvalStatus, doc.expiryDate) === "pending_obsolete_approval"
        ).length,
        expiringSoon: documents.filter(
          (doc) => getManagementStatus(doc.status, doc.approvalStatus, doc.expiryDate) === "expiring_soon"
        ).length,
      };

      return NextResponse.json({
        data: mappedDocuments,
        pagination: {
          page,
          limit,
          total: validated.status === "all" ? total : filteredDocuments.length,
          totalPages: Math.ceil((validated.status === "all" ? total : filteredDocuments.length) / limit),
        },
        statistics: stats,
        isAdmin,
      });
    } catch (error) {
      return handleError(error, request);
    }
  },
  { allowedRoles: ["ADMIN", "USER"] }
);
