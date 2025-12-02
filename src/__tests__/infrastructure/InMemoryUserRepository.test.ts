import { InMemoryUserRepository } from "@/infrastructure/repositories/InMemoryUserRepository";
import { CreateUserDTO } from "@/domain/entities/User";

describe("InMemoryUserRepository", () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  describe("create", () => {
    it("should create a new user with generated id", async () => {
      const userData: CreateUserDTO = {
        name: "John Doe",
        email: "john@example.com",
      };

      const user = await repository.create(userData);

      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("findAll", () => {
    it("should return empty array initially", async () => {
      const users = await repository.findAll();
      expect(users).toEqual([]);
    });

    it("should return all created users", async () => {
      await repository.create({ name: "User 1", email: "user1@example.com" });
      await repository.create({ name: "User 2", email: "user2@example.com" });

      const users = await repository.findAll();

      expect(users).toHaveLength(2);
    });
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      const createdUser = await repository.create({
        name: "John Doe",
        email: "john@example.com",
      });

      const foundUser = await repository.findById(createdUser.id);

      expect(foundUser).toEqual(createdUser);
    });

    it("should return null when user not found", async () => {
      const foundUser = await repository.findById("non-existent-id");
      expect(foundUser).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should return user when email found", async () => {
      const createdUser = await repository.create({
        name: "John Doe",
        email: "john@example.com",
      });

      const foundUser = await repository.findByEmail("john@example.com");

      expect(foundUser).toEqual(createdUser);
    });

    it("should return null when email not found", async () => {
      const foundUser = await repository.findByEmail("nonexistent@example.com");
      expect(foundUser).toBeNull();
    });
  });

  describe("update", () => {
    it("should update user when found", async () => {
      const createdUser = await repository.create({
        name: "John Doe",
        email: "john@example.com",
      });

      const updatedUser = await repository.update(createdUser.id, {
        name: "John Updated",
      });

      expect(updatedUser?.name).toBe("John Updated");
      expect(updatedUser?.email).toBe("john@example.com");
    });

    it("should return null when user not found", async () => {
      const result = await repository.update("non-existent", { name: "Test" });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete user and return true when found", async () => {
      const createdUser = await repository.create({
        name: "John Doe",
        email: "john@example.com",
      });

      const result = await repository.delete(createdUser.id);

      expect(result).toBe(true);
      expect(await repository.findById(createdUser.id)).toBeNull();
    });

    it("should return false when user not found", async () => {
      const result = await repository.delete("non-existent-id");
      expect(result).toBe(false);
    });
  });
});
