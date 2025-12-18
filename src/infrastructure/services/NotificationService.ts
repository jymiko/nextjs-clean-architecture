import { prisma } from '../database';
import { IFirebaseFcmService, PushNotificationPayload } from './FirebaseFcmService';
import { IPusherService, RealtimeNotification } from './PusherService';
import { IUserPreferenceRepository } from '@/domain/repositories/IUserPreferenceRepository';
import { NotificationType, Priority } from '@prisma/client';
import {
  NotificationMessageKey,
  MessageParams,
  SupportedLanguage,
  getLocalizedNotification,
  normalizeLanguage,
  getMessageKeyByLevel,
  getRoleLabelByLevel,
} from './notification-messages';

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  priority?: Priority;
}

export interface INotificationService {
  sendNotification(payload: NotificationPayload): Promise<string>; // Returns notification ID
  sendBulkNotification(userIds: string[], payload: Omit<NotificationPayload, 'userId'>): Promise<void>;
  markAsRead(notificationId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<number>;
  getUnreadCount(userId: string): Promise<number>;
  // Helper methods for document workflow notifications
  getUserLanguage(userId: string): Promise<SupportedLanguage>;
  shouldNotifyForApproval(userId: string): Promise<boolean>;
  getLocalizedMessage(
    userId: string,
    messageKey: NotificationMessageKey,
    params: MessageParams
  ): Promise<{ title: string; message: string }>;
  sendLocalizedNotification(
    userId: string,
    type: NotificationType,
    messageKey: NotificationMessageKey,
    params: MessageParams,
    link?: string,
    priority?: Priority
  ): Promise<string | null>;
}

export class NotificationService implements INotificationService {
  constructor(
    private readonly userPreferenceRepository: IUserPreferenceRepository,
    private readonly fcmService: IFirebaseFcmService,
    private readonly pusherService: IPusherService
  ) {}

  async sendNotification(payload: NotificationPayload): Promise<string> {
    const { userId, type, title, message, link, priority = 'MEDIUM' } = payload;

    // Deduplication: Check if similar notification was sent recently (within 5 seconds)
    const deduplicationWindow = 5000; // 5 seconds
    const recentDuplicate = await prisma.notification.findFirst({
      where: {
        userId,
        type,
        title,
        createdAt: {
          gte: new Date(Date.now() - deduplicationWindow),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (recentDuplicate) {
      console.log(
        `[NotificationService] Skipping duplicate notification for user ${userId}: "${title}" (sent ${Date.now() - recentDuplicate.createdAt.getTime()}ms ago)`
      );
      return recentDuplicate.id; // Return existing notification ID
    }

    // Get user preferences
    const preferences = await this.userPreferenceRepository.findByUserId(userId);

    // Create database notification record
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        priority,
      },
    });

    // Check if user wants in-app notifications
    const shouldSendInApp = !preferences || preferences.notifyInApp;

    // Send real-time in-app notification via Pusher
    if (shouldSendInApp && this.pusherService.isConfigured()) {
      const realtimeNotification: RealtimeNotification = {
        id: notification.id,
        type,
        title,
        message,
        link: link || undefined,
        priority,
        createdAt: notification.createdAt,
      };

      await this.pusherService.triggerUserNotification(userId, realtimeNotification);
    }

    // Check if user wants push notifications
    const shouldSendPush = preferences?.notifyPush;

    // Send push notification via FCM
    // Note: sendToTokens() handles initialization check internally, so we don't need to check isConfigured() here
    if (shouldSendPush) {
      const fcmTokens = await this.userPreferenceRepository.getFcmTokensByUserId(userId);

      if (fcmTokens.length > 0) {
        const pushPayload: PushNotificationPayload = {
          title,
          body: message,
          data: {
            notificationId: notification.id,
            type,
            link: link || '',
          },
        };

        console.log(`[NotificationService] Sending push notification to ${fcmTokens.length} device(s) for user ${userId}`);

        const result = await this.fcmService.sendToTokens(
          fcmTokens.map((t) => t.token),
          pushPayload
        );

        console.log(`[NotificationService] Push result: ${result.success} success, ${result.failure} failure`);

        // Deactivate failed tokens
        if (result.failedTokens && result.failedTokens.length > 0) {
          console.log(`[NotificationService] Deactivating ${result.failedTokens.length} failed token(s)`);
          for (const failedToken of result.failedTokens) {
            await this.userPreferenceRepository.deactivateFcmToken(failedToken);
          }
        }
      } else {
        console.log(`[NotificationService] No FCM tokens found for user ${userId}, skipping push notification`);
      }
    }

    return notification.id;
  }

  async sendBulkNotification(
    userIds: string[],
    payload: Omit<NotificationPayload, 'userId'>
  ): Promise<void> {
    // Process in batches for better performance
    const batchSize = 50;

    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      await Promise.all(
        batch.map((userId) => this.sendNotification({ ...payload, userId }))
      );
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Get user's preferred language from their preferences
   */
  async getUserLanguage(userId: string): Promise<SupportedLanguage> {
    const preferences = await this.userPreferenceRepository.findByUserId(userId);
    return normalizeLanguage(preferences?.language);
  }

  /**
   * Check if user should receive approval-related notifications
   */
  async shouldNotifyForApproval(userId: string): Promise<boolean> {
    const preferences = await this.userPreferenceRepository.findByUserId(userId);
    // Default to true if preferences don't exist or notifyApproval is not set
    return !preferences || preferences.notifyApproval !== false;
  }

  /**
   * Get localized notification message based on user's language preference
   */
  async getLocalizedMessage(
    userId: string,
    messageKey: NotificationMessageKey,
    params: MessageParams
  ): Promise<{ title: string; message: string }> {
    const language = await this.getUserLanguage(userId);
    return getLocalizedNotification(messageKey, language, params);
  }

  /**
   * Send notification with localized message, respecting user preferences
   * Returns notification ID if sent, null if user opted out
   */
  async sendLocalizedNotification(
    userId: string,
    type: NotificationType,
    messageKey: NotificationMessageKey,
    params: MessageParams,
    link?: string,
    priority: Priority = 'HIGH'
  ): Promise<string | null> {
    // Check if user wants approval notifications
    const shouldNotify = await this.shouldNotifyForApproval(userId);
    if (!shouldNotify) {
      console.log(`[NotificationService] User ${userId} opted out of approval notifications`);
      return null;
    }

    // Get localized message
    const { title, message } = await this.getLocalizedMessage(userId, messageKey, params);

    // Send notification
    return this.sendNotification({
      userId,
      type,
      title,
      message,
      link,
      priority,
    });
  }
}

// Re-export types from notification-messages for convenience
export type { NotificationMessageKey, MessageParams, SupportedLanguage };
export { getMessageKeyByLevel, getRoleLabelByLevel };
