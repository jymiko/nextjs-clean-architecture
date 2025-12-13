"use client";

import { Menu, Search, Upload, User, Bell } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export function DashboardHeader({
  onMenuClick,
  title = "Dashboard",
}: DashboardHeaderProps) {
  const { user, isLoading } = useCurrentUser();

  return (
    <div className="flex flex-col gap-[6px] w-full">
      {/* Top Header */}
      <header className="bg-white min-h-[70px] lg:h-[111px] flex items-center justify-between px-4 lg:px-[27px] py-4 lg:py-[38px]">
        {/* Title */}
        <div className="flex items-center gap-3 lg:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden -ml-2"
          >
            <Menu className="size-6" />
          </Button>
          <h1 className="text-black text-lg lg:text-2xl font-bold leading-normal">{title}</h1>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Notification Bell */}
          <Button variant="ghost" size="icon" className="relative size-8 lg:size-[34px] p-0">
            <Bell className="size-5 lg:size-6 text-[#DA318C]" />
            <span className="absolute top-0 right-0 size-2 bg-[#DA318C] rounded-full" />
          </Button>

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

      {/* Search Bar Row */}
      <div className="bg-white min-h-[56px] lg:h-[63px] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 lg:px-[29px] py-3 lg:py-[10px]">
        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-[540px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#e1e2e3]" />
          <Input
            type="text"
            placeholder="Search"
            className="pl-10 h-[40px] lg:h-[44px] bg-white border-[#e9f5fe] rounded-[10px]"
          />
        </div>

        {/* Export Button */}
        <Button
          variant="outline"
          className="h-[40px] lg:h-[44px] gap-2 lg:gap-[14px] px-3 lg:px-[18px] border-[#e9f5fe] rounded-[10px]"
        >
          <Upload className="size-5 lg:size-6 text-[#4DB1D4]" />
          <span className="text-black text-sm lg:text-[15px] font-medium">Export Data</span>
        </Button>
      </div>
    </div>
  );
}
