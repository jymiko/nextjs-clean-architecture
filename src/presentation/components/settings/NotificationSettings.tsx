"use client";

import { useState } from "react";
import { Save, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "email",
      title: "Email Notifications",
      description: "Receive email alerts for important updates",
      enabled: true,
    },
    {
      id: "push",
      title: "Push Notifications",
      description: "Get push notifications on your mobile device",
      enabled: false,
    },
    {
      id: "approval",
      title: "Approval Reminders",
      description: "Daily reminders for pending approvals",
      enabled: true,
    },
    {
      id: "weekly",
      title: "Weekly Digest",
      description: "Weekly summary of your activity and pending items",
      enabled: true,
    },
  ]);

  const [frequency, setFrequency] = useState("immediate");

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleSavePreferences = () => {
    console.log("Saving preferences:", { settings, frequency });
  };

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
        {settings.map((setting, index) => (
          <div key={setting.id}>
            <div className="flex items-center justify-between py-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-normal text-neutral-950">
                  {setting.title}
                </span>
                <span className="text-sm text-[#62748e]">
                  {setting.description}
                </span>
              </div>
              <Switch
                checked={setting.enabled}
                onCheckedChange={() => toggleSetting(setting.id)}
                className="data-[state=checked]:bg-[#030213] data-[state=unchecked]:bg-[#cbced4]"
              />
            </div>
            {index < settings.length - 1 && (
              <div className="h-px bg-black/10" />
            )}
          </div>
        ))}

        {/* Divider */}
        <div className="h-px bg-black/10" />

        {/* Notification Frequency */}
        <div className="pt-4 space-y-2">
          <label className="text-sm font-normal text-neutral-950">
            Notification Frequency
          </label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="h-9 bg-[#f3f3f5] border-transparent rounded-lg">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button
            onClick={handleSavePreferences}
            className="h-9 px-4 bg-[#155dfc] hover:bg-[#1350d4] text-white rounded-lg flex items-center gap-2"
          >
            <Save className="size-4" />
            <span>Save Preferences</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
