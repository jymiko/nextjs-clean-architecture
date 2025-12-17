import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database";
import { handleError } from "@/infrastructure/errors";
import { createRateLimitMiddleware, withAuthHandler } from "@/infrastructure/middleware";
import { z } from "zod";
import type {
  DashboardStatsResponse,
  DashboardStats,
  DashboardCharts,
  DashboardActivity,
  DashboardAlert,
  MonthlyDocumentData,
} from "@/domain/entities/Dashboard";

const rateLimiter = createRateLimitMiddleware();

// Query params validation
const querySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  categoryId: z.string().optional(),
  datePreset: z.enum(['30d', '3m', '6m', 'year']).optional(),
});

// GET /api/dashboard/stats - Get aggregated dashboard statistics
export const GET = withAuthHandler(
  async (request: NextRequest) => {
    try {
      const rateLimitResponse = await rateLimiter(request);
      if (rateLimitResponse) return rateLimitResponse;

      const { searchParams } = new URL(request.url);

      const queryParams = {
        dateFrom: searchParams.get('dateFrom') || undefined,
        dateTo: searchParams.get('dateTo') || undefined,
        categoryId: searchParams.get('categoryId') || undefined,
        datePreset: searchParams.get('datePreset') || undefined,
      };

      const validatedParams = querySchema.parse(queryParams);
      const { categoryId, datePreset } = validatedParams;

      // Calculate date range based on preset or params
      const now = new Date();
      let dateFrom: Date | undefined;
      let dateTo: Date = now;

      if (datePreset) {
        switch (datePreset) {
          case '30d':
            dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '3m':
            dateFrom = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            break;
          case '6m':
            dateFrom = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            break;
          case 'year':
            dateFrom = new Date(now.getFullYear(), 0, 1);
            break;
        }
      } else if (validatedParams.dateFrom) {
        dateFrom = new Date(validatedParams.dateFrom);
        if (validatedParams.dateTo) {
          dateTo = new Date(validatedParams.dateTo);
        }
      }

      // Time calculations
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      // Build where clause for category filter
      const categoryWhere = categoryId ? { categoryId } : {};
      const dateWhere = dateFrom ? { createdAt: { gte: dateFrom, lte: dateTo } } : {};

      // Parallel queries for all dashboard data
      const [
        totalDocuments,
        lastMonthDocuments,
        thisMonthDocuments,
        pendingApprovals,
        expiringSoon,
        newSubmissions,
        documentsByStatus,
        documentsByCategory,
        recentApprovalActivities,
        expiringDocuments,
        pendingDistribution,
        obsoleteDocuments,
        categories,
      ] = await Promise.all([
        // Total documents
        prisma.document.count({ where: { ...categoryWhere, ...dateWhere } }),

        // Last month documents (for change calculation)
        prisma.document.count({
          where: {
            ...categoryWhere,
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
        }),

        // This month documents (for change calculation)
        prisma.document.count({
          where: {
            ...categoryWhere,
            createdAt: { gte: startOfMonth },
          },
        }),

        // Pending approvals
        prisma.documentApproval.count({
          where: {
            status: 'PENDING',
            isDeleted: false,
            ...(categoryId ? { document: { categoryId } } : {}),
          },
        }),

        // Expiring soon (within 7 days)
        prisma.document.count({
          where: {
            ...categoryWhere,
            expiryDate: { gte: now, lte: sevenDaysFromNow },
            isObsolete: false,
          },
        }),

        // New submissions this month
        prisma.document.count({
          where: {
            ...categoryWhere,
            createdAt: { gte: startOfMonth },
          },
        }),

        // Documents by status
        prisma.document.groupBy({
          by: ['status'],
          where: { ...categoryWhere, ...dateWhere },
          _count: { id: true },
        }),

        // Documents by category
        prisma.document.groupBy({
          by: ['categoryId'],
          where: dateWhere,
          _count: { id: true },
        }),

        // Recent approval activities (last 10)
        prisma.documentApproval.findMany({
          where: {
            isDeleted: false,
            status: { in: ['APPROVED', 'REJECTED', 'NEEDS_REVISION'] },
            ...(categoryId ? { document: { categoryId } } : {}),
          },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          include: {
            document: { select: { documentNumber: true, title: true } },
            approver: {
              select: {
                name: true,
                position: { select: { name: true } },
              },
            },
          },
        }),

        // Expiring documents for alerts (within 3 months)
        prisma.document.findMany({
          where: {
            ...categoryWhere,
            expiryDate: { gte: now, lte: threeMonthsFromNow },
            isObsolete: false,
          },
          select: { id: true },
        }),

        // Pending distribution (more than 48 hours)
        prisma.documentDistribution.findMany({
          where: {
            status: 'SENT',
            isDeleted: false,
            isAcknowledged: false,
            distributedAt: { lte: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
            ...(categoryId ? { document: { categoryId } } : {}),
          },
          select: { documentId: true },
          distinct: ['documentId'],
        }),

        // Obsolete documents
        prisma.document.findMany({
          where: {
            ...categoryWhere,
            isObsolete: true,
          },
          select: { id: true },
        }),

        // All categories for mapping
        prisma.documentCategory.findMany({
          select: { id: true, name: true },
        }),
      ]);

      // Calculate percentage change
      const totalDocumentsChange = lastMonthDocuments > 0
        ? Math.round(((thisMonthDocuments - lastMonthDocuments) / lastMonthDocuments) * 100)
        : thisMonthDocuments > 0 ? 100 : 0;

      // Get monthly data for last 6 months
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const monthlyDocuments = await prisma.document.findMany({
        where: {
          ...categoryWhere,
          createdAt: { gte: sixMonthsAgo },
        },
        select: { createdAt: true },
      });

      // Process monthly data
      const documentsByMonth: MonthlyDocumentData[] = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - 4 + i, 1);
        const count = monthlyDocuments.filter((d) => {
          const docDate = new Date(d.createdAt);
          return docDate >= date && docDate < nextMonth;
        }).length;
        return {
          month: date.toLocaleDateString('en', { month: 'short' }),
          year: date.getFullYear(),
          count,
        };
      });

      // Process status distribution
      const statusMap: Record<string, number> = {
        ACTIVE: 0,
        APPROVED: 0,
        OBSOLETE: 0,
        ARCHIVED: 0,
        DRAFT: 0,
        IN_REVIEW: 0,
        REVISION_REQUIRED: 0,
      };
      documentsByStatus.forEach((s) => {
        statusMap[s.status] = s._count.id;
      });

      // Build stats
      const stats: DashboardStats = {
        totalDocuments,
        totalDocumentsChange,
        pendingApprovals,
        expiringSoon,
        newSubmissions,
      };

      // Build charts data
      const charts: DashboardCharts = {
        documentsByMonth,
        documentsByStatus: {
          active: statusMap.ACTIVE + statusMap.APPROVED,
          obsolete: statusMap.OBSOLETE + statusMap.ARCHIVED,
          draft: statusMap.DRAFT,
          inReview: statusMap.IN_REVIEW + statusMap.REVISION_REQUIRED,
        },
        documentsByCategory: documentsByCategory.map((c) => {
          const category = categories.find((cat) => cat.id === c.categoryId);
          const total = documentsByCategory.reduce((sum, cat) => sum + cat._count.id, 0);
          return {
            categoryId: c.categoryId,
            categoryName: category?.name || 'Unknown',
            count: c._count.id,
            percentage: total > 0 ? Math.round((c._count.id / total) * 100) : 0,
          };
        }),
      };

      // Map activities
      const recentActivities: DashboardActivity[] = recentApprovalActivities.map((a) => {
        let actionType: DashboardActivity['type'] = 'approved';
        if (a.status === 'REJECTED' || a.status === 'NEEDS_REVISION') {
          actionType = 'revision';
        }

        return {
          id: a.id,
          documentNumber: a.document.documentNumber,
          documentTitle: a.document.title,
          action: a.status as DashboardActivity['action'],
          actionBy: a.approver.name,
          actionByRole: a.approver.position?.name || 'Unknown',
          timestamp: a.updatedAt.toISOString(),
          type: actionType,
        };
      });

      // Build alerts
      const alerts: DashboardAlert[] = [];

      if (expiringDocuments.length > 0) {
        alerts.push({
          id: 'alert-expiring',
          type: 'expiring',
          severity: 'error',
          title: `${expiringDocuments.length} Documents Expiring Soon`,
          description: 'These documents will expire within the next 3 months',
          count: expiringDocuments.length,
          documentIds: expiringDocuments.map((d) => d.id),
        });
      }

      if (pendingDistribution.length > 0) {
        alerts.push({
          id: 'alert-distribution',
          type: 'pending_distribution',
          severity: 'warning',
          title: `${pendingDistribution.length} Documents Waiting for Distribution`,
          description: 'These documents are pending distribution for more than 48 hours',
          count: pendingDistribution.length,
          documentIds: pendingDistribution.map((d) => d.documentId),
        });
      }

      if (obsoleteDocuments.length > 0) {
        alerts.push({
          id: 'alert-obsolete',
          type: 'obsolete',
          severity: 'error',
          title: `${obsoleteDocuments.length} Documents Marked Obsolete`,
          description: 'These documents are marked as obsolete',
          count: obsoleteDocuments.length,
          documentIds: obsoleteDocuments.map((d) => d.id),
        });
      }

      const response: DashboardStatsResponse = {
        stats,
        charts,
        recentActivities,
        alerts,
      };

      return NextResponse.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            details: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }

      return handleError(error, request);
    }
  },
  { requireAuth: true }
);
