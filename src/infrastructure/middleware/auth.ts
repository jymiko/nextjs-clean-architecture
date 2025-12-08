import { NextRequest } from 'next/server';
import { verifyToken } from '../auth';
import { UnauthorizedError } from '../errors';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
  };
}

export const withAuth = async (request: NextRequest): Promise<AuthenticatedRequest> => {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  // Add user info to request
  (request as any).user = payload;

  return request as AuthenticatedRequest;
};