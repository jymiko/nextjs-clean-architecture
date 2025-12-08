import { User, CreateUserDTO, UserListResponse, UserQueryParams } from "@/domain/entities/User";
import { IGetUsersUseCase } from "@/domain/usecases/GetUsersUseCase";
import { ICreateUserUseCase } from "@/domain/usecases/CreateUserUseCase";
import { IGetUserByIdUseCase } from "@/domain/usecases/GetUserByIdUseCase";

export interface IUserService {
  getUsers(params?: UserQueryParams): Promise<UserListResponse>;
  getUserById(id: string): Promise<User | null>;
  createUser(data: CreateUserDTO): Promise<User>;
}

export class UserService implements IUserService {
  constructor(
    private readonly getUsersUseCase: IGetUsersUseCase,
    private readonly getUserByIdUseCase: IGetUserByIdUseCase,
    private readonly createUserUseCase: ICreateUserUseCase
  ) {}

  async getUsers(params?: UserQueryParams): Promise<UserListResponse> {
    return this.getUsersUseCase.execute(params);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.getUserByIdUseCase.execute(id);
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    return this.createUserUseCase.execute(data);
  }
}
