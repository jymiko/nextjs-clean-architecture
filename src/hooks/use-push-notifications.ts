'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePushNotificationsResult {
  isSupported: boolean;
  permission: NotificationPermission | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  registerToken: (token: string) => Promise<boolean>;
  unregisterToken: (token: string) => Promise<boolean>;
}

// Register the Firebase messaging service worker
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    // Check if already registered
    const existingRegistrations = await navigator.serviceWorker.getRegistrations();
    const existingFcmSw = existingRegistrations.find(
      (reg) => reg.active?.scriptURL.includes('firebase-messaging-sw.js')
    );

    if (existingFcmSw) {
      console.log('[usePushNotifications] Existing FCM service worker found:', existingFcmSw.active?.scriptURL);

      // Check for multiple service workers
      const allServiceWorkers = existingRegistrations.filter(reg => reg.active);
      if (allServiceWorkers.length > 1) {
        console.warn('[usePushNotifications] WARNING: Multiple service workers detected:', allServiceWorkers.length);
        console.warn('[usePushNotifications] This may cause duplicate notifications.');
      }

      return existingFcmSw;
    }

    // Register the service worker from the API route that injects Firebase config
    const registration = await navigator.serviceWorker.register(
      '/api/firebase-messaging-sw.js',
      { scope: '/' }
    );

    // Wait for the service worker to become active
    if (registration.installing) {
      await new Promise<void>((resolve) => {
        registration.installing!.addEventListener('statechange', (e) => {
          if ((e.target as ServiceWorker).state === 'activated') {
            resolve();
          }
        });
      });
    } else if (registration.waiting) {
      await new Promise<void>((resolve) => {
        registration.waiting!.addEventListener('statechange', (e) => {
          if ((e.target as ServiceWorker).state === 'activated') {
            resolve();
          }
        });
      });
    }

    return registration;
  } catch (err) {
    console.error('[usePushNotifications] Service worker registration failed:', err);
    return null;
  }
}

export function usePushNotifications(): UsePushNotificationsResult {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializingRef = useRef(false);
  const messagingRef = useRef<ReturnType<typeof import('firebase/messaging').getMessaging> | null>(null);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Initialize Firebase and check support
  useEffect(() => {
    const init = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;

      try {
        // Check browser support with detailed logging
        const hasNotification = 'Notification' in window;
        const hasServiceWorker = 'serviceWorker' in navigator;
        const isSecureContext = window.isSecureContext;

        console.log('[usePushNotifications] Support check:', {
          hasNotification,
          hasServiceWorker,
          isSecureContext,
          protocol: window.location.protocol,
          hostname: window.location.hostname,
        });

        // Push notifications require secure context (HTTPS or localhost)
        if (!isSecureContext) {
          console.warn('[usePushNotifications] Not a secure context. Push notifications require HTTPS.');
          setError('Push notifications require HTTPS connection');
          setIsSupported(false);
          setIsLoading(false);
          return;
        }

        const supported = hasNotification && hasServiceWorker;
        setIsSupported(supported);

        if (!supported) {
          const reason = !hasNotification
            ? 'Notification API not available'
            : 'Service Worker not supported';
          console.warn(`[usePushNotifications] ${reason}`);
          setError(reason);
          setIsLoading(false);
          return;
        }

        // Set current permission state
        setPermission(Notification.permission);

        // Check if Firebase config is available
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        if (!apiKey) {
          console.warn('[usePushNotifications] Firebase not configured');
          setIsLoading(false);
          return;
        }

        // Register service worker first
        const swRegistration = await registerServiceWorker();
        swRegistrationRef.current = swRegistration;

        // Dynamic import Firebase
        const { initializeApp, getApps } = await import('firebase/app');
        const { getMessaging, getToken: getFcmToken, onMessage } = await import('firebase/messaging');

        // Initialize Firebase if not already
        if (getApps().length === 0) {
          initializeApp({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          });
        }

        // Get messaging instance
        const messaging = getMessaging();
        messagingRef.current = messaging;

        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          console.log('[usePushNotifications] Foreground message:', payload);

          // Show browser notification for foreground messages
          if (payload.notification && Notification.permission === 'granted') {
            new Notification(payload.notification.title || 'New Notification', {
              body: payload.notification.body,
              icon: '/icon-192x192.png',
              tag: payload.data?.notificationId || 'foreground-default',
              requireInteraction: payload.data?.priority === 'HIGH' || payload.data?.priority === 'URGENT',
              data: payload.data || {},
            });
            console.log('[usePushNotifications] Foreground notification shown, notificationId:', payload.data?.notificationId);
          }
        });

        // If already granted, try to get existing token and register it
        if (Notification.permission === 'granted' && swRegistration) {
          try {
            const currentToken = await getFcmToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
              serviceWorkerRegistration: swRegistration,
            });
            if (currentToken) {
              setToken(currentToken);
              // Also register token with backend (in case it wasn't registered before)
              await registerTokenToBackend(currentToken);
              console.log('[usePushNotifications] Existing token registered with backend');
            }
          } catch (tokenError) {
            console.warn('[usePushNotifications] Could not get existing token:', tokenError);
          }
        }
      } catch (err) {
        console.error('[usePushNotifications] Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize push notifications');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications not supported in this browser');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        setError('Push notification permission denied');
        return false;
      }

      // Ensure service worker is registered
      if (!swRegistrationRef.current) {
        const swRegistration = await registerServiceWorker();
        swRegistrationRef.current = swRegistration;
      }

      if (!swRegistrationRef.current) {
        setError('Service worker registration failed');
        return false;
      }

      // Get FCM token
      if (!messagingRef.current) {
        setError('Firebase messaging not initialized');
        return false;
      }

      const { getToken: getFcmToken } = await import('firebase/messaging');
      const fcmToken = await getFcmToken(messagingRef.current, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: swRegistrationRef.current,
      });

      if (fcmToken) {
        setToken(fcmToken);

        // Register token with backend
        const registered = await registerTokenToBackend(fcmToken);
        return registered;
      }

      return false;
    } catch (err) {
      console.error('[usePushNotifications] Request permission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to request permission');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const registerTokenToBackend = async (fcmToken: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/user/fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token: fcmToken,
          platform: 'web',
          deviceName: navigator.userAgent.substring(0, 100),
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  };

  const registerToken = useCallback(async (newToken: string): Promise<boolean> => {
    const success = await registerTokenToBackend(newToken);
    if (success) {
      setToken(newToken);
    }
    return success;
  }, []);

  const unregisterToken = useCallback(async (tokenToRemove: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/user/fcm-token?token=${encodeURIComponent(tokenToRemove)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok && tokenToRemove === token) {
        setToken(null);
      }

      return response.ok;
    } catch {
      return false;
    }
  }, [token]);

  return {
    isSupported,
    permission,
    token,
    isLoading,
    error,
    requestPermission,
    registerToken,
    unregisterToken,
  };
}
