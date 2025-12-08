import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  LoginDTO,
  AuthResponse,
  UserListResponse,
  UserQueryParams,
} from "../entities/User";

export interface IUserRepository {
  findAll(params?: UserQueryParams): Promise<UserListResponse>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmployeeId(employeeId: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  authenticate(loginData: LoginDTO): Promise<AuthResponse | null>;
  count(): Promise<number>;
}
