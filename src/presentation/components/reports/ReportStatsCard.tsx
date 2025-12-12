"use client";

import { ReactNode } from "react";

interface ReportStatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  valueColor?: "default" | "success" | "warning";
}

const valueColorClasses = {
  default: "text-[#151D48]",
  success: "text-[#0E9211]",
  warning: "text-[#F24822]",
};

export function ReportStatsCard({
  title,
  value,
  icon,
  valueColor = "default",
}: ReportStatsCardProps) {
  return (
    <div className="bg-white border border-[#e9f5fe] rounded-xl p-4 lg:p-5 flex items-center justify-between h-[100px]">
      <div className="flex flex-col gap-1">
        <p className="text-[#425166] text-base font-medium leading-6">
          {title}
        </p>
        <p className={`text-2xl font-semibold leading-8 ${valueColorClasses[valueColor]}`}>
          {value}
        </p>
      </div>
      <div className="size-[50px] shrink-0">{icon}</div>
    </div>
  );
}
