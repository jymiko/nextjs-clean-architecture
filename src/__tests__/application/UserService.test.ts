import { UserService } from "@/application/services/UserService";
import { IGetUsersUseCase } from "@/domain/usecases/GetUsersUseCase";
import { IGetUserByIdUseCase } from "@/domain/usecases/GetUserByIdUseCase";
import { ICreateUserUseCase } from "@/domain/usecases/CreateUserUseCase";
import { User, UserRole, CreateUserDTO, UserListResponse } from "@/domain/entities/User";

describe("UserService", () => {
  let userService: UserService;
  let mockGetUsersUseCase: jest.Mocked<IGetUsersUseCase>;
  let mockGetUserByIdUseCase: jest.Mocked<IGetUserByIdUseCase>;
  let mockCreateUserUseCase: jest.Mocked<ICreateUserUseCase>;

  const mockUser: User = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserListResponse: UserListResponse = {
    data: [mockUser],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(() => {
    mockGetUsersUseCase = { execute: jest.fn() };
    mockGetUserByIdUseCase = { execute: jest.fn() };
    mockCreateUserUseCase = { execute: jest.fn() };

    userService = new UserService(
      mockGetUsersUseCase,
      mockGetUserByIdUseCase,
      mockCreateUserUseCase
    );
  });

  describe("getUsers", () => {
    it("should return all users from use case", async () => {
      mockGetUsersUseCase.execute.mockResolvedValue(mockUserListResponse);

      const result = await userService.getUsers();

      expect(result).toEqual(mockUserListResponse);
      expect(mockGetUsersUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe("getUserById", () => {
    it("should return user from use case", async () => {
      mockGetUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const result = await userService.getUserById("1");

      expect(result).toEqual(mockUser);
      expect(mockGetUserByIdUseCase.execute).toHaveBeenCalledWith("1");
    });

    it("should return null when user not found", async () => {
      mockGetUserByIdUseCase.execute.mockResolvedValue(null);

      const result = await userService.getUserById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create user via use case", async () => {
      const createUserDTO: CreateUserDTO = {
        name: "John Doe",
        email: "john@example.com",
      };
      mockCreateUserUseCase.execute.mockResolvedValue(mockUser);

      const result = await userService.createUser(createUserDTO);

      expect(result).toEqual(mockUser);
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(createUserDTO);
    });
  });
});
