import {
  Position,
  CreatePositionDTO,
  UpdatePositionDTO,
  PositionListResponse,
  PositionQueryParams,
} from '@/domain/entities/Position';
import { IPositionRepository } from '@/domain/repositories/IPositionRepository';
import { prisma } from '../database';
import { ConflictError, NotFoundError } from '../errors';

export class PrismaPositionRepository implements IPositionRepository {
  private mapToPosition(data: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    departmentId: string | null;
    department?: { id: string; code: string; name: string } | null;
    level: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: { users: number };
  }): Position {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      departmentId: data.departmentId,
      department: data.department || null,
      level: data.level,
      isActive: data.isActive,
      totalEmployees: data._count?.users || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async findAll(params: PositionQueryParams): Promise<PositionListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      departmentId,
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

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [positions, total] = await Promise.all([
      prisma.position.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          department: {
            select: { id: true, code: true, name: true },
          },
          _count: {
            select: { users: true },
          },
        },
      }),
      prisma.position.count({ where }),
    ]);

    return {
      data: positions.map((pos) => this.mapToPosition(pos)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Position | null> {
    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        department: {
          select: { id: true, code: true, name: true },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    if (!position) return null;

    return this.mapToPosition(position);
  }

  async findByCode(code: string): Promise<Position | null> {
    const position = await prisma.position.findUnique({
      where: { code },
      include: {
        department: {
          select: { id: true, code: true, name: true },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    if (!position) return null;

    return this.mapToPosition(position);
  }

  async findByDepartmentId(departmentId: string): Promise<Position[]> {
    const positions = await prisma.position.findMany({
      where: { departmentId },
      include: {
        department: {
          select: { id: true, code: true, name: true },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { level: 'asc' },
    });

    return positions.map((pos) => this.mapToPosition(pos));
  }

  async create(data: CreatePositionDTO): Promise<Position> {
    // Check if code already exists
    const existingCode = await this.findByCode(data.code);
    if (existingCode) {
      throw new ConflictError(`Position with code '${data.code}' already exists`);
    }

    // Validate departmentId if provided
    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId },
      });
      if (!department) {
        throw new NotFoundError('Department not found');
      }
    }

    const position = await prisma.position.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        departmentId: data.departmentId,
        level: data.level ?? 1,
        isActive: data.isActive ?? true,
      },
      include: {
        department: {
          select: { id: true, code: true, name: true },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    return this.mapToPosition(position);
  }

  async update(id: string, data: UpdatePositionDTO): Promise<Position | null> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError('Position not found');
    }

    // Check if code already exists (if updating code)
    if (data.code && data.code !== existing.code) {
      const existingCode = await this.findByCode(data.code);
      if (existingCode) {
        throw new ConflictError(`Position with code '${data.code}' already exists`);
      }
    }

    // Validate departmentId if provided
    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId },
      });
      if (!department) {
        throw new NotFoundError('Department not found');
      }
    }

    const position = await prisma.position.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        departmentId: data.departmentId,
        level: data.level,
        isActive: data.isActive,
      },
      include: {
        department: {
          select: { id: true, code: true, name: true },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    return this.mapToPosition(position);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError('Position not found');
    }

    // Check if position has employees
    if (existing.totalEmployees && existing.totalEmployees > 0) {
      throw new ConflictError('Cannot delete position with assigned employees');
    }

    await prisma.position.delete({
      where: { id },
    });

    return true;
  }

  async count(): Promise<number> {
    return prisma.position.count();
  }
}
