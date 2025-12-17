import {
  InvitationToken,
  VerifyInvitationResponse,
  AcceptInvitationDTO,
  AcceptInvitationResponse,
  ResendInvitationResponse,
} from '../entities/Invitation';

export interface IInvitationRepository {
  /**
   * Create a new invitation token for a user
   */
  createInvitation(userId: string): Promise<InvitationToken>;

  /**
   * Find a valid (not expired, not used) invitation token
   */
  findValidToken(token: string): Promise<InvitationToken | null>;

  /**
   * Verify if an invitation token is valid
   */
  verifyToken(token: string): Promise<VerifyInvitationResponse>;

  /**
   * Accept an invitation and set the user's password
   */
  acceptInvitation(data: AcceptInvitationDTO): Promise<AcceptInvitationResponse>;

  /**
   * Invalidate all existing tokens for a user
   */
  invalidateUserTokens(userId: string): Promise<void>;

  /**
   * Resend invitation - invalidate old tokens and create new one
   */
  resendInvitation(userId: string): Promise<ResendInvitationResponse>;

  /**
   * Check if user has pending invitation
   */
  hasPendingInvitation(userId: string): Promise<boolean>;
}
