import {
  User,
  UserRole,
  CreateUserDTO,
  UpdateUserDTO,
  LoginDTO,
  AuthResponse,
  UserListResponse,
  UserQueryParams,
  CreateUserResponseDTO,
} from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { prisma } from '../database';
import { hashPassword, comparePassword } from '../auth';
import { generateTokenPair } from '../auth/refresh-token';
import { generateSecurePassword, generateInvitationToken, calculateTokenExpiry } from '../auth/password-generator';
import { ConflictError, UnauthorizedError, NotFoundError } from '../errors';
import { UserRole as PrismaUserRole } from '@prisma/client';

export class PrismaUserRepository implements IUserRepository {
  private mapToUser(data: {
    id: string;
    employeeId: string | null;
    email: string;
    name: string;
    password: string | null;
    role: PrismaUserRole;
    departmentId: string | null;
    department?: { id: string; code: string; name: string } | null;
    positionId: string | null;
    position?: { id: string; code: string; name: string } | null;
    avatar: string | null;
    signature: string | null;
    isActive: boolean;
    mustChangePassword: boolean;
    deletedAt: Date | null;
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
      role: data.role as UserRole,
      departmentId: data.departmentId,
      department: data.department || null,
      positionId: data.positionId,
      position: data.position || null,
      avatar: data.avatar,
      signature: data.signature,
      isActive: data.isActive,
      mustChangePassword: data.mustChangePassword,
      deletedAt: data.deletedAt,
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
      role,
      departmentId,
      positionId,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null, // Exclude deleted users
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
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
    const user = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null, // Exclude deleted users
      },
      include: {
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
    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null, // Exclude deleted users
      },
      include: {
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
    const user = await prisma.user.findFirst({
      where: {
        employeeId,
        deletedAt: null, // Exclude deleted users
      },
      include: {
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
        role: data.role ?? 'USER',
        departmentId: data.departmentId,
        positionId: data.positionId,
        isActive: data.isActive ?? true,
        mustChangePassword: false, // Will be set by createWithAccess method
      },
      include: {
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

  /**
   * Create user with access method (generate password or invitation link)
   * This is the preferred method for admin-created users
   */
  async createWithAccess(data: CreateUserDTO): Promise<CreateUserResponseDTO> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const creationMethod = data.creationMethod || 'generate_password';

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

    let plainPassword: string | undefined;
    let hashedPassword: string | null = null;
    let mustChangePassword = false;
    let invitationLink: string | undefined;
    let invitationExpiresAt: Date | undefined;

    if (creationMethod === 'generate_password') {
      // Generate a secure password
      plainPassword = generateSecurePassword(12);
      hashedPassword = await hashPassword(plainPassword);
      mustChangePassword = true; // User must change password on first login
    }
    // For 'invitation_link', password remains null - will be set when user accepts invitation

    // Create user
    const user = await prisma.user.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role ?? 'USER',
        departmentId: data.departmentId,
        positionId: data.positionId,
        isActive: data.isActive ?? true,
        mustChangePassword,
      },
      include: {
        department: {
          select: { id: true, code: true, name: true },
        },
        position: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    // If using invitation link, create invitation token
    if (creationMethod === 'invitation_link') {
      const token = generateInvitationToken();
      invitationExpiresAt = calculateTokenExpiry(7); // 7 days

      await prisma.invitationToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: invitationExpiresAt,
        },
      });

      invitationLink = `${baseUrl}/accept-invitation?token=${token}`;
    }

    const mappedUser = this.mapToUser(user);
    const { password: _, ...userWithoutPassword } = mappedUser;

    return {
      user: userWithoutPassword,
      generatedPassword: plainPassword,
      invitationLink,
      invitationExpiresAt,
    };
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
        role: data.role,
        departmentId: data.departmentId,
        positionId: data.positionId,
        avatar: data.avatar,
        signature: data.signature,
        isActive: data.isActive,
        mustChangePassword: data.mustChangePassword,
      },
      include: {
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

    // Soft delete - mark as inactive and set deletedAt timestamp
    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        email: `deleted_${Date.now()}_${existingUser.email}`, // Avoid email conflicts
        updatedAt: new Date()
      },
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

    // Generate token pair (access token and refresh token)
    const tokenPair = await generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      tokenType: 'Bearer',
      requirePasswordChange: user.mustChangePassword, // Indicate if user must change password
    };
  }

  async count(): Promise<number> {
    return prisma.user.count({
      where: {
        deletedAt: null, // Exclude deleted users
      },
    });
  }
}
