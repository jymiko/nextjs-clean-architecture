import { randomBytes } from 'crypto';
import {
  PasswordResetToken,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  VerifyTokenResponse,
} from '@/domain/entities/PasswordReset';
import { IPasswordResetRepository } from '@/domain/repositories/IPasswordResetRepository';
import { prisma } from '../database';
import { hashPassword } from '../auth/password';
import { NotFoundError, BadRequestError } from '../errors';

const TOKEN_EXPIRY_HOURS = 1; // Token expires in 1 hour

export class PrismaPasswordResetRepository implements IPasswordResetRepository {
  private generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  async createResetToken(userId: string): Promise<PasswordResetToken> {
    // Invalidate existing tokens for this user
    await this.invalidateUserTokens(userId);

    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    const resetToken = await prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return {
      id: resetToken.id,
      userId: resetToken.userId,
      token: resetToken.token,
      expiresAt: resetToken.expiresAt,
      used: resetToken.used,
      usedAt: resetToken.usedAt,
      createdAt: resetToken.createdAt,
    };
  }

  async findValidToken(token: string): Promise<PasswordResetToken | null> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) return null;

    // Check if token is expired or already used
    if (resetToken.used || resetToken.expiresAt < new Date()) {
      return null;
    }

    return {
      id: resetToken.id,
      userId: resetToken.userId,
      token: resetToken.token,
      expiresAt: resetToken.expiresAt,
      used: resetToken.used,
      usedAt: resetToken.usedAt,
      createdAt: resetToken.createdAt,
    };
  }

  async markTokenAsUsed(tokenId: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });
  }

  async invalidateUserTokens(userId: string): Promise<void> {
    await prisma.passwordResetToken.updateMany({
      where: {
        userId,
        used: false,
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });
  }

  async forgotPassword(data: ForgotPasswordDTO): Promise<ForgotPasswordResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      };
    }

    // Create reset token
    const resetToken = await this.createResetToken(user.id);

    // Return token info (in production, this would be sent via email)
    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
      // Note: In production, don't return the token here. Send it via email.
      // This is included for development/testing purposes
      ...(process.env.NODE_ENV === 'development' && { token: resetToken.token }),
    } as ForgotPasswordResponse;
  }

  async resetPassword(data: ResetPasswordDTO): Promise<ResetPasswordResponse> {
    // Find valid token
    const resetToken = await this.findValidToken(data.token);

    if (!resetToken) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await this.markTokenAsUsed(resetToken.id);

    // Invalidate all user sessions for security
    await prisma.session.deleteMany({
      where: { userId: resetToken.userId },
    });

    return {
      success: true,
      message: 'Password has been reset successfully. Please login with your new password.',
    };
  }

  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    const resetToken = await this.findValidToken(token);

    if (!resetToken) {
      return {
        valid: false,
      };
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: resetToken.userId },
      select: { email: true },
    });

    return {
      valid: true,
      email: user?.email,
      expiresAt: resetToken.expiresAt,
    };
  }
}
