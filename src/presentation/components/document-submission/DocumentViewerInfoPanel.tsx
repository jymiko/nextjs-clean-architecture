"use client";

import { cn } from "@/lib/utils";
import { DocumentStatusBadge, DocumentStatus } from "../reports/DocumentStatusBadge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileCode,
  Type,
  Calendar,
  User,
  Building2,
  UserCheck,
  CheckCircle,
  Users,
  Clock,
  StickyNote,
  Pencil,
  X,
} from "lucide-react";

export interface DocumentViewerInfo {
  id: string;
  code: string;
  title: string;
  status: DocumentStatus;
  approvedDate?: string;
  createdBy: string;
  createdByPosition?: string;
  departmentOfDestination?: string[];
  reviewBy?: string;
  reviewByPosition?: string;
  approvedBy?: string;
  approvedByPosition?: string;
  acknowledgedBy?: { name: string; position: string }[];
  lastUpdate?: string;
  notes?: string;
}

interface DocumentViewerInfoPanelProps {
  document: DocumentViewerInfo;
  onEdit?: () => void;
  onClose?: () => void;
  className?: string;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

function InfoRow({ icon, label, value, valueClassName }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="text-[#738193] mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-[#738193] text-xs block mb-1">{label}</span>
        <div className={cn("text-[#384654] text-sm", valueClassName)}>{value}</div>
      </div>
    </div>
  );
}

export function DocumentViewerInfoPanel({
  document,
  onEdit,
  onClose,
  className,
}: DocumentViewerInfoPanelProps) {
  return (
    <div className={cn("bg-white rounded-lg border border-[#E1E2E3] overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-[#E9F5FE] px-6 py-4 flex items-center gap-3">
        <FileText className="h-5 w-5 text-[#4DB1D4]" />
        <h3 className="text-[#384654] font-semibold text-base">Document Viewer</h3>
      </div>

      {/* Document Information Section */}
      <div className="px-6 py-4">
        <h4 className="text-[#384654] font-medium text-sm mb-3">Document Information</h4>

        {/* Status */}
        <div className="mb-4">
          <span className="text-[#738193] text-xs block mb-2">Status</span>
          <DocumentStatusBadge status={document.status} />
        </div>

        {/* Document Code */}
        <InfoRow
          icon={<FileCode className="h-4 w-4" />}
          label="Document Code"
          value={document.code}
          valueClassName="text-[#4DB1D4] font-semibold"
        />

        {/* Document Title */}
        <InfoRow
          icon={<Type className="h-4 w-4" />}
          label="Document Title"
          value={document.title}
        />

        {/* Approved Date */}
        <InfoRow
          icon={<Calendar className="h-4 w-4" />}
          label="Approved Date"
          value={document.approvedDate || "-"}
        />

        {/* Create By */}
        <InfoRow
          icon={<User className="h-4 w-4" />}
          label="Create By"
          value={
            <span>
              {document.createdBy}
              {document.createdByPosition && (
                <span className="text-[#738193]"> - {document.createdByPosition}</span>
              )}
            </span>
          }
        />

        {/* Department Of Destination */}
        {document.departmentOfDestination && document.departmentOfDestination.length > 0 && (
          <InfoRow
            icon={<Building2 className="h-4 w-4" />}
            label="Department Of Destination"
            value={
              <div className="space-y-0.5">
                {document.departmentOfDestination.map((dept, index) => (
                  <div key={index}>{dept}</div>
                ))}
              </div>
            }
          />
        )}

        {/* Review By */}
        {document.reviewBy && (
          <InfoRow
            icon={<UserCheck className="h-4 w-4" />}
            label="Review By"
            value={
              <span>
                {document.reviewBy}
                {document.reviewByPosition && (
                  <span className="text-[#738193]"> - {document.reviewByPosition}</span>
                )}
              </span>
            }
          />
        )}

        {/* Approved By */}
        {document.approvedBy && (
          <InfoRow
            icon={<CheckCircle className="h-4 w-4" />}
            label="Approved By"
            value={
              <span>
                {document.approvedBy}
                {document.approvedByPosition && (
                  <span className="text-[#738193]"> - {document.approvedByPosition}</span>
                )}
              </span>
            }
          />
        )}

        {/* Acknowledged By */}
        {document.acknowledgedBy && document.acknowledgedBy.length > 0 && (
          <InfoRow
            icon={<Users className="h-4 w-4" />}
            label="Acknowledged By"
            value={
              <div className="space-y-0.5">
                {document.acknowledgedBy.map((person, index) => (
                  <div key={index}>
                    {person.name}
                    <span className="text-[#738193]"> - {person.position}</span>
                  </div>
                ))}
              </div>
            }
          />
        )}

        {/* Last Update */}
        {document.lastUpdate && (
          <InfoRow
            icon={<Clock className="h-4 w-4" />}
            label="Last Update"
            value={document.lastUpdate}
          />
        )}

        {/* Notes */}
        {document.notes && (
          <InfoRow
            icon={<StickyNote className="h-4 w-4" />}
            label="Notes"
            value={document.notes}
            valueClassName="text-[#F24822] italic"
          />
        )}
      </div>

      {/* Review Actions */}
      <div className="px-6 pb-6 pt-2 space-y-3">
        <h4 className="text-[#384654] font-medium text-sm mb-3">Review Actions</h4>

        <Button
          className="w-full h-11 bg-[#F24822] hover:bg-[#d93d1b] text-white"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>

        <Button
          variant="outline"
          className="w-full h-11 border-[#F24822] text-[#F24822] hover:bg-[#FFF4F4]"
          onClick={onClose}
        >
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>
    </div>
  );
}
