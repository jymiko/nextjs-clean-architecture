import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError } from '@/infrastructure/errors';
import { assignPermissionsSchema, removePermissionsSchema, syncPermissionsSchema } from '@/infrastructure/validation';
import { ZodError, ZodIssue } from 'zod';
import { createRateLimitMiddleware } from '@/infrastructure/middleware';

const rateLimiter = createRateLimitMiddleware();

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   get:
 *     summary: Get all permissions for a role
 *     description: Retrieve all permissions assigned to a specific role
 *     tags: [Role Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role with permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 code:
 *                   type: string
 *                 name:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       resource:
 *                         type: string
 *                       action:
 *                         type: string
 *       404:
 *         description: Role not found
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    const permissionRepository = container.cradle.permissionRepository;
    const roleWithPermissions = await permissionRepository.getRoleWithPermissions(id);

    if (!roleWithPermissions) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json(roleWithPermissions);
  } catch (error) {
    return handleError(error, request);
  }
}

/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   post:
 *     summary: Assign permissions to a role
 *     description: Add new permissions to a role (keeps existing permissions)
 *     tags: [Role Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of permission IDs to assign
 *     responses:
 *       200:
 *         description: Permissions assigned successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Role or permission not found
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();
    const validatedData = assignPermissionsSchema.parse(body);

    const permissionRepository = container.cradle.permissionRepository;
    const roleWithPermissions = await permissionRepository.assignPermissionsToRole(
      id,
      validatedData.permissionIds
    );

    return NextResponse.json({
      success: true,
      message: 'Permissions assigned successfully',
      data: roleWithPermissions,
    });
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
}

/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   put:
 *     summary: Sync permissions for a role
 *     description: Replace all permissions for a role (removes existing and adds new)
 *     tags: [Role Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of permission IDs to sync (replaces all existing)
 *     responses:
 *       200:
 *         description: Permissions synced successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Role or permission not found
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();
    const validatedData = syncPermissionsSchema.parse(body);

    const permissionRepository = container.cradle.permissionRepository;
    const roleWithPermissions = await permissionRepository.syncRolePermissions(
      id,
      validatedData.permissionIds
    );

    return NextResponse.json({
      success: true,
      message: 'Permissions synced successfully',
      data: roleWithPermissions,
    });
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
}

/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   delete:
 *     summary: Remove permissions from a role
 *     description: Remove specific permissions from a role
 *     tags: [Role Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of permission IDs to remove
 *     responses:
 *       200:
 *         description: Permissions removed successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Role not found
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body = await request.json();
    const validatedData = removePermissionsSchema.parse(body);

    const permissionRepository = container.cradle.permissionRepository;
    const roleWithPermissions = await permissionRepository.removePermissionsFromRole(
      id,
      validatedData.permissionIds
    );

    return NextResponse.json({
      success: true,
      message: 'Permissions removed successfully',
      data: roleWithPermissions,
    });
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
}
