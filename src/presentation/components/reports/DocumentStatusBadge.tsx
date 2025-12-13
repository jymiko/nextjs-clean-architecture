"use client";

import { cn } from "@/lib/utils";

export type DocumentStatus =
  | "active"
  | "obsolete"
  | "pending_obsolete_approval"
  | "expiring_soon"
  | "draft"
  | "pending_approval"
  | "rejected"
  | "on_review"
  | "on_approval"
  | "revision_by_reviewer"
  | "pending_ack"
  | "approved"
  | "distributed";

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
    className: "bg-[#FFF4D4] text-[#C08F2C]",
  },
  revision_by_reviewer: {
    label: "Revision by Reviewer",
    className: "bg-[#FFD6CD] text-[#F24822]",
  },
  pending_ack: {
    label: "Pending Ack",
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
