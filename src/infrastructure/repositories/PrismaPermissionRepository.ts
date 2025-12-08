import {
  Permission,
  CreatePermissionDTO,
  UpdatePermissionDTO,
  PermissionListResponse,
  PermissionQueryParams,
  RoleWithPermissions,
  generatePermissionName,
} from '@/domain/entities/Permission';
import { IPermissionRepository } from '@/domain/repositories/IPermissionRepository';
import { prisma } from '../database';
import { ConflictError, NotFoundError } from '../errors';

export class PrismaPermissionRepository implements IPermissionRepository {
  private mapToPermission(data: {
    id: string;
    name: string;
    resource: string;
    action: string;
    description: string | null;
    category: string;
    isActive: boolean;
    createdAt: Date;
  }): Permission {
    return {
      id: data.id,
      name: data.name,
      resource: data.resource,
      action: data.action,
      description: data.description,
      category: data.category,
      isActive: data.isActive,
      createdAt: data.createdAt,
    };
  }

  private mapToRoleWithPermissions(role: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    level: number;
    isActive: boolean;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: { users: number };
    rolePermissions: Array<{
      permission: {
        id: string;
        name: string;
        resource: string;
        action: string;
        description: string | null;
        category: string;
        isActive: boolean;
        createdAt: Date;
      };
    }>;
  }): RoleWithPermissions {
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      level: role.level,
      isActive: role.isActive,
      isSystem: role.isSystem,
      permissions: role.rolePermissions.map((rp) => this.mapToPermission(rp.permission)),
      totalUsers: role._count?.users || 0,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  async findAll(params: PermissionQueryParams): Promise<PermissionListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      resource,
      category,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { resource: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (resource) {
      where.resource = resource;
    }

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.permission.count({ where }),
    ]);

    return {
      data: permissions.map((p) => this.mapToPermission(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Permission | null> {
    const permission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) return null;

    return this.mapToPermission(permission);
  }

  async findByName(name: string): Promise<Permission | null> {
    const permission = await prisma.permission.findUnique({
      where: { name },
    });

    if (!permission) return null;

    return this.mapToPermission(permission);
  }

  async findByResourceAction(resource: string, action: string): Promise<Permission | null> {
    const permission = await prisma.permission.findUnique({
      where: {
        resource_action: { resource, action },
      },
    });

    if (!permission) return null;

    return this.mapToPermission(permission);
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    const permissions = await prisma.permission.findMany({
      where: { id: { in: ids } },
    });

    return permissions.map((p) => this.mapToPermission(p));
  }

  async create(data: CreatePermissionDTO): Promise<Permission> {
    const name = data.name || generatePermissionName(data.resource, data.action);

    // Check if name already exists
    const existingName = await this.findByName(name);
    if (existingName) {
      throw new ConflictError(`Permission with name '${name}' already exists`);
    }

    // Check if resource+action combination already exists
    const existingResourceAction = await this.findByResourceAction(data.resource, data.action);
    if (existingResourceAction) {
      throw new ConflictError(
        `Permission for resource '${data.resource}' with action '${data.action}' already exists`
      );
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        resource: data.resource,
        action: data.action,
        description: data.description,
        category: data.category || 'general',
        isActive: data.isActive ?? true,
      },
    });

    return this.mapToPermission(permission);
  }

  async update(id: string, data: UpdatePermissionDTO): Promise<Permission | null> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError('Permission not found');
    }

    // Check for unique constraints if updating name
    if (data.name && data.name !== existing.name) {
      const existingName = await this.findByName(data.name);
      if (existingName) {
        throw new ConflictError(`Permission with name '${data.name}' already exists`);
      }
    }

    // Check for unique constraints if updating resource+action
    const newResource = data.resource || existing.resource;
    const newAction = data.action || existing.action;
    if (data.resource || data.action) {
      const existingResourceAction = await this.findByResourceAction(newResource, newAction);
      if (existingResourceAction && existingResourceAction.id !== id) {
        throw new ConflictError(
          `Permission for resource '${newResource}' with action '${newAction}' already exists`
        );
      }
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        name: data.name,
        resource: data.resource,
        action: data.action,
        description: data.description,
        category: data.category,
        isActive: data.isActive,
      },
    });

    return this.mapToPermission(permission);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError('Permission not found');
    }

    // Delete associated role permissions first
    await prisma.rolePermission.deleteMany({
      where: { permissionId: id },
    });

    await prisma.permission.delete({
      where: { id },
    });

    return true;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });

    return rolePermissions.map((rp) => this.mapToPermission(rp.permission));
  }

  async getRoleWithPermissions(roleId: string): Promise<RoleWithPermissions | null> {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: { users: true },
        },
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) return null;

    return this.mapToRoleWithPermissions(role);
  }

  async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<RoleWithPermissions> {
    // Verify role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Verify all permissions exist
    const existingPermissions = await this.findByIds(permissionIds);
    if (existingPermissions.length !== permissionIds.length) {
      const foundIds = existingPermissions.map((p) => p.id);
      const missingIds = permissionIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundError(`Permissions not found: ${missingIds.join(', ')}`);
    }

    // Get existing role permissions
    const existingRolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      select: { permissionId: true },
    });
    const existingPermissionIds = existingRolePermissions.map((rp) => rp.permissionId);

    // Filter out already assigned permissions
    const newPermissionIds = permissionIds.filter((id) => !existingPermissionIds.includes(id));

    // Create new role permissions
    if (newPermissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: newPermissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });
    }

    // Return updated role with permissions
    const result = await this.getRoleWithPermissions(roleId);
    if (!result) {
      throw new NotFoundError('Role not found');
    }

    return result;
  }

  async removePermissionsFromRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<RoleWithPermissions> {
    // Verify role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Delete role permissions
    await prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissionIds },
      },
    });

    // Return updated role with permissions
    const result = await this.getRoleWithPermissions(roleId);
    if (!result) {
      throw new NotFoundError('Role not found');
    }

    return result;
  }

  async syncRolePermissions(
    roleId: string,
    permissionIds: string[]
  ): Promise<RoleWithPermissions> {
    // Verify role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Verify all permissions exist (if any provided)
    if (permissionIds.length > 0) {
      const existingPermissions = await this.findByIds(permissionIds);
      if (existingPermissions.length !== permissionIds.length) {
        const foundIds = existingPermissions.map((p) => p.id);
        const missingIds = permissionIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundError(`Permissions not found: ${missingIds.join(', ')}`);
      }
    }

    // Delete all existing role permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Create new role permissions
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });
    }

    // Return updated role with permissions
    const result = await this.getRoleWithPermissions(roleId);
    if (!result) {
      throw new NotFoundError('Role not found');
    }

    return result;
  }

  async getPermissionsByResource(resource: string): Promise<Permission[]> {
    const permissions = await prisma.permission.findMany({
      where: { resource, isActive: true },
      orderBy: { action: 'asc' },
    });

    return permissions.map((p) => this.mapToPermission(p));
  }

  async getPermissionsByCategory(category: string): Promise<Permission[]> {
    const permissions = await prisma.permission.findMany({
      where: { category, isActive: true },
      orderBy: { name: 'asc' },
    });

    return permissions.map((p) => this.mapToPermission(p));
  }

  async getAllCategories(): Promise<string[]> {
    const categories = await prisma.permission.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return categories.map((c) => c.category);
  }

  async getAllResources(): Promise<string[]> {
    const resources = await prisma.permission.findMany({
      select: { resource: true },
      distinct: ['resource'],
      orderBy: { resource: 'asc' },
    });

    return resources.map((r) => r.resource);
  }

  async count(): Promise<number> {
    return prisma.permission.count();
  }
}
