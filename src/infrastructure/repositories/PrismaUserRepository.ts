import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  LoginDTO,
  AuthResponse,
  UserListResponse,
  UserQueryParams,
} from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { prisma } from '../database';
import { hashPassword, comparePassword, generateToken } from '../auth';
import { ConflictError, UnauthorizedError, NotFoundError } from '../errors';

export class PrismaUserRepository implements IUserRepository {
  private mapToUser(data: {
    id: string;
    employeeId: string | null;
    email: string;
    name: string;
    password: string | null;
    roleId: string | null;
    role?: { id: string; code: string; name: string } | null;
    departmentId: string | null;
    department?: { id: string; code: string; name: string } | null;
    positionId: string | null;
    position?: { id: string; code: string; name: string } | null;
    phone: string | null;
    avatar: string | null;
    isActive: boolean;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return {
      id: data.id,
      employeeId: data.employeeId,
      name: data.name,
      email: data.email,
      password: data.password ?? undefined,
      roleId: data.roleId,
      role: data.role || null,
      departmentId: data.departmentId,
      department: data.department || null,
      positionId: data.positionId,
      position: data.position || null,
      phone: data.phone,
      avatar: data.avatar,
      isActive: data.isActive,
      lastLogin: data.lastLogin,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async findAll(params: UserQueryParams = {}): Promise<UserListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      roleId,
      departmentId,
      positionId,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleId) {
      where.roleId = roleId;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (positionId) {
      where.positionId = positionId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          role: {
            select: { id: true, code: true, name: true },
          },
          department: {
            select: { id: true, code: true, name: true },
          },
          position: {
            select: { id: true, code: true, name: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Remove password from response
    const usersWithoutPassword = users.map((user) => {
      const mapped = this.mapToUser(user);
      const { password: _, ...userWithoutPassword } = mapped;
      return userWithoutPassword;
    });

    return {
      data: usersWithoutPassword as Omit<User, 'password'>[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          select: { id: true, code: true, name: true },
        },
        department: {
          select: { id: true, code: true, name: true },
        },
        position: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    if (!user) return null;

    return this.mapToUser(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          select: { id: true, code: true, name: true },
        },
        department: {
          select: { id: true, code: true, name: true },
        },
        position: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    if (!user) return null;

    return this.mapToUser(user);
  }

  async findByEmployeeId(employeeId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { employeeId },
      include: {
        role: {
          select: { id: true, code: true, name: true },
        },
        department: {
          select: { id: true, code: true, name: true },
        },
        position: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    if (!user) return null;

    return this.mapToUser(user);
  }

  async create(data: CreateUserDTO): Promise<User> {
    // Check if user already exists by email
    const existingEmail = await this.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('User with this email already exists');
    }

    // Check if employeeId already exists (if provided)
    if (data.employeeId) {
      const existingEmployeeId = await this.findByEmployeeId(data.employeeId);
      if (existingEmployeeId) {
        throw new ConflictError('User with this employee ID already exists');
      }
    }

    // Validate roleId if provided
    if (data.roleId) {
      const role = await prisma.role.findUnique({ where: { id: data.roleId } });
      if (!role) {
        throw new NotFoundError('Role not found');
      }
    }

    // Validate departmentId if provided
    if (data.departmentId) {
      const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
      if (!department) {
        throw new NotFoundError('Department not found');
      }
    }

    // Validate positionId if provided
    if (data.positionId) {
      const position = await prisma.position.findUnique({ where: { id: data.positionId } });
      if (!position) {
        throw new NotFoundError('Position not found');
      }
    }

    // Hash password if provided
    const hashedPassword = data.password ? await hashPassword(data.password) : null;

    const user = await prisma.user.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        roleId: data.roleId,
        departmentId: data.departmentId,
        positionId: data.positionId,
        phone: data.phone,
        isActive: data.isActive ?? true,
      },
      include: {
        role: {
          select: { id: true, code: true, name: true },
        },
        department: {
          select: { id: true, code: true, name: true },
        },
        position: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return this.mapToUser(user);
  }

  async update(id: string, data: UpdateUserDTO): Promise<User | null> {
    // Check if user exists
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // If updating email, check if it's already taken
    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await this.findByEmail(data.email);
      if (emailTaken) {
        throw new ConflictError('Email is already taken');
      }
    }

    // If updating employeeId, check if it's already taken
    if (data.employeeId && data.employeeId !== existingUser.employeeId) {
      const employeeIdTaken = await this.findByEmployeeId(data.employeeId);
      if (employeeIdTaken) {
        throw new ConflictError('Employee ID is already taken');
      }
    }

    // Validate roleId if provided
    if (data.roleId) {
      const role = await prisma.role.findUnique({ where: { id: data.roleId } });
      if (!role) {
        throw new NotFoundError('Role not found');
      }
    }

    // Validate departmentId if provided
    if (data.departmentId) {
      const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
      if (!department) {
        throw new NotFoundError('Department not found');
      }
    }

    // Validate positionId if provided
    if (data.positionId) {
      const position = await prisma.position.findUnique({ where: { id: data.positionId } });
      if (!position) {
        throw new NotFoundError('Position not found');
      }
    }

    // Hash password if provided
    const hashedPassword = data.password ? await hashPassword(data.password) : undefined;

    const user = await prisma.user.update({
      where: { id },
      data: {
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        roleId: data.roleId,
        departmentId: data.departmentId,
        positionId: data.positionId,
        phone: data.phone,
        avatar: data.avatar,
        isActive: data.isActive,
      },
      include: {
        role: {
          select: { id: true, code: true, name: true },
        },
        department: {
          select: { id: true, code: true, name: true },
        },
        position: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return this.mapToUser(user);
  }

  async delete(id: string): Promise<boolean> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    await prisma.user.delete({
      where: { id },
    });

    return true;
  }

  async authenticate(loginData: LoginDTO): Promise<AuthResponse | null> {
    const user = await this.findByEmail(loginData.email);

    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    const isPasswordValid = await comparePassword(loginData.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async count(): Promise<number> {
    return prisma.user.count();
  }
}
