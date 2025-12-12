"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
        <Button variant="ghost" size="icon" className="size-8 lg:size-[34px] p-0">
          <div className="size-8 lg:size-[34px] relative">
            <Image
              src="/assets/04a50ad105e936b2494be230cd07cdd14d10d4e1.png"
              alt="Notification"
              fill
              className="object-cover"
            />
          </div>
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-2 lg:gap-[15px]">
          <Image
            src="/assets/b67e969598fad8dfebcaaec93a901ad71da4fab6.png"
            alt="User avatar"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="hidden sm:block text-black text-sm lg:text-base font-semibold text-center whitespace-nowrap">
            Annesa Ayu
          </span>
        </div>
      </div>
    </header>
  );
}
