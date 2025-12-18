"use client";

import { Menu, User } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { NotificationBell } from "@/presentation/components/notifications/NotificationBell";

interface DocumentManagementHeaderProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
}

export function DocumentManagementHeader({
  onMenuClick,
  title = "Document Management",
  subtitle = "Digitize Your Archives with Maximum Speed and Security",
}: DocumentManagementHeaderProps) {
  const { user, isLoading } = useCurrentUser();

  return (
    <header className="bg-white min-h-[80px] lg:h-[111px] flex items-center justify-between px-4 lg:px-6 py-4 lg:py-8">
      {/* Title Section */}
      <div className="flex items-center gap-3 lg:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden -ml-2"
        >
          <Menu className="size-6" />
        </Button>
        <div className="flex flex-col gap-1 lg:gap-2.5">
          <h1 className="text-[#070707] text-lg lg:text-2xl font-bold leading-normal tracking-tight">
            {title}
          </h1>
          <p className="text-black text-xs lg:text-sm font-normal">
            {subtitle}
          </p>
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Notification Bell */}
        <NotificationBell />

        {/* User Profile */}
        <div className="flex items-center gap-2 lg:gap-[15px]">
          <div className="relative size-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt="User avatar"
                fill
                className="object-cover"
              />
            ) : (
              <User className="size-5 text-gray-400" />
            )}
          </div>
          <span className="hidden sm:block text-black text-sm lg:text-base font-semibold text-center whitespace-nowrap">
            {isLoading ? '...' : user?.name || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}
