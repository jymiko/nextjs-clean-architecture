'use client';

import { Bell, User, Menu } from "lucide-react";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/use-current-user";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, isLoading } = useCurrentUser();

  return (
    <header className="bg-white border-b border-[#e9f5fe] sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Mobile Menu & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="size-6" />
          </button>
          <h1 className="text-black">Dashboard</h1>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Notification Bell */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="size-5 lg:size-6 text-[#DA318C]" />
            <span className="absolute top-1 right-1 size-2 bg-[#DA318C] rounded-full" />
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2 lg:gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="relative size-8 lg:size-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt="User avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="size-5 lg:size-6 text-gray-400" />
              )}
            </div>
            <span className="hidden sm:block text-black">
              {isLoading ? '...' : user?.name || 'User'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
