import { ResetPasswordDTO, ResetPasswordResponse } from '../entities/PasswordReset';
import { IPasswordResetRepository } from '../repositories/IPasswordResetRepository';

export interface IResetPasswordUseCase {
  execute(data: ResetPasswordDTO): Promise<ResetPasswordResponse>;
}

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(private readonly passwordResetRepository: IPasswordResetRepository) {}

  async execute(data: ResetPasswordDTO): Promise<ResetPasswordResponse> {
    return this.passwordResetRepository.resetPassword(data);
  }
}
