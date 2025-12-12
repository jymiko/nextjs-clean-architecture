import {
  Department,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  DepartmentListResponse,
  DepartmentQueryParams,
} from '@/domain/entities/Department';
import { IDepartmentRepository } from '@/domain/repositories/IDepartmentRepository';
import { prisma } from '../database';
import { ConflictError, NotFoundError } from '../errors';

export class PrismaDepartmentRepository implements IDepartmentRepository {
  private mapToDepartment(data: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    divisionId: string | null;
    headOfDepartmentId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: { users: number };
    division?: { id: string; code: string; name: string } | null;
    headOfDepartment?: { id: string; name: string; email: string } | null;
  }): Department {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      divisionId: data.divisionId,
      division: data.division || null,
      headOfDepartmentId: data.headOfDepartmentId,
      headOfDepartment: data.headOfDepartment || null,
      isActive: data.isActive,
      totalEmployees: data._count?.users || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async findAll(params: DepartmentQueryParams): Promise<DepartmentListResponse> {
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

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { users: true },
          },
          division: {
            select: { id: true, code: true, name: true },
          },
        },
      }),
      prisma.department.count({ where }),
    ]);

    // Fetch head of department info separately
    const departmentsWithHead = await Promise.all(
      departments.map(async (dept) => {
        let headOfDepartment = null;
        if (dept.headOfDepartmentId) {
          const head = await prisma.user.findUnique({
            where: { id: dept.headOfDepartmentId },
            select: { id: true, name: true, email: true },
          });
          headOfDepartment = head;
        }
        return this.mapToDepartment({ ...dept, headOfDepartment });
      })
    );

    return {
      data: departmentsWithHead,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Department | null> {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
        division: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    if (!department) return null;

    let headOfDepartment = null;
    if (department.headOfDepartmentId) {
      const head = await prisma.user.findUnique({
        where: { id: department.headOfDepartmentId },
        select: { id: true, name: true, email: true },
      });
      headOfDepartment = head;
    }

    return this.mapToDepartment({ ...department, headOfDepartment });
  }

  async findByCode(code: string): Promise<Department | null> {
    const department = await prisma.department.findUnique({
      where: { code },
      include: {
        _count: {
          select: { users: true },
        },
        division: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    if (!department) return null;

    return this.mapToDepartment(department);
  }

  async findByName(name: string): Promise<Department | null> {
    const department = await prisma.department.findUnique({
      where: { name },
      include: {
        _count: {
          select: { users: true },
        },
        division: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    if (!department) return null;

    return this.mapToDepartment(department);
  }

  async create(data: CreateDepartmentDTO): Promise<Department> {
    // Check if code already exists
    const existingCode = await this.findByCode(data.code);
    if (existingCode) {
      throw new ConflictError(`Department with code '${data.code}' already exists`);
    }

    // Check if name already exists
    const existingName = await this.findByName(data.name);
    if (existingName) {
      throw new ConflictError(`Department with name '${data.name}' already exists`);
    }

    // Validate divisionId if provided
    if (data.divisionId) {
      const division = await prisma.division.findUnique({
        where: { id: data.divisionId },
      });
      if (!division) {
        throw new NotFoundError('Division not found');
      }
    }

    // Validate headOfDepartmentId if provided
    if (data.headOfDepartmentId) {
      const user = await prisma.user.findUnique({
        where: { id: data.headOfDepartmentId },
      });
      if (!user) {
        throw new NotFoundError('Head of department user not found');
      }
    }

    const department = await prisma.department.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        divisionId: data.divisionId,
        headOfDepartmentId: data.headOfDepartmentId,
        isActive: data.isActive ?? true,
      },
      include: {
        _count: {
          select: { users: true },
        },
        division: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    let headOfDepartment = null;
    if (department.headOfDepartmentId) {
      const head = await prisma.user.findUnique({
        where: { id: department.headOfDepartmentId },
        select: { id: true, name: true, email: true },
      });
      headOfDepartment = head;
    }

    return this.mapToDepartment({ ...department, headOfDepartment });
  }

  async update(id: string, data: UpdateDepartmentDTO): Promise<Department | null> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError('Department not found');
    }

    // Check if code already exists (if updating code)
    if (data.code && data.code !== existing.code) {
      const existingCode = await this.findByCode(data.code);
      if (existingCode) {
        throw new ConflictError(`Department with code '${data.code}' already exists`);
      }
    }

    // Check if name already exists (if updating name)
    if (data.name && data.name !== existing.name) {
      const existingName = await this.findByName(data.name);
      if (existingName) {
        throw new ConflictError(`Department with name '${data.name}' already exists`);
      }
    }

    // Validate divisionId if provided
    if (data.divisionId) {
      const division = await prisma.division.findUnique({
        where: { id: data.divisionId },
      });
      if (!division) {
        throw new NotFoundError('Division not found');
      }
    }

    // Validate headOfDepartmentId if provided
    if (data.headOfDepartmentId) {
      const user = await prisma.user.findUnique({
        where: { id: data.headOfDepartmentId },
      });
      if (!user) {
        throw new NotFoundError('Head of department user not found');
      }
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        divisionId: data.divisionId,
        headOfDepartmentId: data.headOfDepartmentId,
        isActive: data.isActive,
      },
      include: {
        _count: {
          select: { users: true },
        },
        division: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    let headOfDepartment = null;
    if (department.headOfDepartmentId) {
      const head = await prisma.user.findUnique({
        where: { id: department.headOfDepartmentId },
        select: { id: true, name: true, email: true },
      });
      headOfDepartment = head;
    }

    return this.mapToDepartment({ ...department, headOfDepartment });
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError('Department not found');
    }

    // Check if department has employees
    if (existing.totalEmployees && existing.totalEmployees > 0) {
      throw new ConflictError('Cannot delete department with assigned employees');
    }

    // Check if department has positions
    const positionCount = await prisma.position.count({
      where: { departmentId: id },
    });

    if (positionCount > 0) {
      throw new ConflictError('Cannot delete department with assigned positions');
    }

    await prisma.department.delete({
      where: { id },
    });

    return true;
  }

  async count(): Promise<number> {
    return prisma.department.count();
  }
}
