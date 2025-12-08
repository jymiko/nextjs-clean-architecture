import { createContainer, asClass, asFunction, InjectionMode } from "awilix";
import { InMemoryUserRepository, PrismaUserRepository } from "../repositories";
import {
  GetUsersUseCase,
  CreateUserUseCase,
  GetUserByIdUseCase,
} from "@/domain/usecases";
import { UserService } from "@/application/services/UserService";
import { IUserRepository } from "@/domain/repositories";

export interface Cradle {
  userRepository: IUserRepository;
  getUsersUseCase: GetUsersUseCase;
  createUserUseCase: CreateUserUseCase;
  getUserByIdUseCase: GetUserByIdUseCase;
  userService: UserService;
}

const container = createContainer<Cradle>({
  injectionMode: InjectionMode.PROXY,
});

// Use PrismaUserRepository in production, InMemoryUserRepository for testing
const usePrisma = process.env.NODE_ENV !== 'test';

container.register({
  userRepository: asClass(
    usePrisma ? PrismaUserRepository : InMemoryUserRepository
  ).singleton(),

  getUsersUseCase: asFunction(
    ({ userRepository }: Cradle) => new GetUsersUseCase(userRepository)
  ).scoped(),

  createUserUseCase: asFunction(
    ({ userRepository }: Cradle) => new CreateUserUseCase(userRepository)
  ).scoped(),

  getUserByIdUseCase: asFunction(
    ({ userRepository }: Cradle) => new GetUserByIdUseCase(userRepository)
  ).scoped(),

  userService: asFunction(
    ({ getUsersUseCase, getUserByIdUseCase, createUserUseCase }: Cradle) =>
      new UserService(getUsersUseCase, getUserByIdUseCase, createUserUseCase)
  ).scoped(),
});

export { container };
