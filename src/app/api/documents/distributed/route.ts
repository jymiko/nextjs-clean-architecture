import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { handleError } from "@/infrastructure/errors";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler, getRequestUser } from "@/infrastructure/middleware/auth";
import { z } from "zod";

const rateLimiter = createRateLimitMiddleware();

// Query schema for distributed documents
const distributedQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  departmentId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(["all", "active", "obsolete_request"]).optional().default("all"),
  sortBy: z.string().optional().default("distributedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

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

// Map document status to distributed status
function getDistributedStatus(
  docStatus: string,
  hasObsoleteRequest: boolean
): "active" | "obsolete_request" {
  if (hasObsoleteRequest || docStatus === "WAITING_VALIDATION") {
    return "obsolete_request";
  }
  return "active";
}

// GET /api/documents/distributed - Get documents distributed to current user
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
        sortBy: searchParams.get("sortBy") || "distributedAt",
        sortOrder: searchParams.get("sortOrder") || "desc",
      };

      const validated = distributedQuerySchema.parse(queryParams);
      const page = parseInt(validated.page);
      const limit = Math.min(parseInt(validated.limit), 100);
      const skip = (page - 1) * limit;

      // Check if user is admin
      const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

      // Build where clause for distributions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const distributionWhere: any = {
        isDeleted: false,
      };

      // For non-admin users, only show documents distributed to them
      if (!isAdmin && user?.userId) {
        distributionWhere.distributedToId = user.userId;
      }

      // Build where clause for documents
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const documentWhere: any = {};

      // Search filter
      if (validated.search) {
        documentWhere.OR = [
          { documentNumber: { contains: validated.search, mode: "insensitive" } },
          { title: { contains: validated.search, mode: "insensitive" } },
        ];
      }

      // Department filter (origin department)
      if (validated.departmentId) {
        documentWhere.destinationDepartmentId = validated.departmentId;
      }

      // Category filter
      if (validated.categoryId) {
        documentWhere.categoryId = validated.categoryId;
      }

      // Get distributions with document data
      const [distributions, total] = await Promise.all([
        prisma.documentDistribution.findMany({
          where: {
            ...distributionWhere,
            document: documentWhere,
          },
          skip,
          take: limit,
          orderBy: {
            [validated.sortBy]: validated.sortOrder,
          },
          include: {
            document: {
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
              },
            },
          },
        }),
        prisma.documentDistribution.count({
          where: {
            ...distributionWhere,
            document: documentWhere,
          },
        }),
      ]);

      // Filter by distributed status if specified
      let filteredDistributions = distributions;
      if (validated.status !== "all") {
        filteredDistributions = distributions.filter((dist) => {
          const distributedStatus = getDistributedStatus(
            dist.document.status,
            dist.document.status === "WAITING_VALIDATION"
          );
          return distributedStatus === validated.status;
        });
      }

      // Map distributions to response format
      const mappedDocuments = filteredDistributions.map((dist) => {
        const doc = dist.document;
        const distributedStatus = getDistributedStatus(
          doc.status,
          doc.status === "WAITING_VALIDATION"
        );

        return {
          id: doc.id,
          distributionId: dist.id,
          code: doc.documentNumber,
          title: doc.title,
          type: doc.category?.name || "-",
          originDepartment: doc.destinationDepartment?.name || "-",
          documentBy: doc.createdBy?.name || "-",
          distributedDate: formatDate(dist.distributedAt),
          status: distributedStatus,
          // Prioritize finalPdfUrl (with signatures) over fileUrl (original upload)
          pdfUrl: doc.finalPdfUrl || doc.fileUrl,
        };
      });

      // Calculate statistics
      const allDistributions = await prisma.documentDistribution.findMany({
        where: {
          ...distributionWhere,
        },
        include: {
          document: {
            select: { status: true },
          },
        },
      });

      const stats = {
        total: allDistributions.length,
        active: allDistributions.filter(
          (d) => getDistributedStatus(d.document.status, d.document.status === "WAITING_VALIDATION") === "active"
        ).length,
        obsoleteRequest: allDistributions.filter(
          (d) => getDistributedStatus(d.document.status, d.document.status === "WAITING_VALIDATION") === "obsolete_request"
        ).length,
      };

      return NextResponse.json({
        data: mappedDocuments,
        pagination: {
          page,
          limit,
          total: validated.status === "all" ? total : filteredDistributions.length,
          totalPages: Math.ceil((validated.status === "all" ? total : filteredDistributions.length) / limit),
        },
        statistics: stats,
      });
    } catch (error) {
      return handleError(error, request);
    }
  },
  { allowedRoles: ["ADMIN", "USER"] }
);
