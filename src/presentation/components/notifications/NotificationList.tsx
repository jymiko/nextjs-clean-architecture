"use client";

import { Bell, Inbox } from "lucide-react";
import { NotificationCard } from "./NotificationCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { NotificationItem } from "@/hooks/use-notification-list";

interface NotificationListProps {
  notifications: NotificationItem[];
  isLoading: boolean;
  error: string | null;
  onMarkAsRead: (id: string) => Promise<boolean>;
  emptyMessage?: string;
  emptyDescription?: string;
}

// Loading skeleton component
function NotificationSkeleton() {
  return (
    <div className="flex gap-4 p-4 border-b border-gray-100">
      <Skeleton className="size-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function NotificationList({
  notifications,
  isLoading,
  error,
  onMarkAsRead,
  emptyMessage = "No notifications yet",
  emptyDescription = "When you have notifications, they will appear here",
}: NotificationListProps) {
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <Bell className="size-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Failed to load notifications
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          {error}
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 5 }).map((_, index) => (
          <NotificationSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Inbox className="size-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {emptyMessage}
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          {emptyDescription}
        </p>
      </div>
    );
  }

  // Notification list
  return (
    <div className="divide-y divide-gray-100">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}
