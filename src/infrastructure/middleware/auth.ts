import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../auth';
import { UnauthorizedError } from '../errors';
import { getUserFriendlyMessage } from '../errors/user-friendly-messages';

export interface UserPayload {
  userId: string;
  email: string;
  role?: string;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: UserPayload;
}

/**
 * Base route context type for Next.js App Router handlers
 */
export interface RouteContext<T = Record<string, string>> {
  params: Promise<T>;
}

/**
 * Extended request type with user property for internal use
 */
interface RequestWithUser extends NextRequest {
  user?: UserPayload;
}

// Store user data in a WeakMap since NextRequest is immutable
const requestUserMap = new WeakMap<NextRequest, UserPayload>();

export const getRequestUser = (request: NextRequest): UserPayload | undefined => {
  return requestUserMap.get(request);
};

export const withAuth = async (request: NextRequest): Promise<AuthenticatedRequest> => {
  // Try to get token from Authorization header first, then from cookie
  let token: string | undefined;
  let tokenSource: string = 'none';
  const authHeader = request.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
    tokenSource = 'header';
  } else {
    token = request.cookies.get('auth-token')?.value;
    tokenSource = token ? 'cookie' : 'none';
  }

  console.log('[withAuth] Token source:', tokenSource, '| Token exists:', !!token);

  if (!token) {
    console.log('[withAuth] No token - throwing UnauthorizedError');
    throw new UnauthorizedError('No token provided');
  }

  const payload = await verifyToken(token);
  console.log('[withAuth] Payload:', payload);

  if (!payload) {
    console.log('[withAuth] Invalid payload - throwing UnauthorizedError');
    throw new UnauthorizedError('Invalid or expired token');
  }

  // Store user info in WeakMap since NextRequest is immutable
  const userPayload: UserPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };
  requestUserMap.set(request, userPayload);

  // Also try to set on request object as fallback
  try {
    (request as RequestWithUser).user = userPayload;
  } catch {
    // Ignore if request is frozen
  }

  return request as AuthenticatedRequest;
};

/**
 * Type for API route handler functions
 * Generic type T represents the params shape (e.g., { id: string })
 */
export type ApiHandler<T = Record<string, string>> = (
  request: NextRequest,
  context: RouteContext<T>
) => Promise<NextResponse>;

/**
 * Options for withAuthHandler
 */
export interface AuthHandlerOptions {
  requireAuth?: boolean;
  allowedRoles?: string[];
}

/**
 * Higher-order function to wrap API handlers with authentication
 * @param handler - The API handler function to protect
 * @param options - Configuration options
 * @returns Protected API handler
 */
export function withAuthHandler<T = Record<string, string>>(
  handler: ApiHandler<T>,
  options: AuthHandlerOptions = {}
): ApiHandler<T> {
  // Merge with defaults - requireAuth defaults to true
  const { requireAuth = true, allowedRoles } = options;

  return async (request: NextRequest, context: RouteContext<T>): Promise<NextResponse> => {
    // Skip authentication if not required
    if (!requireAuth) {
      return handler(request, context);
    }

    try {
      // Apply authentication middleware
      const authenticatedRequest = await withAuth(request);

      // Get user from WeakMap (more reliable than property on request)
      const user = getRequestUser(request) || authenticatedRequest.user;

      if (!user) {
        console.log('[withAuthHandler] User not found after auth');
        return NextResponse.json(
          { error: getUserFriendlyMessage('Unauthorized') || 'Unauthorized' },
          { status: 401 }
        );
      }

      // Ensure user is set on the request
      (authenticatedRequest as RequestWithUser).user = user;

      // Check role-based access if roles are specified
      // SUPERADMIN always has full access - bypass role check
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.role;

        // SUPERADMIN bypasses all role restrictions
        if (userRole === 'SUPERADMIN') {
          // Allow access - skip role check
        } else if (!userRole || !allowedRoles.includes(userRole)) {
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