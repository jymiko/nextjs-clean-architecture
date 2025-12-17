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
} from "@/domain/entities/User";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { generateSecurePassword, generateInvitationToken, calculateTokenExpiry } from '../auth/password-generator';

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

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

    let users = Array.from(this.users.values());

    // Exclude deleted users
    users = users.filter((user) => !user.deletedAt);

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.employeeId && user.employeeId.toLowerCase().includes(searchLower))
      );
    }

    // Filter by role
    if (role) {
      users = users.filter((user) => user.role === role);
    }

    // Filter by departmentId
    if (departmentId) {
      users = users.filter((user) => user.departmentId === departmentId);
    }

    // Filter by positionId
    if (positionId) {
      users = users.filter((user) => user.positionId === positionId);
    }

    // Filter by isActive
    if (isActive !== undefined) {
      users = users.filter((user) => user.isActive === isActive);
    }

    // Sort
    users.sort((a, b) => {
      const aVal = a[sortBy as keyof User];
      const bVal = b[sortBy as keyof User];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = users.length;
    const skip = (page - 1) * limit;
    const paginatedUsers = users.slice(skip, skip + limit);

    // Remove password from response
    const usersWithoutPassword = paginatedUsers.map(({ password: _, ...user }) => user);

    return {
      data: usersWithoutPassword as Omit<User, 'password'>[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    if (!user || user.deletedAt) {
      return null;
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email && !user.deletedAt) {
        return user;
      }
    }
    return null;
  }

  async findByEmployeeId(employeeId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.employeeId === employeeId && !user.deletedAt) {
        return user;
      }
    }
    return null;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const now = new Date();
    const user: User = {
      id: crypto.randomUUID(),
      employeeId: data.employeeId || null,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role ?? UserRole.USER,
      departmentId: data.departmentId || null,
      department: null,
      positionId: data.positionId || null,
      position: null,
      avatar: null,
      signature: null,
      isActive: data.isActive ?? true,
      mustChangePassword: false,
      lastLogin: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(user.id, user);
    return user;
  }

  async createWithAccess(data: CreateUserDTO): Promise<CreateUserResponseDTO> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const creationMethod = data.creationMethod || 'generate_password';
    const now = new Date();

    let plainPassword: string | undefined;
    let mustChangePassword = false;
    let invitationLink: string | undefined;
    let invitationExpiresAt: Date | undefined;

    if (creationMethod === 'generate_password') {
      plainPassword = generateSecurePassword(12);
      mustChangePassword = true;
    }

    const user: User = {
      id: crypto.randomUUID(),
      employeeId: data.employeeId || null,
      name: data.name,
      email: data.email,
      password: creationMethod === 'generate_password' ? plainPassword : undefined,
      role: data.role ?? UserRole.USER,
      departmentId: data.departmentId || null,
      department: null,
      positionId: data.positionId || null,
      position: null,
      avatar: null,
      signature: null,
      isActive: data.isActive ?? true,
      mustChangePassword,
      lastLogin: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(user.id, user);

    if (creationMethod === 'invitation_link') {
      const token = generateInvitationToken();
      invitationExpiresAt = calculateTokenExpiry(7);
      invitationLink = `${baseUrl}/accept-invitation?token=${token}`;
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      generatedPassword: plainPassword,
      invitationLink,
      invitationExpiresAt,
    };
  }

  async update(id: string, data: UpdateUserDTO): Promise<User | null> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return null;
    }
    const updatedUser: User = {
      ...existingUser,
      ...data,
      role: data.role ?? existingUser.role,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Soft delete - mark as inactive and set deletedAt
    user.isActive = false;
    user.deletedAt = new Date();
    user.email = `deleted_${Date.now()}_${user.email}`; // Avoid email conflicts
    user.updatedAt = new Date();

    this.users.set(id, user);
    return true;
  }

  async authenticate(loginData: LoginDTO): Promise<AuthResponse | null> {
    const user = await this.findByEmail(loginData.email);
    if (!user || user.password !== loginData.password) {
      return null;
    }
    if (!user.isActive) {
      return null;
    }

    // Update last login
    user.lastLogin = new Date();
    this.users.set(user.id, user);

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
      tokenType: 'Bearer',
    };
  }

  async count(): Promise<number> {
    return Array.from(this.users.values()).filter(user => !user.deletedAt).length;
  }
}
