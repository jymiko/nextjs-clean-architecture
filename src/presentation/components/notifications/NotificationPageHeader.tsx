"use client";

import { useState } from "react";
import { CheckCheck, Menu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationPageHeaderProps {
  unreadCount: number;
  isConnected: boolean;
  onMarkAllAsRead: () => Promise<number>;
  onToggleSidebar?: () => void;
}

export function NotificationPageHeader({
  unreadCount,
  isConnected,
  onMarkAllAsRead,
  onToggleSidebar,
}: NotificationPageHeaderProps) {
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkAllAsRead = async () => {
    if (isMarking || unreadCount === 0) return;

    setIsMarking(true);
    try {
      await onMarkAllAsRead();
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
            >
              <Menu className="size-6" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
              Notifications
            </h1>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-semibold text-white bg-[#DA318C] rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}

            {/* Connection status */}
            <span
              className={`size-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-gray-300"
              }`}
              title={isConnected ? "Connected - Real-time updates enabled" : "Connecting..."}
            />
          </div>
        </div>

        {/* Right: Mark all as read button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={isMarking || unreadCount === 0}
          className="h-9 px-3 text-sm font-medium"
        >
          {isMarking ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Marking...
            </>
          ) : (
            <>
              <CheckCheck className="size-4 mr-2" />
              Mark all as read
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
