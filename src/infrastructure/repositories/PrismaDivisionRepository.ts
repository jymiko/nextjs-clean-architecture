import {
  Division,
  CreateDivisionDTO,
  UpdateDivisionDTO,
  DivisionListResponse,
  DivisionQueryParams,
} from '@/domain/entities/Division';
import { IDivisionRepository } from '@/domain/repositories/IDivisionRepository';
import { prisma } from '../database';
import { ConflictError, NotFoundError } from '../errors';

export class PrismaDivisionRepository implements IDivisionRepository {
  private mapToDivision(data: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    headOfDivisionId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: { departments: number };
    headOfDivision?: { id: string; name: string; email: string } | null;
    departments?: Array<{ id: string; name: string }>;
  }): Division {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      headOfDivisionId: data.headOfDivisionId,
      headOfDivision: data.headOfDivision || null,
      departments: data.departments || [],
      isActive: data.isActive,
      totalDepartments: data._count?.departments || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async findAll(params: DivisionQueryParams): Promise<DivisionListResponse> {
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

    const [divisions, total] = await Promise.all([
      prisma.division.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { departments: true },
          },
          departments: {
            select: { id: true, name: true },
            where: { isActive: true },
          },
        },
      }),
      prisma.division.count({ where }),
    ]);

    // Fetch head of division info separately
    const divisionsWithHead = await Promise.all(
      divisions.map(async (div) => {
        let headOfDivision = null;
        if (div.headOfDivisionId) {
          const head = await prisma.user.findUnique({
            where: { id: div.headOfDivisionId },
            select: { id: true, name: true, email: true },
          });
          headOfDivision = head;
        }
        return this.mapToDivision({ ...div, headOfDivision });
      })
    );

    return {
      data: divisionsWithHead,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Division | null> {
    const division = await prisma.division.findUnique({
      where: { id },
      include: {
        _count: {
          select: { departments: true },
        },
        departments: {
          select: { id: true, name: true },
          where: { isActive: true },
        },
      },
    });

    if (!division) return null;

    let headOfDivision = null;
    if (division.headOfDivisionId) {
      const head = await prisma.user.findUnique({
        where: { id: division.headOfDivisionId },
        select: { id: true, name: true, email: true },
      });
      headOfDivision = head;
    }

    return this.mapToDivision({ ...division, headOfDivision });
  }

  async findByCode(code: string): Promise<Division | null> {
    const division = await prisma.division.findUnique({
      where: { code },
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });

    if (!division) return null;

    return this.mapToDivision(division);
  }

  async findByName(name: string): Promise<Division | null> {
    const division = await prisma.division.findUnique({
      where: { name },
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });

    if (!division) return null;

    return this.mapToDivision(division);
  }

  async create(data: CreateDivisionDTO): Promise<Division> {
    // Check if code already exists
    const existingCode = await this.findByCode(data.code);
    if (existingCode) {
      throw new ConflictError(`Division with code '${data.code}' already exists`);
    }

    // Check if name already exists
    const existingName = await this.findByName(data.name);
    if (existingName) {
      throw new ConflictError(`Division with name '${data.name}' already exists`);
    }

    // Validate headOfDivisionId if provided
    if (data.headOfDivisionId) {
      const user = await prisma.user.findUnique({
        where: { id: data.headOfDivisionId },
      });
      if (!user) {
        throw new NotFoundError('Head of division user not found');
      }
    }

    const division = await prisma.division.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        headOfDivisionId: data.headOfDivisionId,
        isActive: data.isActive ?? true,
      },
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });

    let headOfDivision = null;
    if (division.headOfDivisionId) {
      const head = await prisma.user.findUnique({
        where: { id: division.headOfDivisionId },
        select: { id: true, name: true, email: true },
      });
      headOfDivision = head;
    }

    return this.mapToDivision({ ...division, headOfDivision });
  }

  async update(id: string, data: UpdateDivisionDTO): Promise<Division | null> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError('Division not found');
    }

    // Check if code is being updated and if it already exists
    if (data.code && data.code !== existing.code) {
      const existingCode = await this.findByCode(data.code);
      if (existingCode) {
        throw new ConflictError(`Division with code '${data.code}' already exists`);
      }
    }

    // Check if name is being updated and if it already exists
    if (data.name && data.name !== existing.name) {
      const existingName = await this.findByName(data.name);
      if (existingName) {
        throw new ConflictError(`Division with name '${data.name}' already exists`);
      }
    }

    // Validate headOfDivisionId if provided
    if (data.headOfDivisionId) {
      const user = await prisma.user.findUnique({
        where: { id: data.headOfDivisionId },
      });
      if (!user) {
        throw new NotFoundError('Head of division user not found');
      }
    }

    const division = await prisma.division.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        headOfDivisionId: data.headOfDivisionId,
        isActive: data.isActive,
      },
      include: {
        _count: {
          select: { departments: true },
        },
      },
    });

    let headOfDivision = null;
    if (division.headOfDivisionId) {
      const head = await prisma.user.findUnique({
        where: { id: division.headOfDivisionId },
        select: { id: true, name: true, email: true },
      });
      headOfDivision = head;
    }

    return this.mapToDivision({ ...division, headOfDivision });
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError('Division not found');
    }

    // Check if division has departments
    if (existing.totalDepartments && existing.totalDepartments > 0) {
      throw new ConflictError('Cannot delete division with assigned departments');
    }

    await prisma.division.delete({
      where: { id },
    });

    return true;
  }

  async count(): Promise<number> {
    return prisma.division.count();
  }
}
