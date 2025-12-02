import { User, CreateUserDTO } from "../entities/User";
import { IUserRepository } from "../repositories/IUserRepository";

export interface ICreateUserUseCase {
  execute(data: CreateUserDTO): Promise<User>;
}

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: CreateUserDTO): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    return this.userRepository.create(data);
  }
}
