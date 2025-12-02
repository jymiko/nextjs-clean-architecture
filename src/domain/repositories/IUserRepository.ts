import { User, CreateUserDTO } from "../entities/User";

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: Partial<CreateUserDTO>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}
