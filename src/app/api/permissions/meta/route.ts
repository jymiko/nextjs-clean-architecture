import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { PERMISSION_CATEGORIES, PERMISSION_ACTIONS } from '@/domain/entities/Permission';

const rateLimiter = createRateLimitMiddleware();

export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const permissionRepository = container.cradle.permissionRepository;

    const [categories, resources] = await Promise.all([
      permissionRepository.getAllCategories(),
      permissionRepository.getAllResources(),
    ]);

    return NextResponse.json({
      categories,
      resources,
      defaultCategories: PERMISSION_CATEGORIES,
      defaultActions: PERMISSION_ACTIONS,
    });
  } catch (error) {
    return handleError(error, request);
  }
}
