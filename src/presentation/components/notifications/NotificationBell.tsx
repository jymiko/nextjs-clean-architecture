"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, Check, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useRealtimeNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRemove = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(notificationId);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "NORMAL":
        return "bg-blue-500";
      case "LOW":
        return "bg-gray-400";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative size-8 lg:size-[34px] p-0"
      >
        <Bell className={cn(
          "size-5 lg:size-6",
          isConnected ? "text-[#DA318C]" : "text-gray-400"
        )} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#DA318C] rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-medium">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}

        {/* Connection indicator (small dot) */}
        {!unreadCount && (
          <span className={cn(
            "absolute top-0 right-0 size-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-gray-300"
          )} />
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-[360px] bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {isConnected && (
                <span className="size-2 bg-green-500 rounded-full" title="Connected" />
              )}
              {unreadCount > 0 && (
                <span className="text-xs text-gray-500">({unreadCount} unread)</span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <CheckCheck className="size-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
            {error && (
              <div className="px-4 py-3 bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <Loader2 className="size-8 text-gray-300 mx-auto mb-3 animate-spin" />
                <p className="text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="size-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No notifications</p>
                {!isConnected && (
                  <p className="text-xs text-gray-400 mt-1">
                    Connecting to real-time updates...
                  </p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "relative px-4 py-3 hover:bg-gray-50 transition-colors group",
                      notification.isRead ? "bg-white" : "bg-blue-50/50"
                    )}
                  >
                    {/* Priority indicator */}
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1",
                      getPriorityColor(notification.priority)
                    )} />

                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm truncate",
                            notification.isRead ? "font-normal text-gray-700" : "font-medium text-gray-900"
                          )}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2">
                          {notification.link && (
                            <Link
                              href={notification.link}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="size-3" />
                              View
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons - Always visible on mobile, hover on desktop */}
                      <div className="flex flex-col gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="size-6 text-gray-400 hover:text-green-600"
                            title="Mark as read"
                          >
                            <Check className="size-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleRemove(notification.id, e)}
                          className="size-6 text-gray-400 hover:text-red-600"
                          title="Dismiss"
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View all notifications
            </Link>
            <Link
              href="/settings?tab=notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
