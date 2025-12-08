import { UserListResponse, UserQueryParams } from "../entities/User";
import { IUserRepository } from "../repositories/IUserRepository";

export interface IGetUsersUseCase {
  execute(params?: UserQueryParams): Promise<UserListResponse>;
}

export class GetUsersUseCase implements IGetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params?: UserQueryParams): Promise<UserListResponse> {
    return this.userRepository.findAll(params);
  }
}
