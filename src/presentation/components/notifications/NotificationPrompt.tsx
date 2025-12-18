"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useUserPreferences } from "@/hooks/use-user-preferences";

const PROMPT_DISMISSED_KEY = "notification_prompt_dismissed";
const PROMPT_DELAY_MS = 3000; // Show prompt after 3 seconds

interface NotificationPromptProps {
  /**
   * If true, will auto-request permission without showing prompt UI
   * Useful for PWA installs where user already expects notifications
   */
  autoRequest?: boolean;
}

/**
 * NotificationPrompt - Auto-prompts users to enable push notifications
 *
 * This component should be placed in the main layout (e.g., DashboardHeader or Layout)
 * It will:
 * 1. Check if user has already dismissed the prompt
 * 2. Check if push notifications are already enabled
 * 3. Show a banner prompting user to enable notifications
 * 4. Auto-register FCM token when permission is granted
 */
export function NotificationPrompt({ autoRequest = false }: NotificationPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const {
    isSupported,
    permission,
    token,
    isLoading: isPushLoading,
    requestPermission,
  } = usePushNotifications();

  const { preferences, updatePreferences } = useUserPreferences();

  // Check if we should show the prompt
  useEffect(() => {
    if (isPushLoading) return;

    // Don't show if not supported
    if (!isSupported) return;

    // Don't show if already granted
    if (permission === "granted" && token) return;

    // Don't show if already denied (user made a choice)
    if (permission === "denied") return;

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) return;
    }

    // Auto-request mode
    if (autoRequest && permission === "default") {
      handleEnableNotifications();
      return;
    }

    // Show prompt after delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, PROMPT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isSupported, permission, token, isPushLoading, autoRequest]);

  const handleEnableNotifications = useCallback(async () => {
    setIsRequesting(true);

    try {
      const granted = await requestPermission();

      if (granted) {
        // Also update user preferences to enable push notifications
        if (preferences && !preferences.notifyPush) {
          await updatePreferences({ notifyPush: true });
        }
        setShowPrompt(false);
      }
    } catch (error) {
      console.error("[NotificationPrompt] Error requesting permission:", error);
    } finally {
      setIsRequesting(false);
    }
  }, [requestPermission, preferences, updatePreferences]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, new Date().toISOString());
    setShowPrompt(false);
  }, []);

  // Don't render anything if we shouldn't show the prompt
  if (!showPrompt || isPushLoading) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Bell className="size-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900">
              Aktifkan Notifikasi
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              Dapatkan notifikasi langsung saat ada dokumen yang perlu Anda review atau approve.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleEnableNotifications}
                disabled={isRequesting}
                className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                {isRequesting ? "Mengaktifkan..." : "Aktifkan"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                disabled={isRequesting}
                className="h-8 px-3 text-gray-500 hover:text-gray-700 text-xs"
              >
                Nanti Saja
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manually trigger notification prompt
 * Useful for triggering from other components (e.g., after completing onboarding)
 */
export function useNotificationPrompt() {
  const resetPrompt = useCallback(() => {
    localStorage.removeItem(PROMPT_DISMISSED_KEY);
  }, []);

  return { resetPrompt };
}
