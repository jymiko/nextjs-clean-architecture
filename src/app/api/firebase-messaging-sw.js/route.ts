import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };

  const serviceWorkerContent = `// Firebase Cloud Messaging Service Worker
// This service worker handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase with injected config
firebase.initializeApp(${JSON.stringify(firebaseConfig, null, 2)});

const messaging = firebase.messaging();

// Service Worker Version Tracking
const SW_VERSION = '1.0.1';
console.log('[firebase-messaging-sw.js] Service Worker version:', SW_VERSION);

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  console.log('[firebase-messaging-sw.js] Handler: onBackgroundMessage, notificationId:', payload.data?.notificationId);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: payload.data || {},
    tag: payload.data?.notificationId || 'default',
    requireInteraction: payload.data?.priority === 'HIGH' || payload.data?.priority === 'URGENT',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);

  event.notification.close();

  // Get the link from notification data (relative path like '/notifications')
  const linkPath = event.notification.data?.link || '/';

  // Build full URL using service worker's origin
  const urlToOpen = new URL(linkPath, self.location.origin).href;

  console.log('[firebase-messaging-sw.js] Opening URL:', urlToOpen);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // First, try to find an existing window and navigate it
      for (const client of clientList) {
        if ('focus' in client && 'navigate' in client) {
          // Focus existing window and navigate to the link
          return client.focus().then(() => client.navigate(urlToOpen));
        }
      }

      // If no existing window, try to focus any window
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }

      // Last resort: open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push event (fallback for browsers that don't support onBackgroundMessage)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[firebase-messaging-sw.js] Handler: push event, notificationId:', data.data?.notificationId);
      const notification = data.notification || {};

      const notificationTitle = notification.title || 'New Notification';
      const notificationOptions = {
        body: notification.body || '',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: data.data || {},
        tag: data.data?.notificationId || 'default', // ADDED: Deduplication
        requireInteraction: data.data?.priority === 'HIGH' || data.data?.priority === 'URGENT', // ADDED
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    } catch (e) {
      console.error('[firebase-messaging-sw.js] Error parsing push data:', e);
    }
  }
});
`;

  return new NextResponse(serviceWorkerContent, {
    headers: {
      'Content-Type': 'application/javascript',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
