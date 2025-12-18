"use client";

import { useRouter } from "next/navigation";
import {
  Clock,
  AlertCircle,
  ClipboardCheck,
  FileEdit,
  Share2,
  CheckCircle,
  XCircle,
  Archive,
  Bell,
  AlertTriangle,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/hooks/use-notification-list";

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => Promise<boolean>;
}

// Mapping notification type to icon
const typeIcons: Record<string, LucideIcon> = {
  DOCUMENT_EXPIRING: Clock,
  DOCUMENT_EXPIRED: AlertCircle,
  APPROVAL_NEEDED: ClipboardCheck,
  REVISION_NEEDED: FileEdit,
  DOCUMENT_DISTRIBUTED: Share2,
  DOCUMENT_APPROVED: CheckCircle,
  DOCUMENT_REJECTED: XCircle,
  DOCUMENT_OBSOLETE: Archive,
  GENERAL: Bell,
  ALERT: AlertTriangle,
  REMINDER: CalendarClock,
};

// Mapping notification type to icon color
const typeColors: Record<string, string> = {
  DOCUMENT_EXPIRING: "text-yellow-600 bg-yellow-100",
  DOCUMENT_EXPIRED: "text-red-600 bg-red-100",
  APPROVAL_NEEDED: "text-blue-600 bg-blue-100",
  REVISION_NEEDED: "text-orange-600 bg-orange-100",
  DOCUMENT_DISTRIBUTED: "text-green-600 bg-green-100",
  DOCUMENT_APPROVED: "text-green-600 bg-green-100",
  DOCUMENT_REJECTED: "text-red-600 bg-red-100",
  DOCUMENT_OBSOLETE: "text-gray-600 bg-gray-100",
  GENERAL: "text-blue-600 bg-blue-100",
  ALERT: "text-red-600 bg-red-100",
  REMINDER: "text-purple-600 bg-purple-100",
};

// Priority colors for the left border
const priorityColors: Record<string, string> = {
  URGENT: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-blue-500",
  LOW: "bg-gray-400",
};

// Format relative time
function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  const router = useRouter();
  const Icon = typeIcons[notification.type] || Bell;
  const iconColorClass = typeColors[notification.type] || "text-blue-600 bg-blue-100";
  const priorityColor = priorityColors[notification.priority || "MEDIUM"] || priorityColors.MEDIUM;

  const handleClick = async () => {
    // Mark as read if unread
    if (!notification.isRead) {
      await onMarkAsRead(notification.id);
    }

    // Navigate to link if available
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative flex gap-4 p-4 cursor-pointer transition-all",
        notification.isRead
          ? "bg-white hover:bg-gray-50"
          : "bg-blue-50/60 hover:bg-blue-50",
        notification.link && "cursor-pointer"
      )}
    >
      {/* Priority indicator bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l",
          priorityColor
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 size-10 rounded-full flex items-center justify-center",
          iconColorClass
        )}
      >
        <Icon className="size-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "text-sm leading-tight",
              notification.isRead
                ? "font-normal text-gray-700"
                : "font-semibold text-gray-900"
            )}
          >
            {notification.title}
          </h4>
          <span className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap">
            {formatTime(notification.createdAt)}
          </span>
        </div>

        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {notification.message}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-2">
          {!notification.isRead && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
              New
            </span>
          )}
          {notification.priority && notification.priority !== "MEDIUM" && (
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full",
                notification.priority === "URGENT" && "text-red-700 bg-red-100",
                notification.priority === "HIGH" && "text-orange-700 bg-orange-100",
                notification.priority === "LOW" && "text-gray-600 bg-gray-100"
              )}
            >
              {notification.priority}
            </span>
          )}
          {notification.link && (
            <span className="text-xs text-blue-600">Click to view</span>
          )}
        </div>
      </div>
    </div>
  );
}
