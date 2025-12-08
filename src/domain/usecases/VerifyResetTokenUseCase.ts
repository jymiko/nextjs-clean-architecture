import { VerifyTokenResponse } from '../entities/PasswordReset';
import { IPasswordResetRepository } from '../repositories/IPasswordResetRepository';

export interface IVerifyResetTokenUseCase {
  execute(token: string): Promise<VerifyTokenResponse>;
}

export class VerifyResetTokenUseCase implements IVerifyResetTokenUseCase {
  constructor(private readonly passwordResetRepository: IPasswordResetRepository) {}

  async execute(token: string): Promise<VerifyTokenResponse> {
    return this.passwordResetRepository.verifyToken(token);
  }
}
