"use client";

import { cn } from "@/lib/utils";
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
  Send,
  FileEdit,
  ArrowLeft,
} from "lucide-react";

interface PersonInfo {
  name: string;
  position: string;
}

export interface DocumentSubmissionInfoPanelProps {
  documentCode: string;
  documentTitle: string;
  createdBy: string;
  createdByPosition: string;
  departmentOfDestination: string[];
  reviewers: PersonInfo[];
  approvers: PersonInfo[];
  acknowledgers: PersonInfo[];
  lastUpdate: string;
  onSubmit: () => void;
  onDraft: () => void;
  onClose: () => void;
  isSubmitting?: boolean;
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

export function DocumentSubmissionInfoPanel({
  documentCode,
  documentTitle,
  createdBy,
  createdByPosition,
  departmentOfDestination,
  reviewers,
  approvers,
  acknowledgers,
  lastUpdate,
  onSubmit,
  onDraft,
  onClose,
  isSubmitting = false,
  className,
}: DocumentSubmissionInfoPanelProps) {
  return (
    <div className={cn("bg-white rounded-lg border border-[#E1E2E3] overflow-hidden flex flex-col h-full", className)}>
      {/* Header */}
      <div className="bg-[#E9F5FE] px-6 py-4 flex items-center gap-3 shrink-0">
        <FileText className="h-5 w-5 text-[#4DB1D4]" />
        <h3 className="text-[#384654] font-semibold text-base">Document Viewer</h3>
      </div>

      {/* Document Information Section */}
      <div className="px-6 py-4 flex-1 overflow-y-auto">
        <h4 className="text-[#384654] font-medium text-sm mb-3">Document Information</h4>

        {/* Document Code */}
        <InfoRow
          icon={<FileCode className="h-4 w-4" />}
          label="Document Code"
          value={documentCode || "-"}
          valueClassName="text-[#4DB1D4] font-semibold"
        />

        {/* Document Title */}
        <InfoRow
          icon={<Type className="h-4 w-4" />}
          label="Document Title"
          value={documentTitle || "-"}
        />

        {/* Approved Date - Always empty for new submissions */}
        <InfoRow
          icon={<Calendar className="h-4 w-4" />}
          label="Approved Date"
          value="-"
        />

        {/* Create By */}
        <InfoRow
          icon={<User className="h-4 w-4" />}
          label="Create By"
          value={
            <span>
              {createdBy || "-"}
              {createdByPosition && (
                <span className="text-[#738193]"> - {createdByPosition}</span>
              )}
            </span>
          }
        />

        {/* Department Of Destination */}
        {departmentOfDestination && departmentOfDestination.length > 0 && (
          <InfoRow
            icon={<Building2 className="h-4 w-4" />}
            label="Departement Of Destination"
            value={
              <div className="space-y-0.5">
                {departmentOfDestination.map((dept, index) => (
                  <div key={index}>{dept}</div>
                ))}
              </div>
            }
          />
        )}

        {/* Review By */}
        <InfoRow
          icon={<UserCheck className="h-4 w-4" />}
          label="Review By"
          value={
            reviewers.length > 0 ? (
              <div className="space-y-0.5">
                {reviewers.map((person, index) => (
                  <div key={index}>
                    {person.name}
                    {person.position && (
                      <span className="text-[#738193]"> - {person.position}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              "-"
            )
          }
        />

        {/* Approved By */}
        <InfoRow
          icon={<CheckCircle className="h-4 w-4" />}
          label="Approved By"
          value={
            approvers.length > 0 ? (
              <div className="space-y-0.5">
                {approvers.map((person, index) => (
                  <div key={index}>
                    {person.name}
                    {person.position && (
                      <span className="text-[#738193]"> - {person.position}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              "-"
            )
          }
        />

        {/* Acknowledged By */}
        <InfoRow
          icon={<Users className="h-4 w-4" />}
          label="Acknowledged By"
          value={
            acknowledgers.length > 0 ? (
              <div className="space-y-0.5">
                {acknowledgers.map((person, index) => (
                  <div key={index}>
                    {person.name}
                    {person.position && (
                      <span className="text-[#738193]"> - {person.position}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              "-"
            )
          }
        />

        {/* Last Update */}
        <InfoRow
          icon={<Clock className="h-4 w-4" />}
          label="Last Update"
          value={lastUpdate || "-"}
        />
      </div>

      {/* Review Actions - Always at bottom */}
      <div className="px-6 pb-6 pt-2 space-y-3 shrink-0 border-t border-[#E1E2E3] mt-auto">
        <h4 className="text-[#384654] font-medium text-sm mb-3 pt-2">Review Actions</h4>

        <Button
          className="w-full h-11 bg-[#22C55E] hover:bg-[#16A34A] text-white"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>

        <Button
          variant="outline"
          className="w-full h-11 border-[#4DB1D4] text-[#4DB1D4] hover:bg-[#E9F5FE]"
          onClick={onDraft}
          disabled={isSubmitting}
        >
          <FileEdit className="h-4 w-4 mr-2" />
          Draft
        </Button>

        <Button
          variant="outline"
          className="w-full h-11 border-[#738193] text-[#738193] hover:bg-[#F5F5F5]"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Edit
        </Button>
      </div>
    </div>
  );
}
