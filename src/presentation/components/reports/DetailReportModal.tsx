"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { ReportDocument } from "./ReportDocumentsTable";

interface DetailReportModalProps {
  document: ReportDocument | null;
  open: boolean;
  onClose: () => void;
}

interface DocumentAttachment {
  name: string;
  type: string;
  size: string;
}

export function DetailReportModal({
  document,
  open,
  onClose,
}: DetailReportModalProps) {
  if (!document) return null;

  // Mock attachment data - in real implementation, this would come from document data
  const attachment: DocumentAttachment = {
    name: `${document.code}.pdf`,
    type: "PDF",
    size: "2.4 MB",
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 rounded-xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="bg-[#e9f5fe] px-6 py-4">
          <DialogTitle className="text-[#384654] text-lg font-semibold">
            Detail Report
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {/* Document Code */}
            <div className="space-y-1">
              <label className="text-[#738193] text-base">
                Document Code
              </label>
              <p className="text-[#4DB1D4] text-base font-semibold">
                {document.code}
              </p>
            </div>

            {/* Document Title */}
            <div className="space-y-1">
              <label className="text-[#738193] text-base">
                Document Title
              </label>
              <p className="text-[#384654] text-base">
                {document.title}
              </p>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-[#738193] text-base">
                Department
              </label>
              <p className="text-[#384654] text-base">
                {document.department}
              </p>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-[#738193] text-base">
                Type
              </label>
              <p className="text-[#384654] text-base">
                {document.type}
              </p>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[#738193] text-base">
                Status
              </label>
              <div>
                <DocumentStatusBadge status={document.status} />
              </div>
            </div>

            {/* Created Date */}
            <div className="space-y-1">
              <label className="text-[#738193] text-base">
                Created Date
              </label>
              <p className="text-[#384654] text-base">
                {document.date}
              </p>
            </div>
          </div>

          {/* Document Attachment */}
          <div className="space-y-2">
            <label className="text-[#738193] text-base">
              Document Attachment
            </label>
            <div className="flex items-center justify-between p-4 border border-[#e1e2e3] rounded-lg bg-[#fafbfc]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#e9f5fe] rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#4DB1D4]" />
                </div>
                <div>
                  <p className="text-[#384654] text-base font-medium">
                    {attachment.name}
                  </p>
                  <p className="text-[#738193] text-sm">
                    {attachment.type} • {attachment.size}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-4 border-[#4DB1D4] text-[#4DB1D4] text-base hover:bg-[#e9f5fe] hover:text-[#4DB1D4]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e1e2e3] flex justify-end">
          <Button
            variant="outline"
            className="h-11 px-6 border-[#e1e2e3] text-[#384654] text-base hover:bg-[#f5f5f5]"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
