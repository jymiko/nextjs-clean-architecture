"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import type { DatePresetValue, DashboardAlert } from "@/domain/entities/Dashboard";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDatePreset, setSelectedDatePreset] = useState<DatePresetValue>('6m');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const {
    stats,
    charts,
    recentActivities,
    alerts,
    isLoading: isDashboardLoading,
  } = useDashboardStats({
    categoryId: selectedCategory || undefined,
    datePreset: selectedDatePreset,
  });

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/documents/categories', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    // Only redirect if loading is done and no user found
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Show loading state while checking auth
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#f9fbff] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

  // Handler for category change
  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  // Handler for date preset change
  const handleDatePresetChange = (preset: DatePresetValue) => {
    setSelectedDatePreset(preset);
  };

  // Handler for viewing alert details
  const handleViewAlertDetail = (alert: DashboardAlert) => {
    // TODO: Navigate to relevant page based on alert type
    console.log('View alert detail:', alert);
    // Example: router.push(`/documents?filter=${alert.type}`);
  };

  // Handler for viewing all activities
  const handleViewAllActivities = () => {
    // TODO: Navigate to activities page
    router.push('/activities');
  };

  // Format stats for display
  const formatValue = (value: number | undefined): string => {
    if (value === undefined) return '0';
    if (value >= 1000) {
      return (value / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return value.toString();
  };

  const getChangeSubtitle = (change: number | undefined): string => {
    if (change === undefined) return 'No data';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}% from last month`;
  };

  const getChangeColor = (change: number | undefined): 'cyan' | 'error' => {
    if (change === undefined || change >= 0) return 'cyan';
    return 'error';
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-[6px]">
          <StatCard
            title="Total Documents"
            value={formatValue(stats?.totalDocuments)}
            subtitle={getChangeSubtitle(stats?.totalDocumentsChange)}
            subtitleColor={getChangeColor(stats?.totalDocumentsChange)}
            icon={<TotalDocumentsIcon />}
            isLoading={isDashboardLoading}
            index={0}
          />
          <StatCard
            title="Pending Approvals"
            value={formatValue(stats?.pendingApprovals)}
            subtitle="Needs Attention"
            subtitleColor="warning"
            icon={<PendingApprovalsIcon />}
            isLoading={isDashboardLoading}
            index={1}
          />
          <StatCard
            title="Expiring Soon"
            value={formatValue(stats?.expiringSoon)}
            subtitle="Within 7 days"
            subtitleColor="error"
            icon={<ExpiringSoonIcon />}
            isLoading={isDashboardLoading}
            index={2}
          />
          <StatCard
            title="New Submissions"
            value={formatValue(stats?.newSubmissions)}
            subtitle="This Month"
            subtitleColor="success"
            icon={<NewSubmissionsIcon />}
            isLoading={isDashboardLoading}
            index={3}
          />
        </div>

        {/* Row 2: Documents Analytics + Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4 lg:gap-[6px] flex-1">
          <DocumentsAnalytics
            documentsByMonth={charts?.documentsByMonth || []}
            documentsByStatus={charts?.documentsByStatus || { active: 0, obsolete: 0, draft: 0, inReview: 0 }}
            documentsByCategory={charts?.documentsByCategory || []}
            categories={categories}
            selectedCategory={selectedCategory}
            selectedDatePreset={selectedDatePreset}
            onCategoryChange={handleCategoryChange}
            onDatePresetChange={handleDatePresetChange}
            isLoading={isDashboardLoading}
          />
          <RecentActivities
            activities={recentActivities}
            isLoading={isDashboardLoading}
            onViewAll={handleViewAllActivities}
          />
        </div>

        {/* Row 3: Alerts & Reminders + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4 lg:gap-[6px] flex-1">
          <AlertsReminders
            alerts={alerts}
            isLoading={isDashboardLoading}
            onViewDetail={handleViewAlertDetail}
          />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
