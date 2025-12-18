import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { handleError } from "@/infrastructure/errors";
import { z } from "zod";
import { ZodError, ZodIssue } from "zod";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler, type AuthenticatedRequest } from "@/infrastructure/middleware/auth";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const rateLimiter = createRateLimitMiddleware();

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Schema for finalize request
const finalizeDocumentSchema = z.object({
  category: z.enum(["MANAGEMENT", "DISTRIBUTED"]),
  companyStamp: z.string().min(1, "Company stamp is required"),
  finalPdfBase64: z.string().optional(), // Base64 encoded final PDF with signatures
});

// POST /api/documents/[id]/finalize - Finalize document with category and stamp
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
    const validatedData = finalizeDocumentSchema.parse(body);

    // Validate base64 image
    if (!validatedData.companyStamp.startsWith('data:image/')) {
      return NextResponse.json(
        { error: "Invalid company stamp format. Must be a base64 encoded image." },
        { status: 400 }
      );
    }

    // Check stamp size (max 2MB)
    const stampSize = Buffer.from(validatedData.companyStamp.split(',')[1] || '', 'base64').length;
    if (stampSize > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Company stamp image is too large. Maximum size is 2MB." },
        { status: 400 }
      );
    }

    // Get the document with all related data for PDF generation
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            position: {
              select: { id: true, name: true }
            }
          },
        },
        destinationDepartment: {
          select: { id: true, name: true, code: true }
        },
        approvals: {
          where: { isDeleted: false },
          orderBy: [
            { level: 'asc' },
            { createdAt: 'asc' }
          ],
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
                position: {
                  select: { id: true, name: true }
                }
              },
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

    // Check if document is in WAITING_VALIDATION status
    if (document.status !== "WAITING_VALIDATION") {
      return NextResponse.json(
        { error: `Document must be in WAITING_VALIDATION status to finalize. Current status: ${document.status}` },
        { status: 400 }
      );
    }

    // Handle final PDF upload if provided
    let finalPdfUrl = document.fileUrl;

    if (validatedData.finalPdfBase64) {
      try {
        // Validate PDF base64
        if (!validatedData.finalPdfBase64.startsWith('data:application/pdf;base64,')) {
          return NextResponse.json(
            { error: "Invalid PDF format. Must be a base64 encoded PDF." },
            { status: 400 }
          );
        }

        // Extract base64 data
        const base64Data = validatedData.finalPdfBase64.replace('data:application/pdf;base64,', '');
        const pdfBuffer = Buffer.from(base64Data, 'base64');

        // Check file size (max 10MB)
        if (pdfBuffer.length > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: "PDF file is too large. Maximum size is 10MB." },
            { status: 400 }
          );
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const safeDocNumber = document.documentNumber.replace(/[^a-zA-Z0-9-]/g, '_');
        const fileName = `${safeDocNumber}_final_${timestamp}.pdf`;
        const filePath = path.join(uploadsDir, fileName);

        // Write file to disk
        await writeFile(filePath, pdfBuffer);

        // Set the public URL
        finalPdfUrl = `/uploads/documents/${fileName}`;

        console.log(`Final PDF saved: ${filePath}`);
      } catch (fileError) {
        console.error("Failed to save final PDF:", fileError);
        return NextResponse.json(
          { error: "Failed to save final PDF file." },
          { status: 500 }
        );
      }
    }

    // Update document with validation data
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "APPROVED",
        approvalStatus: "APPROVED",
        validatedCategory: validatedData.category,
        companyStamp: validatedData.companyStamp,
        finalPdfUrl: finalPdfUrl,
        validatedAt: new Date(),
        validatedById: userId,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "DOCUMENT_APPROVED",
        entity: "Document",
        entityId: documentId,
        description: `Document finalized as ${validatedData.category}: ${document.title}`,
        metadata: {
          documentId: document.id,
          documentNumber: document.documentNumber,
          action: "FINALIZE_DOCUMENT",
          category: validatedData.category,
          finalPdfUrl: finalPdfUrl,
        },
      },
    });

    // Notify document creator
    await prisma.notification.create({
      data: {
        userId: document.createdById,
        type: "DOCUMENT_APPROVED",
        title: "Document Finalized",
        message: `Your document "${document.title}" has been finalized and categorized as ${validatedData.category === 'MANAGEMENT' ? 'Document Management' : 'Distributed Document'}.`,
        link: `/document-control/submission?id=${documentId}`,
        priority: "MEDIUM",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Document finalized successfully",
      documentId: updatedDocument.id,
      documentNumber: updatedDocument.documentNumber,
      status: updatedDocument.status,
      validatedCategory: updatedDocument.validatedCategory,
      finalPdfUrl: updatedDocument.finalPdfUrl,
    });
  } catch (error) {
    console.error("Finalize document error:", error);

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

    // Return more specific error for debugging
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      );
    }

    return handleError(error, request);
  }
}, { allowedRoles: ["ADMIN", "SUPERADMIN"] }); // Admin and Super Admin can finalize
