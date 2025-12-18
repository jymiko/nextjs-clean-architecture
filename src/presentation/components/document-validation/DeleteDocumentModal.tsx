"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";

interface DeleteDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  documentTitle?: string;
  documentCode?: string;
}

export function DeleteDocumentModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  documentTitle,
  documentCode,
}: DeleteDocumentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0">
        <DialogHeader className="px-6 py-4 border-b border-[#E1E2E3]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#384654] font-semibold text-base">
              Delete Document
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
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#FFE5E0] flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-[#F24822]" />
            </div>
            <div className="text-center">
              <p className="text-[#384654] text-sm font-medium">
                Are you sure you want to delete this document?
              </p>
              {(documentCode || documentTitle) && (
                <div className="mt-2 p-3 bg-[#F5F5F5] rounded-lg">
                  {documentCode && (
                    <p className="text-[#4DB1D4] text-sm font-semibold">{documentCode}</p>
                  )}
                  {documentTitle && (
                    <p className="text-[#738193] text-xs mt-1">{documentTitle}</p>
                  )}
                </div>
              )}
              <p className="text-[#F24822] text-xs mt-3">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11 border-[#E1E2E3]"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-11 bg-[#F24822] hover:bg-[#d93d1b] text-white"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
