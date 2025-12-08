import {
  PasswordResetToken,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  VerifyTokenResponse,
} from '../entities/PasswordReset';

export interface IPasswordResetRepository {
  createResetToken(userId: string): Promise<PasswordResetToken>;
  findValidToken(token: string): Promise<PasswordResetToken | null>;
  markTokenAsUsed(tokenId: string): Promise<void>;
  invalidateUserTokens(userId: string): Promise<void>;
  forgotPassword(data: ForgotPasswordDTO): Promise<ForgotPasswordResponse>;
  resetPassword(data: ResetPasswordDTO): Promise<ResetPasswordResponse>;
  verifyToken(token: string): Promise<VerifyTokenResponse>;
}
