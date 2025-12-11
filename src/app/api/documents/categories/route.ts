import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { handleError } from "@/infrastructure/errors";
import { documentCategorySchema } from "@/infrastructure/validation/document";
import { ZodError, ZodIssue } from "zod";
import { createRateLimitMiddleware } from "@/infrastructure/middleware";
import { withAuthHandler } from "@/infrastructure/middleware/auth";

const rateLimiter = createRateLimitMiddleware();

// GET /api/documents/categories - List all document categories
export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const documentRepository = container.cradle.documentRepository;
    const categories = await documentRepository.getCategories({
      isActive: isActive ? isActive === 'true' : undefined,
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    return handleError(error, request);
  }
}

// POST /api/documents/categories - Create a new document category
export const POST = withAuthHandler(async (request: NextRequest) => {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const validatedData = documentCategorySchema.parse(body);

    const documentRepository = container.cradle.documentRepository;
    const category = await documentRepository.createCategory(validatedData);

    return NextResponse.json(category, { status: 201 });
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
}, { allowedRoles: ['ADMIN'] });