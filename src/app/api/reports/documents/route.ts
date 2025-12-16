import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database";
import { handleError } from "@/infrastructure/errors";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const rateLimiter = createRateLimitMiddleware();

// Query params validation
const reportQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  departmentId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['active', 'obsolete', 'all']).optional().default('all'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title', 'documentNumber']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ReportQueryParams = z.infer<typeof reportQuerySchema>;

export interface ReportDocumentResponse {
  id: string;
  code: string;
  title: string;
  department: string;
  departmentId: string | null;
  type: string;
  typeId: string;
  status: 'active' | 'obsolete';
  date: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ReportStatistics {
  total: number;
  active: number;
  obsolete: number;
}

export interface ReportResponse {
  data: ReportDocumentResponse[];
  statistics: ReportStatistics;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// GET /api/reports/documents - Get report documents with statistics
export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);

    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      status: searchParams.get('status') || 'all',
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedParams = reportQuerySchema.parse(queryParams);
    const { page, limit, search, departmentId, categoryId, status, dateFrom, dateTo, sortBy, sortOrder } = validatedParams;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.DocumentWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Status filter
    if (status === 'active') {
      where.isObsolete = false;
      where.status = { in: ['ACTIVE', 'APPROVED', 'IN_REVIEW'] };
    } else if (status === 'obsolete') {
      where.OR = [
        { isObsolete: true },
        { status: 'OBSOLETE' },
      ];
    }

    // Department filter (via owner's department)
    if (departmentId) {
      where.owner = {
        departmentId: departmentId,
      };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt = { ...where.createdAt as object, gte: new Date(dateFrom) };
      }
      if (dateTo) {
        // Add one day to include the end date
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        where.createdAt = { ...where.createdAt as object, lt: endDate };
      }
    }

    // Fetch documents with pagination
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: { id: true, name: true, code: true },
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              department: {
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    // Build stats where clause (same filters but without pagination)
    const statsWhere: Prisma.DocumentWhereInput = { ...where };
    delete statsWhere.isObsolete;
    delete statsWhere.status;
    if (where.OR && Array.isArray(where.OR) && where.OR.some((clause) => typeof clause === 'object' && clause !== null && 'isObsolete' in clause)) {
      // Remove the obsolete-specific OR clause for stats
      delete statsWhere.OR;
      if (search) {
        statsWhere.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { documentNumber: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
    }

    // Fetch statistics (with same filters but counting all statuses)
    const [totalCount, activeCount, obsoleteCount] = await Promise.all([
      prisma.document.count({ where: statsWhere }),
      prisma.document.count({
        where: {
          ...statsWhere,
          isObsolete: false,
          status: { in: ['ACTIVE', 'APPROVED', 'IN_REVIEW'] },
        },
      }),
      prisma.document.count({
        where: {
          ...statsWhere,
          OR: [
            { isObsolete: true },
            { status: 'OBSOLETE' },
          ],
        },
      }),
    ]);

    // Map documents to response format
    const mappedDocuments: ReportDocumentResponse[] = documents.map((doc) => ({
      id: doc.id,
      code: doc.documentNumber,
      title: doc.title,
      department: doc.owner.department?.name || 'Unknown',
      departmentId: doc.owner.department?.id || null,
      type: doc.category.name,
      typeId: doc.category.id,
      status: doc.isObsolete || doc.status === 'OBSOLETE' ? 'obsolete' : 'active',
      date: formatDate(doc.createdAt),
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      owner: {
        id: doc.owner.id,
        name: doc.owner.name,
        email: doc.owner.email,
      },
    }));

    const response: ReportResponse = {
      data: mappedDocuments,
      statistics: {
        total: totalCount,
        active: activeCount,
        obsolete: obsoleteCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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
}

// Helper function to format date
function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-GB', options);
}
