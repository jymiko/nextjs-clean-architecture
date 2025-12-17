"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  subtitleColor: "cyan" | "warning" | "error" | "success";
  icon: ReactNode;
  isLoading?: boolean;
}

const subtitleColorClasses = {
  cyan: "text-[#4DB1D4]",
  warning: "text-[#C08F2C]",
  error: "text-[#F24822]",
  success: "text-[#0E9211]",
};

export function StatCard({
  title,
  value,
  subtitle,
  subtitleColor,
  icon,
  isLoading = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="border-[#e9f5fe] h-[134px] w-full">
        <CardContent className="p-[23px]">
          <div className="flex justify-between items-start gap-4 animate-pulse">
            <div className="flex flex-col gap-2">
              <div className="h-5 w-28 bg-gray-200 rounded" />
              <div className="h-8 w-20 bg-gray-200 rounded" />
            </div>
            <div className="size-[50px] bg-gray-200 rounded-lg shrink-0" />
          </div>
          <div className="h-4 w-32 bg-gray-200 rounded mt-2 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#e9f5fe] h-[134px] w-full">
      <CardContent className="p-[23px]">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col">
            <p className="text-[#425166] text-base font-medium leading-6 h-[28px]">
              {title}
            </p>
            <p className="text-[#151D48] text-2xl font-semibold leading-8 h-[38px]">
              {value}
            </p>
          </div>
          <div className="size-[50px] shrink-0">{icon}</div>
        </div>
        <p
          className={`text-[11px] font-medium leading-4 ${subtitleColorClasses[subtitleColor]}`}
        >
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}
