import { User, CreateUserDTO } from "@/domain/entities/User";
import { IGetUsersUseCase } from "@/domain/usecases/GetUsersUseCase";
import { ICreateUserUseCase } from "@/domain/usecases/CreateUserUseCase";
import { IGetUserByIdUseCase } from "@/domain/usecases/GetUserByIdUseCase";

export interface IUserService {
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  createUser(data: CreateUserDTO): Promise<User>;
}

export class UserService implements IUserService {
  constructor(
    private readonly getUsersUseCase: IGetUsersUseCase,
    private readonly getUserByIdUseCase: IGetUserByIdUseCase,
    private readonly createUserUseCase: ICreateUserUseCase
  ) {}

  async getUsers(): Promise<User[]> {
    return this.getUsersUseCase.execute();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.getUserByIdUseCase.execute(id);
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    return this.createUserUseCase.execute(data);
  }
}
