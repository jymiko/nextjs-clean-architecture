// Server-side Pusher service for real-time notifications
// npm install pusher

import Pusher from 'pusher';

export interface RealtimeNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  priority?: string;
  createdAt: Date;
}

export interface IPusherService {
  triggerUserNotification(userId: string, notification: RealtimeNotification): Promise<boolean>;
  triggerBroadcast(channel: string, event: string, data: unknown): Promise<boolean>;
  authorizeChannel(socketId: string, channelName: string): { auth: string; channel_data?: string };
  isConfigured(): boolean;
}

export class PusherService implements IPusherService {
  private pusher: Pusher | null = null;

  constructor() {
    this.initializePusher();
  }

  private initializePusher(): void {
    try {
      const appId = process.env.PUSHER_APP_ID;
      const key = process.env.PUSHER_KEY;
      const secret = process.env.PUSHER_SECRET;
      const cluster = process.env.PUSHER_CLUSTER;

      if (!appId || !key || !secret || !cluster) {
        console.warn('[PusherService] Pusher credentials not configured. Real-time notifications will be disabled.');
        console.warn('[PusherService] Missing:', {
          appId: !appId,
          key: !key,
          secret: !secret,
          cluster: !cluster,
        });
        return;
      }

      this.pusher = new Pusher({
        appId,
        key,
        secret,
        cluster,
        useTLS: true,
      });

      console.log('[PusherService] Pusher initialized successfully.');
    } catch (error) {
      console.error('[PusherService] Failed to initialize Pusher:', error);
    }
  }

  isConfigured(): boolean {
    return this.pusher !== null;
  }

  async triggerUserNotification(userId: string, notification: RealtimeNotification): Promise<boolean> {
    if (!this.isConfigured() || !this.pusher) {
      console.warn('[PusherService] Pusher not configured. Skipping real-time notification.');
      return false;
    }

    try {
      // Use private channel for user-specific notifications
      const channel = `private-user-${userId}`;
      await this.pusher.trigger(channel, 'notification', notification);
      return true;
    } catch (error) {
      console.error('[PusherService] Failed to send real-time notification:', error);
      return false;
    }
  }

  async triggerBroadcast(channel: string, event: string, data: unknown): Promise<boolean> {
    if (!this.isConfigured() || !this.pusher) {
      return false;
    }

    try {
      await this.pusher.trigger(channel, event, data);
      return true;
    } catch (error) {
      console.error('[PusherService] Failed to broadcast via Pusher:', error);
      return false;
    }
  }

  authorizeChannel(socketId: string, channelName: string): { auth: string; channel_data?: string } {
    if (!this.pusher) {
      throw new Error('Pusher not initialized');
    }

    // For private channels, use authorizeChannel
    if (channelName.startsWith('private-')) {
      return this.pusher.authorizeChannel(socketId, channelName);
    }

    // For presence channels, use authorizeChannel with user info
    if (channelName.startsWith('presence-')) {
      // Note: For presence channels, you would typically pass user_id and user_info
      // This is a basic implementation - extend as needed
      return this.pusher.authorizeChannel(socketId, channelName);
    }

    throw new Error('Invalid channel type for authorization');
  }
}
