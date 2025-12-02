import { User, CreateUserDTO } from "@/domain/entities/User";
import { IUserRepository } from "@/domain/repositories/IUserRepository";

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
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

  async create(data: CreateUserDTO): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async update(id: string, data: Partial<CreateUserDTO>): Promise<User | null> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return null;
    }
    const updatedUser: User = {
      ...existingUser,
      ...data,
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}
