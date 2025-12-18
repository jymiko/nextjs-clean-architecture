'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCurrentUser } from './use-current-user';
import { getPusherManager, NotificationData } from '@/lib/pusher-client';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  priority?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

interface NotificationsApiResponse {
  success: boolean;
  data: {
    notifications: NotificationItem[];
    pagination: NotificationPagination;
    unreadCount: number;
  };
}

export interface UseNotificationListOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface UseNotificationListReturn {
  notifications: NotificationItem[];
  pagination: NotificationPagination;
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<number>;
  refetch: () => Promise<void>;
}

export function useNotificationList(
  options: UseNotificationListOptions = {}
): UseNotificationListReturn {
  const { page = 1, limit = 10, unreadOnly = false } = options;
  const { user } = useCurrentUser();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pagination, setPagination] = useState<NotificationPagination>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        unreadOnly: String(unreadOnly),
      });

      const response = await fetch(`/api/notifications?${params}`, {
        credentials: 'include',
        signal: abortControllerRef.current.signal,
      });

      if (response.ok) {
        const data: NotificationsApiResponse = await response.json();
        if (data.success) {
          setNotifications(data.data.notifications);
          setPagination(data.data.pagination);
          setUnreadCount(data.data.unreadCount);
        }
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      console.error('[useNotificationList] Failed to fetch:', err);
      setError('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user, page, limit, unreadOnly]);

  // Initial fetch and refetch when options change
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setPagination({
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0,
        hasMore: false,
      });
      setUnreadCount(0);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, page, limit, unreadOnly, fetchNotifications]);

  // Use centralized PusherManager for real-time updates
  useEffect(() => {
    if (!user) {
      // Cleanup if no user
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const setupPusher = async () => {
      try {
        const pusherManager = getPusherManager();

        // Register connection status listener
        const unsubscribeConnection = pusherManager.onConnectionChange((connected) => {
          setIsConnected(connected);
        });

        // Subscribe with unique callback ID for this hook
        const unsubscribeNotification = await pusherManager.subscribe(
          user.id,
          'notification-list-hook',
          (data: NotificationData) => {
            console.log('[useNotificationList] 📬 Received via PusherManager:', data);

            // Add new notification to the top of the list
            setNotifications((prev) => {
              // Check if notification already exists
              if (prev.some((n) => n.id === data.id)) {
                return prev;
              }

              // If we're on page 1, prepend the new notification
              if (page === 1) {
                const newList = [{ ...data, isRead: false }, ...prev];
                // Keep the list within limit
                return newList.slice(0, limit);
              }

              return prev;
            });

            // Update total count
            setPagination((prev) => ({
              ...prev,
              totalCount: prev.totalCount + 1,
              totalPages: Math.ceil((prev.totalCount + 1) / prev.limit),
            }));

            // Increment unread count
            setUnreadCount((prev) => prev + 1);
          }
        );

        // Store cleanup function
        unsubscribeRef.current = () => {
          unsubscribeConnection();
          unsubscribeNotification();
        };
      } catch (err) {
        console.error('[useNotificationList] Setup error:', err);
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
  }, [user, page, limit]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();

        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
          )
        );

        // Update unread count from server
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

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<number> => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();

        // Update local state - mark all as read
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
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

  // Refetch notifications
  const refetch = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    pagination,
    unreadCount,
    isLoading,
    isConnected,
    error,
    markAsRead,
    markAllAsRead,
    refetch,
  };
}
