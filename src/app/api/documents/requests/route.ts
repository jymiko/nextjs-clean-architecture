import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { handleError } from "@/infrastructure/errors";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler, getRequestUser } from "@/infrastructure/middleware/auth";
import { z } from "zod";

const rateLimiter = createRateLimitMiddleware();

// Query schema for document requests
const requestsQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(["all", "pending", "approved", "rejected"]).optional().default("all"),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Format date for display
function formatDate(date: Date | null): string {
  if (!date) return "-";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Generate request code from date
function generateRequestCode(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `Req-${year}-${month}-${day}`;
}

// Map request status to UI status
function mapRequestStatus(status: string): "pending" | "approved" | "rejected" {
  switch (status) {
    case "COMPLETED":
      return "approved";
    case "CANCELLED":
    case "ON_HOLD":
      return "rejected";
    default:
      return "pending";
  }
}

// GET /api/documents/requests - Get document requests
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
        categoryId: searchParams.get("categoryId") || undefined,
        status: searchParams.get("status") || "all",
        sortBy: searchParams.get("sortBy") || "createdAt",
        sortOrder: searchParams.get("sortOrder") || "desc",
      };

      const validated = requestsQuerySchema.parse(queryParams);
      const page = parseInt(validated.page);
      const limit = Math.min(parseInt(validated.limit), 100);
      const skip = (page - 1) * limit;

      // Check if user is admin
      const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      // For non-admin users, only show their own requests
      if (!isAdmin && user?.userId) {
        where.requestedById = user.userId;
      }

      // Status filter
      if (validated.status !== "all") {
        switch (validated.status) {
          case "pending":
            where.status = { in: ["PENDING", "IN_PROGRESS"] };
            break;
          case "approved":
            where.status = "COMPLETED";
            break;
          case "rejected":
            where.status = { in: ["CANCELLED", "ON_HOLD"] };
            break;
        }
      }

      // Search filter
      if (validated.search) {
        where.OR = [
          { document: { documentNumber: { contains: validated.search, mode: "insensitive" } } },
          { document: { title: { contains: validated.search, mode: "insensitive" } } },
          { description: { contains: validated.search, mode: "insensitive" } },
        ];
      }

      // Category filter
      if (validated.categoryId) {
        where.document = {
          ...where.document,
          categoryId: validated.categoryId,
        };
      }

      // Get requests with relations
      const [requests, total] = await Promise.all([
        prisma.documentRequest.findMany({
          where,
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
                owner: {
                  select: {
                    id: true,
                    name: true,
                    department: {
                      select: { id: true, name: true, code: true },
                    },
                  },
                },
              },
            },
            requestedBy: {
              select: {
                id: true,
                name: true,
                position: {
                  select: { id: true, name: true },
                },
                department: {
                  select: { id: true, name: true, code: true },
                },
              },
            },
          },
        }),
        prisma.documentRequest.count({ where }),
      ]);

      // Map requests to response format
      const mappedRequests = requests.map((req) => {
        const ownerDept = req.document?.owner?.department;
        const ownedBy = ownerDept
          ? `${ownerDept.code || ""} - ${ownerDept.name}`.replace(/^- /, "")
          : "-";

        return {
          id: req.id,
          requestCode: generateRequestCode(req.createdAt),
          documentCode: req.document?.documentNumber || "-",
          documentTitle: req.document?.title || "-",
          type: req.document?.category?.name || "-",
          requestBy: req.requestedBy?.name || "-",
          requestByPosition: req.requestedBy?.position?.name || req.requestedBy?.department?.name || "-",
          ownedBy,
          requestDate: formatDate(req.createdAt),
          status: mapRequestStatus(req.status),
          remarks: req.description || "-",
        };
      });

      // Calculate statistics
      const allRequests = await prisma.documentRequest.findMany({
        where: isAdmin ? {} : { requestedById: user?.userId },
        select: { status: true },
      });

      const stats = {
        total: allRequests.length,
        pending: allRequests.filter((r) => ["PENDING", "IN_PROGRESS"].includes(r.status)).length,
        approved: allRequests.filter((r) => r.status === "COMPLETED").length,
        rejected: allRequests.filter((r) => ["CANCELLED", "ON_HOLD"].includes(r.status)).length,
      };

      return NextResponse.json({
        data: mappedRequests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        statistics: stats,
      });
    } catch (error) {
      return handleError(error, request);
    }
  },
  { allowedRoles: ["ADMIN", "USER"] }
);
