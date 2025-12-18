import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { handleError, UnauthorizedError } from '@/infrastructure/errors';
import { withAuth } from '@/infrastructure/middleware';

/**
 * POST /api/pusher/auth
 * Authenticate Pusher private channel subscriptions
 * This endpoint is called by Pusher client when subscribing to private channels
 */
export async function POST(request: NextRequest) {
  try {
    // Clone the request to read body multiple times if needed
    const clonedRequest = request.clone();

    let authenticatedRequest;
    try {
      authenticatedRequest = await withAuth(request);
    } catch (error) {
      console.error('[Pusher Auth] Authentication failed:', error);
      if (error instanceof UnauthorizedError) {
        return NextResponse.json(
          { error: 'Unauthorized: ' + error.message },
          { status: 401 }
        );
      }
      throw error;
    }

    if (!authenticatedRequest.user) {
      console.error('[Pusher Auth] No user in authenticated request');
      return NextResponse.json(
        { error: 'Unauthorized: No user found' },
        { status: 401 }
      );
    }

    // Parse form data (Pusher sends data as form-urlencoded)
    const formData = await clonedRequest.formData();
    const socketId = formData.get('socket_id') as string;
    const channelName = formData.get('channel_name') as string;

    console.log('[Pusher Auth] Request:', {
      socketId,
      channelName,
      userId: authenticatedRequest.user.userId,
    });

    if (!socketId || !channelName) {
      console.error('[Pusher Auth] Missing socket_id or channel_name');
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Validate that user can only subscribe to their own private channel
    if (channelName.startsWith('private-user-')) {
      const channelUserId = channelName.replace('private-user-', '');
      console.log('[Pusher Auth] Channel validation:', {
        channelUserId,
        authenticatedUserId: authenticatedRequest.user.userId,
        match: channelUserId === authenticatedRequest.user.userId,
      });

      if (channelUserId !== authenticatedRequest.user.userId) {
        console.error('[Pusher Auth] User ID mismatch - forbidden');
        return NextResponse.json(
          { error: 'Forbidden: Cannot subscribe to other user channels' },
          { status: 403 }
        );
      }
    }

    const pusherService = container.cradle.pusherService;

    if (!pusherService.isConfigured()) {
      console.error('[Pusher Auth] Pusher service not configured');
      return NextResponse.json(
        { error: 'Pusher is not configured' },
        { status: 503 }
      );
    }

    try {
      const authResponse = pusherService.authorizeChannel(socketId, channelName);
      console.log('[Pusher Auth] Authorization successful for channel:', channelName);
      return NextResponse.json(authResponse);
    } catch (authError) {
      console.error('[Pusher Auth] Authorization failed:', authError);
      return NextResponse.json(
        { error: 'Channel authorization failed' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('[Pusher Auth] Unexpected error:', error);
    return handleError(error, request);
  }
}
