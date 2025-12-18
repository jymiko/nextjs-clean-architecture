// Firebase Admin SDK for server-side push notifications
// npm install firebase-admin

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface SendResult {
  success: number;
  failure: number;
  failedTokens?: string[];
}

export interface IFirebaseFcmService {
  sendToToken(token: string, payload: PushNotificationPayload): Promise<boolean>;
  sendToTokens(tokens: string[], payload: PushNotificationPayload): Promise<SendResult>;
  sendToTopic(topic: string, payload: PushNotificationPayload): Promise<boolean>;
  isConfigured(): boolean;
}

export class FirebaseFcmService implements IFirebaseFcmService {
  private admin: typeof import('firebase-admin') | null = null;
  private app: import('firebase-admin').app.App | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Start initialization but store the promise so we can await it later
    this.initPromise = this.initializeFirebase();
  }

  private async initializeFirebase(): Promise<void> {
    try {
      // Dynamic import to avoid issues if firebase-admin is not installed
      const firebaseAdmin = await import('firebase-admin');
      this.admin = firebaseAdmin.default || firebaseAdmin;

      if (this.admin.apps.length === 0) {
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (!serviceAccountKey) {
          console.warn('[FirebaseFcmService] FIREBASE_SERVICE_ACCOUNT_KEY not configured. Push notifications will be disabled.');
          return;
        }

        try {
          // Try to parse the service account key
          // It can be either raw JSON or Base64 encoded JSON
          let serviceAccount: Record<string, unknown>;

          // Check if it looks like Base64 (doesn't start with '{')
          const trimmedKey = serviceAccountKey.trim();
          if (!trimmedKey.startsWith('{')) {
            // Try to decode from Base64
            try {
              const decoded = Buffer.from(trimmedKey, 'base64').toString('utf-8');
              serviceAccount = JSON.parse(decoded);
              console.log('[FirebaseFcmService] Decoded service account key from Base64');
            } catch (base64Error) {
              console.error('[FirebaseFcmService] Failed to decode Base64 service account key:', base64Error);
              return;
            }
          } else {
            // Parse as raw JSON
            serviceAccount = JSON.parse(trimmedKey);
          }

          // Validate required fields
          if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
            console.error('[FirebaseFcmService] Service account key missing required fields (project_id, private_key, client_email)');
            return;
          }

          this.app = this.admin.initializeApp({
            credential: this.admin.credential.cert(serviceAccount as import('firebase-admin').ServiceAccount),
          });
          this.initialized = true;
          console.log(`[FirebaseFcmService] Firebase Admin SDK initialized successfully for project: ${serviceAccount.project_id}`);
        } catch (parseError) {
          console.error('[FirebaseFcmService] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError);
        }
      } else {
        this.app = this.admin.apps[0];
        this.initialized = true;
        console.log('[FirebaseFcmService] Using existing Firebase Admin SDK instance');
      }
    } catch (error) {
      console.warn('[FirebaseFcmService] firebase-admin not installed. Push notifications will be disabled.', error);
    }
  }

  /**
   * Ensure Firebase is initialized before performing operations
   */
  private async ensureInitialized(): Promise<boolean> {
    if (this.initPromise) {
      await this.initPromise;
    }
    return this.initialized && this.admin !== null && this.app !== null;
  }

  isConfigured(): boolean {
    return this.initialized && this.admin !== null && this.app !== null;
  }

  async sendToToken(token: string, payload: PushNotificationPayload): Promise<boolean> {
    // Wait for initialization to complete before checking if configured
    const isReady = await this.ensureInitialized();
    if (!isReady || !this.admin) {
      console.warn('[FirebaseFcmService] Firebase not configured. Skipping push notification.');
      return false;
    }

    try {
      // Build absolute URL for the link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const linkPath = payload.data?.link || '/';
      const absoluteLink = linkPath.startsWith('http') ? linkPath : `${baseUrl}${linkPath}`;

      await this.admin.messaging().send({
        token,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: {
          ...payload.data,
          link: absoluteLink, // Use absolute URL in data
        },
        webpush: {
          fcmOptions: {
            link: absoluteLink, // Use absolute URL for web push
          },
          notification: {
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
          },
        },
        android: {
          notification: {
            icon: 'notification_icon',
            color: '#4db1d4',
            clickAction: absoluteLink, // Add click action for Android
          },
        },
      });
      console.log(`[FirebaseFcmService] Push notification sent successfully to token: ${token.substring(0, 20)}...`);
      return true;
    } catch (error) {
      console.error('[FirebaseFcmService] Failed to send push notification:', error);
      return false;
    }
  }

  async sendToTokens(tokens: string[], payload: PushNotificationPayload): Promise<SendResult> {
    if (tokens.length === 0) {
      return { success: 0, failure: 0 };
    }

    // Wait for initialization to complete before checking if configured
    const isReady = await this.ensureInitialized();
    if (!isReady || !this.admin) {
      console.warn('[FirebaseFcmService] Firebase not configured. Skipping multicast push notification.');
      return { success: 0, failure: tokens.length };
    }

    try {
      // Build absolute URL for the link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const linkPath = payload.data?.link || '/';
      const absoluteLink = linkPath.startsWith('http') ? linkPath : `${baseUrl}${linkPath}`;

      const response = await this.admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: {
          ...payload.data,
          link: absoluteLink, // Use absolute URL in data
        },
        webpush: {
          fcmOptions: {
            link: absoluteLink, // Use absolute URL for web push
          },
          notification: {
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
          },
        },
      });

      // Collect failed tokens for potential cleanup
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          console.warn(`[FirebaseFcmService] Failed to send to token ${tokens[idx].substring(0, 20)}...:`, resp.error?.message);
        }
      });

      console.log(`[FirebaseFcmService] Multicast result: ${response.successCount} success, ${response.failureCount} failure`);

      return {
        success: response.successCount,
        failure: response.failureCount,
        failedTokens: failedTokens.length > 0 ? failedTokens : undefined,
      };
    } catch (error) {
      console.error('[FirebaseFcmService] Failed to send multicast push notification:', error);
      return { success: 0, failure: tokens.length };
    }
  }

  async sendToTopic(topic: string, payload: PushNotificationPayload): Promise<boolean> {
    // Wait for initialization to complete before checking if configured
    const isReady = await this.ensureInitialized();
    if (!isReady || !this.admin) {
      console.warn('[FirebaseFcmService] Firebase not configured. Skipping topic notification.');
      return false;
    }

    try {
      await this.admin.messaging().send({
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data,
      });
      console.log(`[FirebaseFcmService] Topic notification sent successfully to: ${topic}`);
      return true;
    } catch (error) {
      console.error('[FirebaseFcmService] Failed to send topic notification:', error);
      return false;
    }
  }
}
