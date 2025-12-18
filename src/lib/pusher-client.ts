'use client';

import type PusherJS from 'pusher-js';
import type { Channel } from 'pusher-js';

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  priority?: string;
  isRead?: boolean;
  createdAt: Date;
}

type NotificationCallback = (data: NotificationData) => void;

interface CallbackEntry {
  id: string;
  callback: NotificationCallback;
}

/**
 * Singleton Pusher Manager
 *
 * Manages a single Pusher connection per user session.
 * Multiple hooks can register callbacks without creating duplicate subscriptions.
 * Each notification event is broadcasted to all registered callbacks once.
 */
class PusherManager {
  private static instance: PusherManager | null = null;

  private pusher: PusherJS | null = null;
  private channel: Channel | null = null;
  private currentUserId: string | null = null;
  private callbacks: CallbackEntry[] = [];
  private isConnected = false;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): PusherManager {
    if (!PusherManager.instance) {
      PusherManager.instance = new PusherManager();
    }
    return PusherManager.instance;
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Register a callback for connection status changes
   */
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.add(callback);
    // Immediately call with current status
    callback(this.isConnected);

    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach((cb) => cb(connected));
  }

  /**
   * Load Pusher library from CDN
   */
  private async loadPusher(): Promise<typeof import('pusher-js').default> {
    if (typeof window === 'undefined') {
      throw new Error('Pusher can only be loaded in browser environment');
    }

    // Check if already loaded
    const windowWithPusher = window as unknown as { Pusher?: typeof import('pusher-js').default };
    if (windowWithPusher.Pusher) {
      return windowWithPusher.Pusher;
    }

    // Load from CDN
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.pusher.com/8.2.0/pusher.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Pusher'));
      document.head.appendChild(script);
    });

    return (window as unknown as { Pusher: typeof import('pusher-js').default }).Pusher;
  }

  /**
   * Initialize Pusher connection for a user
   */
  private async initializePusher(userId: string): Promise<void> {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      console.warn('[PusherManager] Pusher not configured (missing env vars)');
      return;
    }

    try {
      const PusherClient = await this.loadPusher();

      // Enable debug logging
      PusherClient.logToConsole = true;

      // Create single Pusher instance
      this.pusher = new PusherClient(key, {
        cluster,
        authEndpoint: '/api/pusher/auth',
      });

      // Subscribe to user's private channel
      const channelName = `private-user-${userId}`;
      this.channel = this.pusher.subscribe(channelName);

      // Handle notification event - broadcast to all registered callbacks
      this.channel.bind('notification', (data: NotificationData) => {
        console.log('[PusherManager] Received notification:', data);
        console.log('[PusherManager] Broadcasting to', this.callbacks.length, 'callback(s)');

        // Call all registered callbacks
        this.callbacks.forEach((entry) => {
          try {
            entry.callback(data);
          } catch (err) {
            console.error(`[PusherManager] Callback ${entry.id} error:`, err);
          }
        });
      });

      // Connection handlers
      this.pusher.connection.bind('connected', () => {
        console.log('[PusherManager] Connected to Pusher');
        this.isConnected = true;
        this.notifyConnectionChange(true);
      });

      this.pusher.connection.bind('disconnected', () => {
        console.log('[PusherManager] Disconnected from Pusher');
        this.isConnected = false;
        this.notifyConnectionChange(false);
      });

      this.pusher.connection.bind('error', (err: Error) => {
        console.error('[PusherManager] Connection error:', err);
        this.isConnected = false;
        this.notifyConnectionChange(false);
      });

      // Channel subscription handlers
      this.channel.bind('pusher:subscription_succeeded', () => {
        console.log('[PusherManager] Subscribed to', channelName);
      });

      this.channel.bind('pusher:subscription_error', (status: { status: number }) => {
        console.error('[PusherManager] Subscription error:', status);
      });

      this.currentUserId = userId;
    } catch (err) {
      console.error('[PusherManager] Initialization error:', err);
      throw err;
    }
  }

  /**
   * Subscribe to notifications for a user
   * @param userId - The user's ID
   * @param callbackId - Unique identifier for this callback (e.g., 'realtime-hook', 'list-hook')
   * @param callback - Function to call when notification is received
   * @returns Unsubscribe function
   */
  async subscribe(
    userId: string,
    callbackId: string,
    callback: NotificationCallback
  ): Promise<() => void> {
    // Check if already have a callback with this ID
    const existingIndex = this.callbacks.findIndex((c) => c.id === callbackId);
    if (existingIndex !== -1) {
      // Update existing callback
      this.callbacks[existingIndex].callback = callback;
      console.log(`[PusherManager] Updated callback: ${callbackId}`);
    } else {
      // Add new callback
      this.callbacks.push({ id: callbackId, callback });
      console.log(`[PusherManager] Registered callback: ${callbackId} (total: ${this.callbacks.length})`);
    }

    // Initialize or reinitialize if user changed
    if (this.currentUserId !== userId) {
      // Disconnect existing connection if any
      if (this.pusher) {
        this.disconnect();
      }

      // Wait for any ongoing initialization
      if (this.isInitializing && this.initPromise) {
        await this.initPromise;
      }

      // Start initialization
      if (!this.isInitializing) {
        this.isInitializing = true;
        this.initPromise = this.initializePusher(userId).finally(() => {
          this.isInitializing = false;
        });
        await this.initPromise;
      }
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(callbackId);
    };
  }

  /**
   * Unsubscribe a specific callback
   */
  unsubscribe(callbackId: string): void {
    const index = this.callbacks.findIndex((c) => c.id === callbackId);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
      console.log(`[PusherManager] Unregistered callback: ${callbackId} (remaining: ${this.callbacks.length})`);
    }

    // If no more callbacks, disconnect
    if (this.callbacks.length === 0) {
      console.log('[PusherManager] No more callbacks, disconnecting...');
      this.disconnect();
    }
  }

  /**
   * Disconnect from Pusher entirely
   */
  disconnect(): void {
    if (this.channel && this.pusher && this.currentUserId) {
      this.pusher.unsubscribe(`private-user-${this.currentUserId}`);
    }
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }
    this.channel = null;
    this.currentUserId = null;
    this.isConnected = false;
    this.notifyConnectionChange(false);
    console.log('[PusherManager] Disconnected');
  }

  /**
   * Force disconnect for user logout
   */
  logout(): void {
    this.callbacks = [];
    this.disconnect();
  }
}

// Export singleton instance getter
export const getPusherManager = (): PusherManager => PusherManager.getInstance();
