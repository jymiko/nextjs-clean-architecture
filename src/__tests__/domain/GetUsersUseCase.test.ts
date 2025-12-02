import { GetUsersUseCase } from "@/domain/usecases/GetUsersUseCase";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { User } from "@/domain/entities/User";

describe("GetUsersUseCase", () => {
  let getUsersUseCase: GetUsersUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockUsers: User[] = [
    { id: "1", name: "John Doe", email: "john@example.com", createdAt: new Date() },
    { id: "2", name: "Jane Doe", email: "jane@example.com", createdAt: new Date() },
  ];

  beforeEach(() => {
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    getUsersUseCase = new GetUsersUseCase(mockUserRepository);
  });

  it("should return all users", async () => {
    mockUserRepository.findAll.mockResolvedValue(mockUsers);

    const result = await getUsersUseCase.execute();

    expect(result).toEqual(mockUsers);
    expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it("should return empty array when no users exist", async () => {
    mockUserRepository.findAll.mockResolvedValue([]);

    const result = await getUsersUseCase.execute();

    expect(result).toEqual([]);
    expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
