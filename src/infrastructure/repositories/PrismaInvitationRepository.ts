import {
  InvitationToken,
  VerifyInvitationResponse,
  AcceptInvitationDTO,
  AcceptInvitationResponse,
  ResendInvitationResponse,
} from '@/domain/entities/Invitation';
import { IInvitationRepository } from '@/domain/repositories/IInvitationRepository';
import { prisma } from '../database';
import { hashPassword } from '../auth';
import { generateInvitationToken, calculateTokenExpiry } from '../auth/password-generator';
import { NotFoundError, BadRequestError } from '../errors';

const TOKEN_EXPIRY_DAYS = 7; // 7 days

export class PrismaInvitationRepository implements IInvitationRepository {
  private mapToInvitationToken(data: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    accepted: boolean;
    acceptedAt: Date | null;
    createdAt: Date;
    user?: { id: string; name: string; email: string };
  }): InvitationToken {
    return {
      id: data.id,
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      accepted: data.accepted,
      acceptedAt: data.acceptedAt,
      createdAt: data.createdAt,
      user: data.user,
    };
  }

  async createInvitation(userId: string): Promise<InvitationToken> {
    // Invalidate any existing tokens first
    await this.invalidateUserTokens(userId);

    const token = generateInvitationToken();
    const expiresAt = calculateTokenExpiry(TOKEN_EXPIRY_DAYS);

    const invitation = await prisma.invitationToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return this.mapToInvitationToken(invitation);
  }

  async findValidToken(token: string): Promise<InvitationToken | null> {
    const invitation = await prisma.invitationToken.findFirst({
      where: {
        token,
        accepted: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!invitation) return null;

    return this.mapToInvitationToken(invitation);
  }

  async verifyToken(token: string): Promise<VerifyInvitationResponse> {
    const invitation = await prisma.invitationToken.findFirst({
      where: { token },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!invitation) {
      return {
        valid: false,
        message: 'Invitation token not found',
      };
    }

    if (invitation.accepted) {
      return {
        valid: false,
        message: 'This invitation has already been accepted',
      };
    }

    if (invitation.expiresAt < new Date()) {
      return {
        valid: false,
        message: 'This invitation has expired',
      };
    }

    return {
      valid: true,
      email: invitation.user.email,
      name: invitation.user.name,
      expiresAt: invitation.expiresAt,
    };
  }

  async acceptInvitation(data: AcceptInvitationDTO): Promise<AcceptInvitationResponse> {
    const invitation = await this.findValidToken(data.token);

    if (!invitation) {
      throw new BadRequestError('Invalid or expired invitation token');
    }

    // Hash the password
    const hashedPassword = await hashPassword(data.password);

    // Update user with password and mark invitation as accepted
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: invitation.userId },
        data: {
          password: hashedPassword,
          mustChangePassword: false, // User set their own password
          isActive: true,
        },
        select: { id: true, name: true, email: true },
      }),
      prisma.invitationToken.update({
        where: { id: invitation.id },
        data: {
          accepted: true,
          acceptedAt: new Date(),
        },
      }),
    ]);

    return {
      success: true,
      message: 'Invitation accepted successfully. You can now log in.',
      user: updatedUser,
    };
  }

  async invalidateUserTokens(userId: string): Promise<void> {
    await prisma.invitationToken.updateMany({
      where: {
        userId,
        accepted: false,
      },
      data: {
        accepted: true,
        acceptedAt: new Date(),
      },
    });
  }

  async resendInvitation(userId: string): Promise<ResendInvitationResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, password: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user already has a password (already activated)
    if (user.password) {
      throw new BadRequestError('User has already set their password');
    }

    // Invalidate old tokens and create new one
    await this.invalidateUserTokens(userId);

    const token = generateInvitationToken();
    const expiresAt = calculateTokenExpiry(TOKEN_EXPIRY_DAYS);

    await prisma.invitationToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    const invitationLink = `${baseUrl}/accept-invitation?token=${token}`;

    return {
      success: true,
      invitationLink,
      expiresAt,
      message: 'Invitation resent successfully',
    };
  }

  async hasPendingInvitation(userId: string): Promise<boolean> {
    const count = await prisma.invitationToken.count({
      where: {
        userId,
        accepted: false,
        expiresAt: { gt: new Date() },
      },
    });

    return count > 0;
  }
}
