import { GetUsersUseCase } from "@/domain/usecases/GetUsersUseCase";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { User, UserRole, UserListResponse } from "@/domain/entities/User";

describe("GetUsersUseCase", () => {
  let getUsersUseCase: GetUsersUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockUsers: User[] = [
    { id: "1", name: "John Doe", email: "john@example.com", role: UserRole.USER, isActive: true, mustChangePassword: false, createdAt: new Date(), updatedAt: new Date() },
    { id: "2", name: "Jane Doe", email: "jane@example.com", role: UserRole.ADMIN, isActive: true, mustChangePassword: false, createdAt: new Date(), updatedAt: new Date() },
  ];

  const mockUserListResponse: UserListResponse = {
    data: mockUsers,
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(() => {
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmployeeId: jest.fn(),
      create: jest.fn(),
      createWithAccess: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      authenticate: jest.fn(),
      count: jest.fn(),
    };
    getUsersUseCase = new GetUsersUseCase(mockUserRepository);
  });

  it("should return all users", async () => {
    mockUserRepository.findAll.mockResolvedValue(mockUserListResponse);

    const result = await getUsersUseCase.execute();

    expect(result).toEqual(mockUserListResponse);
    expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it("should return empty array when no users exist", async () => {
    const emptyResponse: UserListResponse = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
    mockUserRepository.findAll.mockResolvedValue(emptyResponse);

    const result = await getUsersUseCase.execute();

    expect(result.data).toEqual([]);
    expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
