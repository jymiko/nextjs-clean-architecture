import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  LoginDTO,
  AuthResponse,
  UserListResponse,
  UserQueryParams,
  CreateUserResponseDTO,
} from "../entities/User";

export interface IUserRepository {
  findAll(params?: UserQueryParams): Promise<UserListResponse>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmployeeId(employeeId: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
  createWithAccess(data: CreateUserDTO): Promise<CreateUserResponseDTO>;
  update(id: string, data: UpdateUserDTO): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  authenticate(loginData: LoginDTO): Promise<AuthResponse | null>;
  count(): Promise<number>;
}
