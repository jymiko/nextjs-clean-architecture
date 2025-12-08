import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  LoginDTO,
  AuthResponse,
  UserListResponse,
  UserQueryParams,
} from "@/domain/entities/User";
import { IUserRepository } from "@/domain/repositories/IUserRepository";

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

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

    let users = Array.from(this.users.values());

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

    // Filter by roleId
    if (roleId) {
      users = users.filter((user) => user.roleId === roleId);
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
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findByEmployeeId(employeeId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.employeeId === employeeId) {
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
      roleId: data.roleId || null,
      role: null,
      departmentId: data.departmentId || null,
      department: null,
      positionId: data.positionId || null,
      position: null,
      phone: data.phone || null,
      avatar: null,
      isActive: data.isActive ?? true,
      lastLogin: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(user.id, user);
    return user;
  }

  async update(id: string, data: UpdateUserDTO): Promise<User | null> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return null;
    }
    const updatedUser: User = {
      ...existingUser,
      ...data,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
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
      token: 'mock-jwt-token',
    };
  }

  async count(): Promise<number> {
    return this.users.size;
  }
}
