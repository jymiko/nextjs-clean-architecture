'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCurrentUser } from './use-current-user';
import { getPusherManager, NotificationData } from '@/lib/pusher-client';

export interface RealtimeNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  priority?: string;
  isRead?: boolean;
  createdAt: Date;
}

interface NotificationsApiResponse {
  success: boolean;
  data: {
    notifications: RealtimeNotification[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasMore: boolean;
    };
    unreadCount: number;
  };
}

interface UseRealtimeNotificationsResult {
  notifications: RealtimeNotification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<number>;
  clearNotifications: () => void;
  removeNotification: (notificationId: string) => void;
  refreshNotifications: () => Promise<void>;
}

export function useRealtimeNotifications(): UseRealtimeNotificationsResult {
  const { user } = useCurrentUser();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications?limit=50&unreadOnly=false', {
        credentials: 'include',
      });

      if (response.ok) {
        const data: NotificationsApiResponse = await response.json();
        if (data.success) {
          setNotifications(data.data.notifications);
          setUnreadCount(data.data.unreadCount);
        }
      }
    } catch (err) {
      console.error('[useRealtimeNotifications] Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch when user is available
  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchNotifications();
    }

    if (!user) {
      hasFetchedRef.current = false;
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  // Use centralized PusherManager for notifications
  useEffect(() => {
    if (!user) {
      // Cleanup if user logs out
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      getPusherManager().logout();
      setIsConnected(false);
      return;
    }

    const setupPusher = async () => {
      try {
        const pusherManager = getPusherManager();

        // Register connection status listener
        const unsubscribeConnection = pusherManager.onConnectionChange((connected) => {
          setIsConnected(connected);
          if (connected) {
            setError(null);
          }
        });

        // Subscribe with unique callback ID for this hook
        const unsubscribeNotification = await pusherManager.subscribe(
          user.id,
          'realtime-notifications-hook',
          (data: NotificationData) => {
            console.log('[useRealtimeNotifications] 📬 Received via PusherManager:', data);
            setNotifications((prev) => {
              if (prev.some((n) => n.id === data.id)) {
                return prev;
              }
              return [{ ...data, isRead: false }, ...prev].slice(0, 50);
            });
            setUnreadCount((prev) => prev + 1);
          }
        );

        // Store cleanup function
        unsubscribeRef.current = () => {
          unsubscribeConnection();
          unsubscribeNotification();
        };
      } catch (err) {
        console.error('[useRealtimeNotifications] Setup error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize real-time notifications');
      }
    };

    setupPusher();

    // Cleanup on unmount or user change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Mark as read in local state (don't remove, just update)
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        // Update unread count from server response
        if (typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        } else {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async (): Promise<number> => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Mark all as read in local state
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        // Set unread count to 0
        setUnreadCount(0);
        return data.count || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === notificationId);
      // If removing an unread notification, decrement count
      if (notification && !notification.isRead) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== notificationId);
    });
  }, []);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
    refreshNotifications,
  };
}
