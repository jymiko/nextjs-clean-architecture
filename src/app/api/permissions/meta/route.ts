import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';
import { PERMISSION_CATEGORIES, PERMISSION_ACTIONS } from '@/domain/entities/Permission';

const rateLimiter = createRateLimitMiddleware();

/**
 * @swagger
 * /api/permissions/meta:
 *   get:
 *     summary: Get permission metadata
 *     description: Retrieve available categories, resources, and actions for permissions
 *     tags: [Permissions]
 *     responses:
 *       200:
 *         description: Permission metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: All available categories from database
 *                 resources:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: All available resources from database
 *                 defaultCategories:
 *                   type: object
 *                   description: Default category constants
 *                 defaultActions:
 *                   type: object
 *                   description: Default action constants
 */
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
