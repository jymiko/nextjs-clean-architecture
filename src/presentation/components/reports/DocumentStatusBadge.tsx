"use client";

import { cn } from "@/lib/utils";

export type DocumentStatus =
  | "active"
  | "obsolete"
  | "pending_obsolete_approval"
  | "obsolete_request"
  | "expiring_soon"
  | "draft"
  | "pending_approval"
  | "rejected"
  | "on_review"
  | "on_approval"
  | "on_revision"
  | "revision_by_reviewer"
  | "pending_ack"
  | "approved"
  | "distributed"
  | "waiting_validation"
  | "archived";

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-[#DBFFE0] text-[#0E9211]",
  },
  obsolete: {
    label: "Obsolete",
    className: "bg-[#FFD6CD] text-[#F24822]",
  },
  pending_obsolete_approval: {
    label: "Pending Obsolete Approval",
    className: "bg-[#FFF4D4] text-[#C08F2C]",
  },
  obsolete_request: {
    label: "Obsolete Request",
    className: "bg-[#FFF4D4] text-[#C08F2C]",
  },
  expiring_soon: {
    label: "Expiring Soon",
    className: "bg-[#FFD6CD] text-[#F24822]",
  },
  draft: {
    label: "Draft",
    className: "bg-[#E1E2E3] text-[#384654]",
  },
  pending_approval: {
    label: "Pending Approval",
    className: "bg-[#FFF4D4] text-[#C08F2C]",
  },
  rejected: {
    label: "Rejected",
    className: "bg-[#FFD6CD] text-[#F24822]",
  },
  on_review: {
    label: "On Review",
    className: "bg-[#FFF4D4] text-[#C08F2C]",
  },
  on_approval: {
    label: "On Approval",
    className: "bg-[#E9E4FF] text-[#7C3AED]",
  },
  on_revision: {
    label: "On Revision",
    className: "bg-[#FFF4E5] text-[#EA580C]",
  },
  revision_by_reviewer: {
    label: "Revision by Reviewer",
    className: "bg-[#FFD6CD] text-[#F24822]",
  },
  pending_ack: {
    label: "Pending Acknowledged",
    className: "bg-[#FFF4D4] text-[#C08F2C]",
  },
  approved: {
    label: "Approved",
    className: "bg-[#DBFFE0] text-[#0E9211]",
  },
  distributed: {
    label: "Distributed",
    className: "bg-[#E9F5FE] text-[#4DB1D4]",
  },
  waiting_validation: {
    label: "Waiting Validation",
    className: "bg-[#DBEAFE] text-[#1D4ED8]",
  },
  archived: {
    label: "Archived",
    className: "bg-[#F3F4F6] text-[#6B7280]",
  },
};

export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-3 py-2.5 rounded-lg text-xs font-normal min-w-[100px] text-center leading-tight",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
