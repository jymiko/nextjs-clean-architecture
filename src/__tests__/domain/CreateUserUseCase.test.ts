import { CreateUserUseCase } from "@/domain/usecases/CreateUserUseCase";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { User, CreateUserDTO } from "@/domain/entities/User";

describe("CreateUserUseCase", () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    createUserUseCase = new CreateUserUseCase(mockUserRepository);
  });

  it("should create a new user when email does not exist", async () => {
    const createUserDTO: CreateUserDTO = {
      name: "John Doe",
      email: "john@example.com",
    };

    const expectedUser: User = {
      id: "1",
      ...createUserDTO,
      createdAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(expectedUser);

    const result = await createUserUseCase.execute(createUserDTO);

    expect(result).toEqual(expectedUser);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserDTO.email);
    expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDTO);
  });

  it("should throw error when user with email already exists", async () => {
    const createUserDTO: CreateUserDTO = {
      name: "John Doe",
      email: "john@example.com",
    };

    const existingUser: User = {
      id: "1",
      name: "Existing User",
      email: "john@example.com",
      createdAt: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(createUserUseCase.execute(createUserDTO)).rejects.toThrow(
      "User with this email already exists"
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
