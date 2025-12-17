export interface InvitationToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  accepted: boolean;
  acceptedAt?: Date | null;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface VerifyInvitationResponse {
  valid: boolean;
  email?: string;
  name?: string;
  expiresAt?: Date;
  message?: string;
}

export interface AcceptInvitationDTO {
  token: string;
  password: string;
}

export interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ResendInvitationResponse {
  success: boolean;
  invitationLink: string;
  expiresAt: Date;
  message: string;
}
