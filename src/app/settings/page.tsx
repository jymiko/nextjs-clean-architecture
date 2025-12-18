"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { DashboardHeader } from "@/presentation/components/dashboard";
import { User, Bell, Settings as SettingsIcon } from "lucide-react";
import { ProfileSettings } from "@/presentation/components/settings/ProfileSettings";
import { NotificationSettings } from "@/presentation/components/settings/NotificationSettings";
import { SystemSettings } from "@/presentation/components/settings/SystemSettings";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UserRole } from "@/domain/entities/User";

type TabType = "profile" | "notifications" | "system";

interface Tab {
  id: TabType;
  label: string;
  icon: typeof User;
  roles?: UserRole[];
}

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const { user } = useCurrentUser();

  const allTabs: Tab[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "system", label: "System", icon: SettingsIcon, roles: [UserRole.SUPERADMIN, UserRole.ADMIN] },
  ];

  const tabs = useMemo(() => {
    return allTabs.filter((tab) => {
      if (!tab.roles) return true;
      return user?.role && tab.roles.includes(user.role as UserRole);
    });
  }, [user?.role]);

  return (
    <div className="min-h-screen bg-[#f9fbff] relative">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:ml-[280px] flex flex-col min-h-screen">
        {/* Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Settings"
        />

        {/* Tabs Navigation */}
        <div className="px-4 lg:px-6 pt-4">
          <div className="bg-[#f1f4ff] p-1 rounded-2xl flex flex-col sm:flex-row">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-normal transition-all ${
                    isActive
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-950 hover:bg-white/50"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 lg:p-6">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "system" && <SystemSettings />}
        </div>
      </div>
    </div>
  );
}
