"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useState } from "react";
import { ManagementDocument } from "./DocumentManagementTable";

interface RejectReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: ManagementDocument | null;
  onSubmit: (document: ManagementDocument, reason: string) => void;
}

export function RejectReasonModal({
  open,
  onOpenChange,
  document,
  onSubmit,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (document && reason.trim()) {
      onSubmit(document, reason.trim());
      setReason("");
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onOpenChange(false);
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-[#e1e2e3]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-[#384654]">
              Reject Reason
            </DialogTitle>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-5 w-5 text-[#384654]" />
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6">
          {/* Document Info */}
          <div className="mb-4 p-4 bg-[#f9fbff] rounded-lg">
            <p className="text-sm text-[#738193]">Document</p>
            <p className="text-sm font-medium text-[#4DB1D4]">{document.code}</p>
            <p className="text-sm text-[#384654]">{document.title}</p>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#384654]">
              Reason <span className="text-[#D42B28]">*</span>
            </label>
            <Textarea
              placeholder="Enter your reason for rejecting this document..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[120px] resize-none border-[#e1e2e3] focus:border-[#4DB1D4] focus:ring-[#4DB1D4]"
            />
            <p className="text-xs text-[#738193]">
              Please provide a clear reason for rejection so the document owner can make necessary corrections.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e1e2e3] flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="h-11 px-6 border-[#e1e2e3] text-[#384654] hover:bg-gray-50"
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="h-11 px-6 bg-[#D42B28] hover:bg-[#b82523] text-white disabled:opacity-50"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
