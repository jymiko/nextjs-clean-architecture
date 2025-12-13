"use client";

import { cn } from "@/lib/utils";
import { DocumentStatusBadge, DocumentStatus } from "../reports/DocumentStatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X, FileEdit, Printer, Download } from "lucide-react";

export interface DocumentInfo {
  id: string;
  code: string;
  title: string;
  type: string;
  revision: string;
  department: string;
  createdBy: string;
  createdDate: string;
  effectiveDate?: string;
  expiredDate?: string;
  status: DocumentStatus;
  approver?: string;
  reviewer?: string;
  acknowledger?: string;
  description?: string;
}

interface DocumentInfoPanelProps {
  document: DocumentInfo;
  userRole?: "user" | "reviewer" | "admin" | "approval" | "ack";
  onApprove?: () => void;
  onReject?: () => void;
  onRevision?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function DocumentInfoPanel({
  document,
  userRole = "user",
  onApprove,
  onReject,
  onRevision,
  onPrint,
  onDownload,
  className,
}: DocumentInfoPanelProps) {
  const showApprovalActions = userRole === "reviewer" || userRole === "approval" || userRole === "admin";
  const showAckActions = userRole === "ack";

  return (
    <div className={cn("bg-white rounded-lg border border-[#E1E2E3] overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-[#E9F5FE] px-6 py-4">
        <h3 className="text-[#384654] font-semibold text-base">Document Information</h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Document Code */}
        <div>
          <span className="text-[#738193] text-xs block mb-1">Document Code</span>
          <span className="text-[#4DB1D4] font-semibold text-sm">{document.code}</span>
        </div>

        {/* Document Title */}
        <div>
          <span className="text-[#738193] text-xs block mb-1">Document Title</span>
          <span className="text-[#384654] text-sm">{document.title}</span>
        </div>

        {/* Type & Revision */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[#738193] text-xs block mb-1">Type</span>
            <span className="text-[#384654] text-sm">{document.type}</span>
          </div>
          <div>
            <span className="text-[#738193] text-xs block mb-1">Revision</span>
            <span className="text-[#384654] text-sm">{document.revision}</span>
          </div>
        </div>

        {/* Department */}
        <div>
          <span className="text-[#738193] text-xs block mb-1">Department</span>
          <span className="text-[#384654] text-sm">{document.department}</span>
        </div>

        {/* Created By & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[#738193] text-xs block mb-1">Created By</span>
            <span className="text-[#384654] text-sm">{document.createdBy}</span>
          </div>
          <div>
            <span className="text-[#738193] text-xs block mb-1">Created Date</span>
            <span className="text-[#384654] text-sm">{document.createdDate}</span>
          </div>
        </div>

        {/* Effective & Expired Date */}
        {(document.effectiveDate || document.expiredDate) && (
          <div className="grid grid-cols-2 gap-4">
            {document.effectiveDate && (
              <div>
                <span className="text-[#738193] text-xs block mb-1">Effective Date</span>
                <span className="text-[#384654] text-sm">{document.effectiveDate}</span>
              </div>
            )}
            {document.expiredDate && (
              <div>
                <span className="text-[#738193] text-xs block mb-1">Expired Date</span>
                <span className="text-[#384654] text-sm">{document.expiredDate}</span>
              </div>
            )}
          </div>
        )}

        {/* Status */}
        <div>
          <span className="text-[#738193] text-xs block mb-1">Status</span>
          <DocumentStatusBadge status={document.status} />
        </div>

        {/* Approver/Reviewer/Acknowledger */}
        {document.reviewer && (
          <div>
            <span className="text-[#738193] text-xs block mb-1">Reviewer</span>
            <span className="text-[#384654] text-sm">{document.reviewer}</span>
          </div>
        )}
        {document.approver && (
          <div>
            <span className="text-[#738193] text-xs block mb-1">Approver</span>
            <span className="text-[#384654] text-sm">{document.approver}</span>
          </div>
        )}
        {document.acknowledger && (
          <div>
            <span className="text-[#738193] text-xs block mb-1">Acknowledger</span>
            <span className="text-[#384654] text-sm">{document.acknowledger}</span>
          </div>
        )}

        {/* Description */}
        {document.description && (
          <div>
            <span className="text-[#738193] text-xs block mb-1">Description</span>
            <p className="text-[#384654] text-sm">{document.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 pt-0 space-y-3">
        {/* Print & Download */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-11 border-[#E1E2E3] text-[#384654]"
            onClick={onPrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-11 border-[#E1E2E3] text-[#384654]"
            onClick={onDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Approval Actions */}
        {showApprovalActions && (
          <div className="flex gap-2">
            <Button
              className="flex-1 h-11 bg-[#0E9211] hover:bg-[#0c7f0e] text-white"
              onClick={onApprove}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-11 border-[#4DB1D4] text-[#4DB1D4] hover:bg-[#E9F5FE]"
              onClick={onRevision}
            >
              <FileEdit className="h-4 w-4 mr-2" />
              Revision
            </Button>
            <Button
              className="flex-1 h-11 bg-[#F24822] hover:bg-[#d93d1b] text-white"
              onClick={onReject}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {/* Ack Actions */}
        {showAckActions && (
          <Button
            className="w-full h-11 bg-[#4DB1D4] hover:bg-[#3da0bf] text-white"
            onClick={onApprove}
          >
            <Check className="h-4 w-4 mr-2" />
            Acknowledge
          </Button>
        )}
      </div>
    </div>
  );
}
