"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/presentation/components/Sidebar";
import { NotificationPageHeader } from "@/presentation/components/notifications/NotificationPageHeader";
import { NotificationList } from "@/presentation/components/notifications/NotificationList";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useNotificationList } from "@/hooks/use-notification-list";

type TabValue = "all" | "unread";

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();

  const {
    notifications,
    pagination,
    unreadCount,
    isLoading,
    isConnected,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotificationList({
    page: currentPage,
    limit: itemsPerPage,
    unreadOnly: activeTab === "unread",
  });

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Auth check
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  // Loading state while checking auth
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

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f9fbff] relative">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:ml-[280px] min-h-screen flex flex-col">
        {/* Page Header */}
        <NotificationPageHeader
          unreadCount={unreadCount}
          isConnected={isConnected}
          onMarkAllAsRead={markAllAsRead}
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 px-4 pt-4">
                <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full max-w-[300px] grid-cols-2 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md text-sm font-medium"
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value="unread"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md text-sm font-medium"
                    >
                      Unread
                      {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-[#DA318C] rounded-full">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Notification List */}
              <NotificationList
                notifications={notifications}
                isLoading={isLoading}
                error={error}
                onMarkAsRead={markAsRead}
                emptyMessage={
                  activeTab === "unread"
                    ? "All caught up!"
                    : "No notifications yet"
                }
                emptyDescription={
                  activeTab === "unread"
                    ? "You have no unread notifications"
                    : "When you have notifications, they will appear here"
                }
              />

              {/* Pagination */}
              {pagination.totalPages > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalCount}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  showItemsPerPage={true}
                  showPageInfo={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
