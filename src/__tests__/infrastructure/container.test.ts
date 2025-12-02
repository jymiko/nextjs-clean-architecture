import { container } from "@/infrastructure/di/container";
import { InMemoryUserRepository } from "@/infrastructure/repositories/InMemoryUserRepository";
import { GetUsersUseCase } from "@/domain/usecases/GetUsersUseCase";
import { CreateUserUseCase } from "@/domain/usecases/CreateUserUseCase";
import { GetUserByIdUseCase } from "@/domain/usecases/GetUserByIdUseCase";
import { UserService } from "@/application/services/UserService";

describe("DI Container", () => {
  it("should resolve userRepository as singleton", () => {
    const repo1 = container.cradle.userRepository;
    const repo2 = container.cradle.userRepository;

    expect(repo1).toBeInstanceOf(InMemoryUserRepository);
    expect(repo1).toBe(repo2);
  });

  it("should resolve getUsersUseCase", () => {
    const useCase = container.cradle.getUsersUseCase;
    expect(useCase).toBeInstanceOf(GetUsersUseCase);
  });

  it("should resolve createUserUseCase", () => {
    const useCase = container.cradle.createUserUseCase;
    expect(useCase).toBeInstanceOf(CreateUserUseCase);
  });

  it("should resolve getUserByIdUseCase", () => {
    const useCase = container.cradle.getUserByIdUseCase;
    expect(useCase).toBeInstanceOf(GetUserByIdUseCase);
  });

  it("should resolve userService", () => {
    const service = container.cradle.userService;
    expect(service).toBeInstanceOf(UserService);
  });

  it("should inject dependencies correctly into userService", async () => {
    const userService = container.cradle.userService;

    const users = await userService.getUsers();
    expect(Array.isArray(users)).toBe(true);
  });
});
