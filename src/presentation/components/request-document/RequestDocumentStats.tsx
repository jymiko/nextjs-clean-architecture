"use client";

import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  valueColor?: "default" | "success" | "warning";
}

const valueColorClasses = {
  default: "text-[#151D48]",
  success: "text-[#0E9211]",
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

interface RequestDocumentStatsProps {
  totalDocuments: number;
  approvedDocuments: number;
  pendingDocuments: number;
}

export function RequestDocumentStats({
  totalDocuments,
  approvedDocuments,
  pendingDocuments,
}: RequestDocumentStatsProps) {
  return (
    <div className="bg-white px-4 py-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <StatsCard
          title="Total Documents"
          value={totalDocuments}
          valueColor="default"
          icon={<TotalDocumentsIcon />}
        />
        <StatsCard
          title="Documents Approved"
          value={approvedDocuments}
          valueColor="success"
          icon={<ApprovedDocumentsIcon />}
        />
        <StatsCard
          title="Document Pending"
          value={pendingDocuments}
          valueColor="warning"
          icon={<PendingDocumentsIcon />}
        />
      </div>
    </div>
  );
}

function TotalDocumentsIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="54" height="54" rx="27" fill="#E9F5FE"/>
      <g clipPath="url(#clip0_total)">
        <path d="M35 17H19C17.9 17 17 17.9 17 19V35C17 36.1 17.9 37 19 37H35C36.1 37 37 36.1 37 35V19C37 17.9 36.1 17 35 17ZM35 35H19V19H35V35Z" fill="#4DB1D4"/>
        <path d="M31 21H23V23H31V21Z" fill="#4DB1D4"/>
        <path d="M31 25H23V27H31V25Z" fill="#4DB1D4"/>
        <path d="M28 29H23V31H28V29Z" fill="#4DB1D4"/>
      </g>
      <defs>
        <clipPath id="clip0_total">
          <rect width="24" height="24" fill="white" transform="translate(15 15)"/>
        </clipPath>
      </defs>
    </svg>
  );
}

function ApprovedDocumentsIcon() {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="50" rx="25" fill="#DBFFE0"/>
      <path d="M25 13C18.4 13 13 18.4 13 25C13 31.6 18.4 37 25 37C31.6 37 37 31.6 37 25C37 18.4 31.6 13 25 13ZM23 31L17 25L18.4 23.6L23 28.2L31.6 19.6L33 21L23 31Z" fill="#0E9211"/>
    </svg>
  );
}

function PendingDocumentsIcon() {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="50" rx="25" fill="#FFF4D4"/>
      <path d="M25 13C18.4 13 13 18.4 13 25C13 31.6 18.4 37 25 37C31.6 37 37 31.6 37 25C37 18.4 31.6 13 25 13ZM26 31H24V29H26V31ZM26 27H24V19H26V27Z" fill="#C08F2C"/>
    </svg>
  );
}
