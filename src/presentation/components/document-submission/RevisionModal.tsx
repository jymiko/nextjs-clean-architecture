"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { FileEdit, X, AlertTriangle } from "lucide-react";

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, approvalId?: string) => void;
  documentCode?: string;
  documentTitle?: string;
  approvalId?: string;
  isLoading?: boolean;
}

export function RevisionModal({
  isOpen,
  onClose,
  onSubmit,
  documentCode,
  documentTitle,
  approvalId,
  isLoading,
}: RevisionModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason, approvalId);
      setReason("");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#384654]">
            <FileEdit className="h-5 w-5 text-orange-500" />
            Request Revision
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">Important Notice</p>
              <p>
                Requesting a revision will <strong>reset all signatures</strong> except
                the document creator's signature. All reviewers and approvers will need
                to sign again after the revision is complete.
              </p>
            </div>
          </div>

          {/* Document Info */}
          {(documentCode || documentTitle) && (
            <div className="bg-[#F9FBFF] rounded-lg p-4 space-y-2">
              {documentCode && (
                <div className="flex justify-between items-center">
                  <span className="text-[#738193] text-xs">Document Code</span>
                  <span className="text-[#4DB1D4] font-semibold text-sm">{documentCode}</span>
                </div>
              )}
              {documentTitle && (
                <div className="flex justify-between items-center">
                  <span className="text-[#738193] text-xs">Document Title</span>
                  <span className="text-[#384654] text-sm">{documentTitle}</span>
                </div>
              )}
            </div>
          )}

          {/* Revision Reason */}
          <div className="space-y-2">
            <Label htmlFor="revision-reason" className="text-[#384654] text-sm font-medium">
              Revision Reason <span className="text-[#F24822]">*</span>
            </Label>
            <Textarea
              id="revision-reason"
              placeholder="Please provide a detailed reason for revision (minimum 10 characters)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[120px] border-[#E1E2E3] focus-visible:ring-orange-400 resize-none"
            />
            <p className="text-xs text-gray-500">
              {reason.length}/10 characters minimum
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-[#E1E2E3] text-[#384654]"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={reason.trim().length < 10 || isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <FileEdit className="h-4 w-4 mr-2" />
            {isLoading ? "Submitting..." : "Request Revision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Reject Modal - Similar but for rejection
interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  documentCode?: string;
  documentTitle?: string;
  isLoading?: boolean;
}

export function RejectModal({
  isOpen,
  onClose,
  onSubmit,
  documentCode,
  documentTitle,
  isLoading,
}: RejectModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason);
      setReason("");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#384654]">
            <X className="h-5 w-5 text-[#F24822]" />
            Reject Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Info */}
          {(documentCode || documentTitle) && (
            <div className="bg-[#FFF4F4] rounded-lg p-4 space-y-2">
              {documentCode && (
                <div className="flex justify-between items-center">
                  <span className="text-[#738193] text-xs">Document Code</span>
                  <span className="text-[#4DB1D4] font-semibold text-sm">{documentCode}</span>
                </div>
              )}
              {documentTitle && (
                <div className="flex justify-between items-center">
                  <span className="text-[#738193] text-xs">Document Title</span>
                  <span className="text-[#384654] text-sm">{documentTitle}</span>
                </div>
              )}
            </div>
          )}

          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label htmlFor="reject-reason" className="text-[#384654] text-sm font-medium">
              Rejection Reason <span className="text-[#F24822]">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="Please provide the reason for rejection..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[120px] border-[#E1E2E3] focus-visible:ring-[#F24822] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-[#E1E2E3] text-[#384654]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isLoading}
            className="bg-[#F24822] hover:bg-[#d93d1b] text-white"
          >
            <X className="h-4 w-4 mr-2" />
            {isLoading ? "Rejecting..." : "Reject Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Approve Confirmation Modal
interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documentCode?: string;
  documentTitle?: string;
  isLoading?: boolean;
}

export function ApproveModal({
  isOpen,
  onClose,
  onConfirm,
  documentCode,
  documentTitle,
  isLoading,
}: ApproveModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <div className="flex flex-col items-center text-center py-6">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-[#DBFFE0] flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#0E9211" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h3 className="text-[#384654] font-semibold text-lg mb-2">Approve Document?</h3>
          <p className="text-[#738193] text-sm mb-4">
            Are you sure you want to approve this document?
          </p>

          {/* Document Info */}
          {(documentCode || documentTitle) && (
            <div className="bg-[#F9FBFF] rounded-lg p-4 w-full space-y-2 mb-4">
              {documentCode && (
                <div className="flex justify-between items-center">
                  <span className="text-[#738193] text-xs">Document Code</span>
                  <span className="text-[#4DB1D4] font-semibold text-sm">{documentCode}</span>
                </div>
              )}
              {documentTitle && (
                <div className="flex justify-between items-center">
                  <span className="text-[#738193] text-xs">Title</span>
                  <span className="text-[#384654] text-sm truncate max-w-[200px]">{documentTitle}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#E1E2E3] text-[#384654]"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-[#0E9211] hover:bg-[#0c7f0e] text-white"
            >
              {isLoading ? "Approving..." : "Approve"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
