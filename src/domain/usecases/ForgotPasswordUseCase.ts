import { ForgotPasswordDTO, ForgotPasswordResponse } from '../entities/PasswordReset';
import { IPasswordResetRepository } from '../repositories/IPasswordResetRepository';

export interface IForgotPasswordUseCase {
  execute(data: ForgotPasswordDTO): Promise<ForgotPasswordResponse>;
}

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(private readonly passwordResetRepository: IPasswordResetRepository) {}

  async execute(data: ForgotPasswordDTO): Promise<ForgotPasswordResponse> {
    return this.passwordResetRepository.forgotPassword(data);
  }
}
