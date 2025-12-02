import { User } from "../entities/User";
import { IUserRepository } from "../repositories/IUserRepository";

export interface IGetUsersUseCase {
  execute(): Promise<User[]>;
}

export class GetUsersUseCase implements IGetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
