"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ConfirmSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  documentTitle?: string;
}

export function ConfirmSendModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  documentTitle,
}: ConfirmSendModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0">
        <DialogHeader className="px-6 py-4 border-b border-[#E1E2E3]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#384654] font-semibold text-base">
              Confirm Send Document
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          <p className="text-[#384654] text-sm text-center">
            Are you sure you want to Send this document?
          </p>
          {documentTitle && (
            <p className="text-[#738193] text-xs text-center mt-2">
              &quot;{documentTitle}&quot;
            </p>
          )}
        </div>

        <div className="px-6 pb-6 flex items-center gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11 border-[#F24822] text-[#F24822] hover:bg-[#FFF4F4]"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-11 bg-[#4DB1D4] hover:bg-[#3d9fc2] text-white"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
