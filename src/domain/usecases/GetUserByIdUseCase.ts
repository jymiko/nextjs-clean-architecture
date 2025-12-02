import { User } from "../entities/User";
import { IUserRepository } from "../repositories/IUserRepository";

export interface IGetUserByIdUseCase {
  execute(id: string): Promise<User | null>;
}

export class GetUserByIdUseCase implements IGetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
