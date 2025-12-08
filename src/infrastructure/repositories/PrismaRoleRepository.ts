import {
  Role,
  CreateRoleDTO,
  UpdateRoleDTO,
  RoleListResponse,
  RoleQueryParams,
} from '@/domain/entities/Role';
import { IRoleRepository } from '@/domain/repositories/IRoleRepository';
import { prisma } from '../database';
import { ConflictError, NotFoundError, ForbiddenError } from '../errors';
import { Prisma } from '@prisma/client';

export class PrismaRoleRepository implements IRoleRepository {
  private mapToRole(data: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    level: number;
    permissions: Prisma.JsonValue;
    isActive: boolean;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: { users: number };
  }): Role {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      level: data.level,
      permissions: data.permissions as string[] | null,
      isActive: data.isActive,
      isSystem: data.isSystem,
      totalUsers: data._count?.users || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async findAll(params: RoleQueryParams): Promise<RoleListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { users: true },
          },
        },
      }),
      prisma.role.count({ where }),
    ]);

    return {
      data: roles.map((role) => this.mapToRole(role)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) return null;

    return this.mapToRole(role);
  }

  async findByCode(code: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { code },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) return null;

    return this.mapToRole(role);
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { name },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) return null;

    return this.mapToRole(role);
  }

  async create(data: CreateRoleDTO): Promise<Role> {
    // Check if code already exists
    const existingCode = await this.findByCode(data.code);
    if (existingCode) {
      throw new ConflictError(`Role with code '${data.code}' already exists`);
    }

    // Check if name already exists
    const existingName = await this.findByName(data.name);
    if (existingName) {
      throw new ConflictError(`Role with name '${data.name}' already exists`);
    }

    const role = await prisma.role.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        level: data.level ?? 1,
        permissions: data.permissions || [],
        isActive: data.isActive ?? true,
        isSystem: false,
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return this.mapToRole(role);
  }

  async update(id: string, data: UpdateRoleDTO): Promise<Role | null> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError('Role not found');
    }

    // Prevent updating system roles' critical fields
    if (existing.isSystem && (data.code || data.name)) {
      throw new ForbiddenError('Cannot modify code or name of system roles');
    }

    // Check if code already exists (if updating code)
    if (data.code && data.code !== existing.code) {
      const existingCode = await this.findByCode(data.code);
      if (existingCode) {
        throw new ConflictError(`Role with code '${data.code}' already exists`);
      }
    }

    // Check if name already exists (if updating name)
    if (data.name && data.name !== existing.name) {
      const existingName = await this.findByName(data.name);
      if (existingName) {
        throw new ConflictError(`Role with name '${data.name}' already exists`);
      }
    }

    const role = await prisma.role.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        level: data.level,
        permissions: data.permissions === null ? Prisma.JsonNull : data.permissions,
        isActive: data.isActive,
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return this.mapToRole(role);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError('Role not found');
    }

    // Prevent deleting system roles
    if (existing.isSystem) {
      throw new ForbiddenError('Cannot delete system roles');
    }

    // Check if role has users
    if (existing.totalUsers && existing.totalUsers > 0) {
      throw new ConflictError('Cannot delete role with assigned users');
    }

    await prisma.role.delete({
      where: { id },
    });

    return true;
  }

  async count(): Promise<number> {
    return prisma.role.count();
  }
}
