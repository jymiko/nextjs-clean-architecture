"use client";

import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  valueColor?: "default" | "info" | "warning";
}

const valueColorClasses = {
  default: "text-[#151D48]",
  info: "text-[#4DB1D4]",
  warning: "text-[#C08F2C]",
};

function StatsCard({ title, value, icon, valueColor = "default" }: StatsCardProps) {
  return (
    <div className="bg-white border border-[#e9f5fe] rounded-xl p-4 lg:p-5 flex items-center justify-between flex-1 min-w-[200px]">
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

interface DraftDocumentStatsProps {
  totalDrafts: number;
  recentDrafts: number;
}

export function DraftDocumentStats({
  totalDrafts,
  recentDrafts,
}: DraftDocumentStatsProps) {
  return (
    <div className="bg-white px-4 py-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <StatsCard
          title="Total Draft Documents"
          value={totalDrafts}
          valueColor="default"
          icon={<TotalDraftsIcon />}
        />
        <StatsCard
          title="Recent Drafts (This Week)"
          value={recentDrafts}
          valueColor="info"
          icon={<RecentDraftsIcon />}
        />
      </div>
    </div>
  );
}

function TotalDraftsIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="54" height="54" rx="27" fill="#E9F5FE"/>
      <g clipPath="url(#clip0_draft_total)">
        <path d="M31 17H21C19.9 17 19 17.9 19 19V35C19 36.1 19.9 37 21 37H33C34.1 37 35 36.1 35 35V21L31 17ZM33 35H21V19H30V22H33V35Z" fill="#4DB1D4"/>
        <path d="M23 29H31V31H23V29Z" fill="#4DB1D4"/>
        <path d="M23 25H31V27H23V25Z" fill="#4DB1D4"/>
      </g>
      <defs>
        <clipPath id="clip0_draft_total">
          <rect width="24" height="24" fill="white" transform="translate(15 15)"/>
        </clipPath>
      </defs>
    </svg>
  );
}

function RecentDraftsIcon() {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="50" rx="25" fill="#E9F5FE"/>
      <path d="M25 13C18.4 13 13 18.4 13 25C13 31.6 18.4 37 25 37C31.6 37 37 31.6 37 25C37 18.4 31.6 13 25 13ZM25 35C19.5 35 15 30.5 15 25C15 19.5 19.5 15 25 15C30.5 15 35 19.5 35 25C35 30.5 30.5 35 25 35Z" fill="#4DB1D4"/>
      <path d="M26 19H24V26L30 29.5L31 27.9L26 25V19Z" fill="#4DB1D4"/>
    </svg>
  );
}
