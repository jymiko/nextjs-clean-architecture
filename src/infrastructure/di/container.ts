import { createContainer, asClass, asFunction, InjectionMode } from "awilix";
import { InMemoryUserRepository } from "../repositories/InMemoryUserRepository";
import {
  GetUsersUseCase,
  CreateUserUseCase,
  GetUserByIdUseCase,
} from "@/domain/usecases";
import { UserService } from "@/application/services/UserService";

export interface Cradle {
  userRepository: InMemoryUserRepository;
  getUsersUseCase: GetUsersUseCase;
  createUserUseCase: CreateUserUseCase;
  getUserByIdUseCase: GetUserByIdUseCase;
  userService: UserService;
}

const container = createContainer<Cradle>({
  injectionMode: InjectionMode.PROXY,
});

container.register({
  userRepository: asClass(InMemoryUserRepository).singleton(),

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
