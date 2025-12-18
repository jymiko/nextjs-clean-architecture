import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { withAuth } from '@/infrastructure/middleware';

/**
 * GET /api/notifications/debug
 * Debug endpoint to check notification system configuration
 * Returns diagnostic info about Firebase, Pusher, and user notification settings
 */
export async function GET(request: NextRequest) {
  try {
    const authenticatedRequest = await withAuth(request);

    if (!authenticatedRequest.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authenticatedRequest.user.userId;
    const userPreferenceRepository = container.cradle.userPreferenceRepository;
    const fcmService = container.cradle.fcmService;
    const pusherService = container.cradle.pusherService;

    // Get user preferences
    const preferences = await userPreferenceRepository.findByUserId(userId);

    // Get FCM tokens for this user
    const fcmTokens = await userPreferenceRepository.getFcmTokensByUserId(userId);

    // Check environment variables (mask sensitive values)
    const envCheck = {
      // Firebase Client (NEXT_PUBLIC)
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      NEXT_PUBLIC_FIREBASE_VAPID_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      // Firebase Admin (Server)
      FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      FIREBASE_SERVICE_ACCOUNT_KEY_LENGTH: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0,
      // Pusher
      PUSHER_APP_ID: !!process.env.PUSHER_APP_ID,
      PUSHER_KEY: !!process.env.PUSHER_KEY,
      PUSHER_SECRET: !!process.env.PUSHER_SECRET,
      PUSHER_CLUSTER: process.env.PUSHER_CLUSTER || 'NOT SET',
      NEXT_PUBLIC_PUSHER_KEY: !!process.env.NEXT_PUBLIC_PUSHER_KEY,
    };

    // Try to parse Firebase service account to check validity
    let firebaseServiceAccountValid = false;
    let firebaseProjectId = null;
    let firebaseServiceAccountFormat: 'json' | 'base64' | 'invalid' = 'invalid';
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      try {
        let parsed;
        if (key.startsWith('{')) {
          // Raw JSON format
          parsed = JSON.parse(key);
          firebaseServiceAccountFormat = 'json';
        } else {
          // Try Base64 decode
          const decoded = Buffer.from(key, 'base64').toString('utf-8');
          parsed = JSON.parse(decoded);
          firebaseServiceAccountFormat = 'base64';
        }
        firebaseServiceAccountValid = !!(parsed.project_id && parsed.private_key && parsed.client_email);
        firebaseProjectId = parsed.project_id;
      } catch {
        firebaseServiceAccountValid = false;
        firebaseServiceAccountFormat = 'invalid';
      }
    }

    return NextResponse.json({
      success: true,
      diagnostic: {
        // Service status
        services: {
          fcmConfigured: fcmService.isConfigured(),
          pusherConfigured: pusherService.isConfigured(),
        },
        // Environment variables
        environment: envCheck,
        // Firebase service account validation
        firebaseServiceAccount: {
          isSet: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
          format: firebaseServiceAccountFormat,
          isValid: firebaseServiceAccountValid,
          projectId: firebaseProjectId,
        },
        // User preferences
        userPreferences: preferences ? {
          notifyInApp: preferences.notifyInApp,
          notifyPush: preferences.notifyPush,
          notifyEmail: preferences.notifyEmail,
          notifyApproval: preferences.notifyApproval,
          language: preferences.language,
        } : {
          exists: false,
          note: 'User preferences not found - defaults will be used',
        },
        // FCM tokens
        fcmTokens: {
          count: fcmTokens.length,
          tokens: fcmTokens.map(t => ({
            id: t.id,
            platform: t.platform,
            deviceName: t.deviceName?.substring(0, 50),
            isActive: t.isActive,
            lastUsedAt: t.lastUsedAt,
            tokenPreview: t.token.substring(0, 30) + '...',
          })),
        },
        // Recommendations
        recommendations: getRecommendations({
          fcmConfigured: fcmService.isConfigured(),
          pusherConfigured: pusherService.isConfigured(),
          hasServiceAccountKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
          serviceAccountValid: firebaseServiceAccountValid,
          userHasNotifyPush: preferences?.notifyPush ?? false,
          userHasFcmTokens: fcmTokens.length > 0,
        }),
      },
    });
  } catch (error) {
    console.error('[Notification Debug] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function getRecommendations(checks: {
  fcmConfigured: boolean;
  pusherConfigured: boolean;
  hasServiceAccountKey: boolean;
  serviceAccountValid: boolean;
  userHasNotifyPush: boolean;
  userHasFcmTokens: boolean;
}): string[] {
  const recommendations: string[] = [];

  if (!checks.hasServiceAccountKey) {
    recommendations.push('CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Push notifications will NOT work.');
  } else if (!checks.serviceAccountValid) {
    recommendations.push('CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY is set but is not valid JSON or missing required fields (project_id, private_key, client_email).');
  }

  if (!checks.fcmConfigured) {
    recommendations.push('WARNING: Firebase FCM service is not configured. Check server logs for initialization errors.');
  }

  if (!checks.pusherConfigured) {
    recommendations.push('WARNING: Pusher service is not configured. Real-time in-app notifications will not work.');
  }

  if (!checks.userHasNotifyPush) {
    recommendations.push('INFO: User has notifyPush disabled. Enable it in settings to receive push notifications.');
  }

  if (checks.userHasNotifyPush && !checks.userHasFcmTokens) {
    recommendations.push('WARNING: User has push notifications enabled but no FCM tokens registered. Make sure to grant notification permission in browser and refresh the page.');
  }

  if (recommendations.length === 0) {
    recommendations.push('OK: All notification services appear to be configured correctly.');
  }

  return recommendations;
}
