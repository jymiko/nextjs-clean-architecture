"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, Bell, Smartphone, Mail, Clock, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { NotificationFrequency } from "@/domain/entities/UserPreference";

interface NotificationSettingItem {
  id: string;
  title: string;
  description: string;
  key: keyof NotificationSettingsState["toggles"];
  icon?: typeof Bell;
  requiresPermission?: boolean;
}

interface NotificationSettingsState {
  toggles: {
    notifyEmail: boolean;
    notifyPush: boolean;
    notifyApproval: boolean;
    notifyWeeklyDigest: boolean;
    notifyInApp: boolean;
    notifyDistribution: boolean;
    notifyExpiring: boolean;
    notifyObsolete: boolean;
  };
  frequency: NotificationFrequency;
}

const defaultSettings: NotificationSettingsState = {
  toggles: {
    notifyEmail: true,
    notifyPush: false,
    notifyApproval: true,
    notifyWeeklyDigest: true,
    notifyInApp: true,
    notifyDistribution: true,
    notifyExpiring: true,
    notifyObsolete: true,
  },
  frequency: NotificationFrequency.IMMEDIATE,
};

export function NotificationSettings() {
  const { preferences, isLoading, updatePreferences, refetch } = useUserPreferences();
  const {
    isSupported: isPushSupported,
    permission: pushPermission,
    token: pushToken,
    requestPermission,
    registerToken,
    isLoading: isPushLoading,
    error: pushError,
  } = usePushNotifications();

  const [settings, setSettings] = useState<NotificationSettingsState>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state with fetched preferences
  useEffect(() => {
    if (preferences) {
      setSettings({
        toggles: {
          notifyEmail: preferences.notifyEmail,
          notifyPush: preferences.notifyPush,
          notifyApproval: preferences.notifyApproval,
          notifyWeeklyDigest: preferences.notifyWeeklyDigest,
          notifyInApp: preferences.notifyInApp,
          notifyDistribution: preferences.notifyDistribution,
          notifyExpiring: preferences.notifyExpiring,
          notifyObsolete: preferences.notifyObsolete,
        },
        frequency: preferences.notificationFrequency,
      });
    }
  }, [preferences]);

  // Check for changes
  useEffect(() => {
    if (!preferences) return;

    const changed =
      settings.toggles.notifyEmail !== preferences.notifyEmail ||
      settings.toggles.notifyPush !== preferences.notifyPush ||
      settings.toggles.notifyApproval !== preferences.notifyApproval ||
      settings.toggles.notifyWeeklyDigest !== preferences.notifyWeeklyDigest ||
      settings.toggles.notifyInApp !== preferences.notifyInApp ||
      settings.toggles.notifyDistribution !== preferences.notifyDistribution ||
      settings.toggles.notifyExpiring !== preferences.notifyExpiring ||
      settings.toggles.notifyObsolete !== preferences.notifyObsolete ||
      settings.frequency !== preferences.notificationFrequency;

    setHasChanges(changed);
  }, [settings, preferences]);

  const notificationSettings: NotificationSettingItem[] = [
    {
      id: "email",
      title: "Email Notifications",
      description: "Receive email alerts for important updates",
      key: "notifyEmail",
      icon: Mail,
    },
    {
      id: "push",
      title: "Push Notifications",
      description: "Get push notifications on your device",
      key: "notifyPush",
      icon: Smartphone,
      requiresPermission: true,
    },
    {
      id: "approval",
      title: "Approval Reminders",
      description: "Reminders for pending document approvals",
      key: "notifyApproval",
      icon: Bell,
    },
    {
      id: "weekly",
      title: "Weekly Digest",
      description: "Weekly summary of your activity and pending items",
      key: "notifyWeeklyDigest",
      icon: Clock,
    },
  ];

  const handleToggle = useCallback(
    async (key: keyof NotificationSettingsState["toggles"]) => {
      const newValue = !settings.toggles[key];

      // Special handling for push notifications
      if (key === "notifyPush" && newValue) {
        if (!isPushSupported) {
          toast.error("Push notifications are not supported in this browser");
          return;
        }

        if (pushPermission !== "granted") {
          const granted = await requestPermission();
          if (!granted) {
            toast.error("Push notification permission was denied");
            return;
          }
          toast.success("Push notifications enabled");
        } else if (pushToken) {
          // Permission already granted, but make sure token is registered
          const registered = await registerToken(pushToken);
          if (registered) {
            toast.success("Push notifications enabled");
          }
        }
      }

      setSettings((prev) => ({
        ...prev,
        toggles: {
          ...prev.toggles,
          [key]: newValue,
        },
      }));
    },
    [settings.toggles, isPushSupported, pushPermission, pushToken, requestPermission, registerToken]
  );

  const handleFrequencyChange = useCallback((value: string) => {
    setSettings((prev) => ({
      ...prev,
      frequency: value as NotificationFrequency,
    }));
  }, []);

  const handleSavePreferences = useCallback(async () => {
    setIsSaving(true);

    try {
      const success = await updatePreferences({
        notifyEmail: settings.toggles.notifyEmail,
        notifyPush: settings.toggles.notifyPush,
        notifyApproval: settings.toggles.notifyApproval,
        notifyWeeklyDigest: settings.toggles.notifyWeeklyDigest,
        notifyInApp: settings.toggles.notifyInApp,
        notifyDistribution: settings.toggles.notifyDistribution,
        notifyExpiring: settings.toggles.notifyExpiring,
        notifyObsolete: settings.toggles.notifyObsolete,
        notificationFrequency: settings.frequency,
      });

      if (success) {
        toast.success("Notification preferences saved successfully");
        await refetch();
      } else {
        toast.error("Failed to save notification preferences");
      }
    } catch (error) {
      toast.error("An error occurred while saving preferences");
    } finally {
      setIsSaving(false);
    }
  }, [settings, updatePreferences, refetch]);

  const handleCancel = useCallback(() => {
    if (preferences) {
      setSettings({
        toggles: {
          notifyEmail: preferences.notifyEmail,
          notifyPush: preferences.notifyPush,
          notifyApproval: preferences.notifyApproval,
          notifyWeeklyDigest: preferences.notifyWeeklyDigest,
          notifyInApp: preferences.notifyInApp,
          notifyDistribution: preferences.notifyDistribution,
          notifyExpiring: preferences.notifyExpiring,
          notifyObsolete: preferences.notifyObsolete,
        },
        frequency: preferences.notificationFrequency,
      });
    }
  }, [preferences]);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200/50 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200/50 rounded-xl">
      {/* Card Header */}
      <div className="p-6 pb-0">
        <h3 className="text-base font-normal text-neutral-950">
          Notification Preferences
        </h3>
        <p className="text-base text-[#717182] mt-1">
          Choose how you want to be notified about updates
        </p>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-0">
        {/* Notification Settings List */}
        {notificationSettings.map((setting, index) => {
          const Icon = setting.icon;
          const isDisabled =
            setting.requiresPermission && !isPushSupported;
          const showWarning =
            setting.requiresPermission &&
            isPushSupported &&
            pushPermission === "denied";

          return (
            <div key={setting.id}>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-start gap-3">
                  {Icon && (
                    <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="size-4 text-blue-600" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-normal text-neutral-950">
                      {setting.title}
                    </span>
                    <span className="text-sm text-[#62748e]">
                      {setting.description}
                    </span>
                    {isDisabled && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="size-3" />
                        {pushError || "Push notifications not supported in this browser"}
                      </span>
                    )}
                    {showWarning && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="size-3" />
                        Permission denied. Please enable in browser settings.
                      </span>
                    )}
                  </div>
                </div>
                <Switch
                  checked={settings.toggles[setting.key]}
                  onCheckedChange={() => handleToggle(setting.key)}
                  disabled={isDisabled || isPushLoading}
                  className="data-[state=checked]:bg-[#030213] data-[state=unchecked]:bg-[#cbced4]"
                />
              </div>
              {index < notificationSettings.length - 1 && (
                <div className="h-px bg-black/10" />
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-black/10" />

        {/* Notification Frequency */}
        <div className="pt-4 space-y-2">
          <label className="text-sm font-normal text-neutral-950">
            Notification Frequency
          </label>
          <Select
            value={settings.frequency}
            onValueChange={handleFrequencyChange}
          >
            <SelectTrigger className="h-9 bg-[#f3f3f5] border-transparent rounded-lg">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NotificationFrequency.IMMEDIATE}>
                Immediate
              </SelectItem>
              <SelectItem value={NotificationFrequency.HOURLY}>Hourly</SelectItem>
              <SelectItem value={NotificationFrequency.DAILY}>Daily</SelectItem>
              <SelectItem value={NotificationFrequency.WEEKLY}>Weekly</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-[#62748e]">
            {settings.frequency === NotificationFrequency.IMMEDIATE
              ? "You'll receive notifications as soon as events occur"
              : `Notifications will be batched and sent ${settings.frequency.toLowerCase()}`}
          </p>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex justify-end gap-3 pt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-9 px-6 border-[#f24822] text-[#f24822] hover:bg-[#f24822]/10 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="h-9 px-4 bg-[#155dfc] hover:bg-[#1350d4] text-white rounded-lg flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span>Save Preferences</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
