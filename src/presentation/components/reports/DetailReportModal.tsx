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

// Extended interface for modal that includes file information
interface ReportDocumentWithFile {
  id: string;
  code: string;
  title: string;
  department: string;
  type: string;
  status: "active" | "obsolete";
  date: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

interface DetailReportModalProps {
  document: ReportDocumentWithFile | null;
  open: boolean;
  onClose: () => void;
}

// Helper function to format file size
function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// Helper function to get file type from mime type or filename
function getFileType(mimeType?: string, fileName?: string): string {
  if (mimeType) {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'DOCX';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'XLSX';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'PPTX';
    if (mimeType.includes('image')) return 'Image';
    if (mimeType.includes('text')) return 'TXT';
  }
  if (fileName) {
    const ext = fileName.split('.').pop()?.toUpperCase();
    if (ext) return ext;
  }
  return 'File';
}

export function DetailReportModal({
  document,
  open,
  onClose,
}: DetailReportModalProps) {
  if (!document) return null;

  // Use real file data from document
  const attachment = {
    name: document.fileName || `${document.code}.pdf`,
    type: getFileType(document.mimeType, document.fileName),
    size: formatFileSize(document.fileSize),
    url: document.fileUrl,
  };

  const handleDownload = () => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
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
                onClick={handleDownload}
                disabled={!attachment.url}
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
