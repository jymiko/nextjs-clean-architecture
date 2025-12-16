import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { handleError } from "@/infrastructure/errors";
import { updateDocumentSchema } from "@/infrastructure/validation/document";
import { ZodError, ZodIssue } from "zod";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler } from "@/infrastructure/middleware/auth";
import { DocumentStatus } from "@/domain/entities/Document";

const rateLimiter = createRateLimitMiddleware();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/documents/[id] - Get a specific document by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const documentRepository = container.cradle.documentRepository;
    const document = await documentRepository.findById(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Extract approval data by level
    const approvals = (document as any).approvals || [];
    const reviewerApproval = approvals.find((a: any) => a.level === 1);
    const approverApproval = approvals.find((a: any) => a.level === 2);
    const acknowledgerApprovals = approvals.filter((a: any) => a.level === 3);

    // Build destination department display - collect from main destination and acknowledgers' departments
    const destDept = (document as any).destinationDepartment;
    const destinationDepartments: string[] = [];

    // Add main destination department
    if (destDept) {
      destinationDepartments.push(`${destDept.code} - ${destDept.name}`);
    }

    // Collect unique departments from acknowledgers
    acknowledgerApprovals.forEach((a: any) => {
      const dept = a.approver?.department;
      if (dept) {
        const deptDisplay = `${dept.code || ''} - ${dept.name}`.replace(/^- /, '');
        if (!destinationDepartments.includes(deptDisplay) && deptDisplay !== ' - ') {
          destinationDepartments.push(deptDisplay);
        }
      }
    });

    // Join departments with comma for frontend parsing
    const destinationDepartmentDisplay = destinationDepartments.length > 0
      ? destinationDepartments.join(', ')
      : undefined;

    // Build acknowledgers array
    const acknowledgers = acknowledgerApprovals.map((a: any) => ({
      name: a.approver?.name || '',
      position: a.approver?.department?.name || a.approver?.position?.name || '',
    }));

    // Get createdBy position
    const createdBy = document.createdBy as any;
    const createdByPosition = createdBy?.department?.name || createdBy?.position?.name;

    // Build preparedBy object for signature panel
    const preparedBy = {
      id: createdBy?.id,
      name: createdBy?.name || '',
      position: createdByPosition || '',
      signature: (document as any).preparedBySignature || null,
      signedAt: (document as any).preparedBySignedAt || null,
    };

    // Build approvals array for signature panel (reviewers, approvers, and acknowledgers)
    const signatureApprovals = approvals
      .filter((a: any) => a.level === 1 || a.level === 2 || a.level === 3)
      .map((a: any) => ({
        id: a.id,
        level: a.level,
        approver: {
          id: a.approver?.id,
          name: a.approver?.name || '',
          position: a.approver?.department?.name || a.approver?.position?.name || '',
        },
        signatureImage: a.signatureImage || null,
        signedAt: a.signedAt || null,
        status: a.status,
      }));

    // Map fields for frontend compatibility
    const response = {
      ...document,
      pdfUrl: document.fileUrl, // Map fileUrl to pdfUrl for PDF viewer
      categoryName: document.category?.name,
      departmentName: destDept?.name,
      destinationDepartmentName: destinationDepartmentDisplay,
      createdByName: createdBy?.name,
      createdByPosition: createdByPosition,
      // Prepared By data for signature panel
      preparedBy,
      // Approvals data for signature panel (reviewers + approvers)
      signatureApprovals,
      // Reviewer data (level 1)
      reviewerName: reviewerApproval?.approver?.name || document.reviewerName,
      reviewerPosition: reviewerApproval?.approver?.department?.name ||
        reviewerApproval?.approver?.position?.name ||
        document.reviewerPosition,
      // Approver data (level 2)
      approverName: approverApproval?.approver?.name || document.approverName,
      approverPosition: approverApproval?.approver?.department?.name ||
        approverApproval?.approver?.position?.name ||
        document.approverPosition,
      // Acknowledgers (level 3)
      acknowledgers: acknowledgers.length > 0 ? acknowledgers : (document.acknowledgerName ? [{
        name: document.acknowledgerName,
        position: document.acknowledgerPosition || '',
      }] : []),
      // Approved date from first approved approval
      approvedDate: approvals.find((a: any) => a.status === 'APPROVED')?.approvedAt,
      lastUpdate: document.updatedAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleError(error, request);
  }
}

// PUT /api/documents/[id] - Update a specific document
export const PUT = withAuthHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateDocumentSchema.parse(body);

    const documentRepository = container.cradle.documentRepository;
    const document = await documentRepository.update(id, {
      ...validatedData,
      status: validatedData.status as DocumentStatus | undefined,
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          details: error.issues.map((err: ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN', 'USER'] });

// DELETE /api/documents/[id] - Delete a specific document
// Users can delete their own documents, Admins can delete any document
export const DELETE = withAuthHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const documentRepository = container.cradle.documentRepository;

    // First, get the document to check ownership
    const existingDocument = await documentRepository.findById(id);

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get the current user from the request
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);

    // Import and use verifyToken to get user info
    const { verifyToken } = await import('@/infrastructure/auth');
    const payload = token ? await verifyToken(token) : null;

    // Check if user is authorized to delete this document
    // Admin/SuperAdmin can delete any document, users can only delete their own
    if (payload && payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
      if (existingDocument.createdById !== payload.userId && existingDocument.ownerId !== payload.userId) {
        return NextResponse.json(
          { error: 'You can only delete your own documents' },
          { status: 403 }
        );
      }
    }

    const document = await documentRepository.delete(id);

    if (!document) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, request);
  }
}, { allowedRoles: ['ADMIN', 'USER'] });