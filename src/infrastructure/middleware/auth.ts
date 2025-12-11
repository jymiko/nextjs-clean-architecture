import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../auth';
import { UnauthorizedError } from '../errors';
import { getUserFriendlyMessage } from '../errors/user-friendly-messages';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role?: string;
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

/**
 * Higher-order function to wrap API handlers with authentication
 * @param handler - The API handler function to protect
 * @param options - Configuration options
 * @returns Protected API handler
 */
export function withAuthHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    allowedRoles?: string[];
  } = { requireAuth: true }
) {
  return async (request: NextRequest, context?: any) => {
    // Skip authentication if not required
    if (!options.requireAuth) {
      return handler(request, context);
    }

    try {
      // Apply authentication middleware
      const authenticatedRequest = await withAuth(request);

      // Check role-based access if roles are specified
      if (options.allowedRoles && options.allowedRoles.length > 0) {
        const userRole = authenticatedRequest.user?.role;
        if (!userRole || !options.allowedRoles.includes(userRole)) {
          const friendlyMessage = getUserFriendlyMessage('Access denied');
          return NextResponse.json(
            { error: friendlyMessage || 'Access denied' },
            { status: 403 }
          );
        }
      }

      // Call the original handler with authenticated request
      return handler(authenticatedRequest, context);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        const friendlyMessage = getUserFriendlyMessage(error.message);
        return NextResponse.json(
          { error: friendlyMessage || error.message },
          { status: 401 }
        );
      }
      throw error;
    }
  };
}