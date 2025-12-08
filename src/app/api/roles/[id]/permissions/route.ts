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
