"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { ManagementDocument } from "./DocumentManagementTable";
import { PDFViewer } from "./PDFViewer";

interface DocumentViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: ManagementDocument | null;
  onApprove?: (document: ManagementDocument) => void;
  onReject?: (document: ManagementDocument) => void;
  isAdmin?: boolean;
}

export function DocumentViewerModal({
  open,
  onOpenChange,
  document,
  onApprove,
  onReject,
  isAdmin = false,
}: DocumentViewerModalProps) {
  const [status, setStatus] = useState<"active" | "obsolete">("active");

  if (!document) return null;

  // Mock data for demonstration
  const mockDocumentInfo = {
    createdBy: "John Doe",
    createdDate: "Mon, 10 Jun 2024",
    reviewedBy: "Jane Smith",
    reviewedDate: "Wed, 12 Jun 2024",
    approvedBy: "Michael Johnson",
    approvedDate: "Fri, 14 Jun 2024",
    acknowledgedBy: "Sarah Wilson",
    acknowledgedDate: "Mon, 17 Jun 2024",
    reason: "Document update for new compliance requirements",
    lastUpdate: "Mon, 17 Jun 2024 14:30:00",
  };

  const handleApprove = () => {
    if (onApprove && document) {
      onApprove(document);
    }
  };

  const handleReject = () => {
    if (onReject && document) {
      onReject(document);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] w-[95vw] h-[85vh] p-0 !gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#e1e2e3] bg-white shrink-0">
          <DialogTitle className="text-lg font-semibold text-[#384654]">
            Document Viewer
          </DialogTitle>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left Sidebar - Document Information */}
          <div className="w-[320px] border-r border-[#e1e2e3] bg-white flex flex-col overflow-y-auto">
            <div className="p-6 flex flex-col gap-5">
              <h3 className="text-base font-semibold text-[#384654]">
                Document Information
              </h3>

              {/* Status Radio */}
              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#738193]">Status</span>
                <RadioGroup
                  value={status}
                  onValueChange={(value) => setStatus(value as "active" | "obsolete")}
                  className="flex flex-col gap-2"
                >
                  <Label
                    htmlFor="status-active"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                      status === "active"
                        ? "bg-[#0E9211] border-[#0E9211] text-white"
                        : "bg-white border-[#e1e2e3] text-[#384654] hover:border-[#c5c7ca]"
                    }`}
                  >
                    <RadioGroupItem
                      value="active"
                      id="status-active"
                      className={`${
                        status === "active"
                          ? "border-white text-white"
                          : "border-[#738193]"
                      }`}
                    />
                    <span className="text-sm font-medium">Active</span>
                  </Label>
                  <Label
                    htmlFor="status-obsolete"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                      status === "obsolete"
                        ? "bg-[#0E9211] border-[#0E9211] text-white"
                        : "bg-white border-[#e1e2e3] text-[#384654] hover:border-[#c5c7ca]"
                    }`}
                  >
                    <RadioGroupItem
                      value="obsolete"
                      id="status-obsolete"
                      className={`${
                        status === "obsolete"
                          ? "border-white text-white"
                          : "border-[#738193]"
                      }`}
                    />
                    <span className="text-sm font-medium">Obsolete</span>
                  </Label>
                </RadioGroup>
              </div>

              {/* Document Code */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[#738193]">Document Code</span>
                <span className="text-sm font-medium text-[#384654]">{document.code}</span>
              </div>

              {/* Document Title */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[#738193]">Document Title</span>
                <span className="text-sm font-medium text-[#384654]">{document.title}</span>
              </div>

              {/* Approved Date */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[#738193]">Approved Date</span>
                <span className="text-sm font-medium text-[#384654]">
                  {document.approvedDate || mockDocumentInfo.approvedDate}
                </span>
              </div>

              {/* Created By */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[#738193]">Created By</span>
                <span className="text-sm font-medium text-[#384654]">{mockDocumentInfo.createdBy}</span>
              </div>

              {/* Reviewed By */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[#738193]">Reviewed By</span>
                <span className="text-sm font-medium text-[#384654]">{mockDocumentInfo.reviewedBy}</span>
              </div>

              {/* Approved By */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[#738193]">Approved By</span>
                <span className="text-sm font-medium text-[#384654]">{mockDocumentInfo.approvedBy}</span>
              </div>

              {/* Acknowledged By */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[#738193]">Acknowledged By</span>
                <span className="text-sm font-medium text-[#384654]">{mockDocumentInfo.acknowledgedBy}</span>
              </div>

              {/* Reason */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[#738193]">Reason</span>
                <span className="text-sm font-medium text-[#384654]">{mockDocumentInfo.reason}</span>
              </div>

              {/* Last Update */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[#738193]">Last Update</span>
                <span className="text-sm font-medium text-[#384654]">{mockDocumentInfo.lastUpdate}</span>
              </div>
            </div>

            {/* Review Actions - Only for Admin */}
            {isAdmin && (
              <div className="p-6 border-t border-[#e1e2e3] mt-auto">
                <h4 className="text-sm font-semibold text-[#384654] mb-4">Review Actions</h4>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleApprove}
                    className="w-full h-11 bg-[#4DB1D4] hover:bg-[#3da0c3] text-white font-medium"
                  >
                    Approved
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="outline"
                    className="w-full h-11 border-[#D42B28] text-[#D42B28] hover:bg-[#D42B28] hover:text-white font-medium"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Content - PDF Viewer */}
          <div className="flex-1 bg-[#f5f5f5] flex flex-col overflow-hidden">
            <PDFViewer
              file={document.pdfUrl || "/documents/sample.pdf"}
              className="h-full"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
