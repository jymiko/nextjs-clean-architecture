"use client";

import { useState } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import {
  DashboardHeader,
  StatCard,
  DocumentsAnalytics,
  RecentActivities,
  QuickActions,
} from "@/presentation/components/dashboard";
import {
  TotalDocumentsIcon,
  PendingApprovalsIcon,
  ExpiringSoonIcon,
  NewSubmissionsIcon,
} from "@/presentation/components/dashboard/StatIcons";
import { AlertsReminders } from "@/presentation/components/AlertReminder";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f9fbff] relative">
      {/* Sidebar - Fixed 280px width */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area - Full width minus sidebar */}
      <div className="lg:ml-[280px] p-4 lg:p-6 flex flex-col gap-4 lg:gap-[6px] min-h-screen">
        {/* Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Dashboard"
        />

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-[6px]">
          <StatCard
            title="Total Documents"
            value="1.100"
            subtitle="+12% from last month"
            subtitleColor="cyan"
            icon={<TotalDocumentsIcon />}
          />
          <StatCard
            title="Pending Approvals"
            value="15"
            subtitle="Needs Attention"
            subtitleColor="warning"
            icon={<PendingApprovalsIcon />}
          />
          <StatCard
            title="Expiring Soon"
            value="20"
            subtitle="Within 7 days"
            subtitleColor="error"
            icon={<ExpiringSoonIcon />}
          />
          <StatCard
            title="New Submissions"
            value="19"
            subtitle="This Month"
            subtitleColor="success"
            icon={<NewSubmissionsIcon />}
          />
        </div>

        {/* Row 2: Documents Analytics + Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4 lg:gap-[6px] flex-1">
          <DocumentsAnalytics />
          <RecentActivities />
        </div>

        {/* Row 3: Alerts & Reminders + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4 lg:gap-[6px] flex-1">
          <AlertsReminders />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
