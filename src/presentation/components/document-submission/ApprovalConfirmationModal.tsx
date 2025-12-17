"use client";

import { useState } from "react";
import { X, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Approval {
  id: string;
  level: number;
  approver: {
    id: string;
    name: string;
    position?: string;
  };
  signatureImage: string | null;
  signedAt: Date | string | null;
  status: string;
}

interface ApprovalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onRequestRevision: () => void;
  approval: Approval | null;
  documentTitle?: string;
}

export function ApprovalConfirmationModal({
  isOpen,
  onClose,
  onApprove,
  onRequestRevision,
  approval,
  documentTitle,
}: ApprovalConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !approval) return null;

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await onApprove();
      onClose();
    } catch (error) {
      console.error("Error approving:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestRevision = () => {
    onRequestRevision();
    onClose();
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return "Reviewer";
      case 2:
        return "Approver";
      case 3:
        return "Acknowledged";
      default:
        return "Approver";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Your Decision
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            You have signed the document{" "}
            {documentTitle && (
              <span className="font-medium text-gray-900">"{documentTitle}"</span>
            )}
            {" "}as{" "}
            <span className="font-medium text-gray-900">
              {getLevelLabel(approval.level)}
            </span>
            .
          </p>

          <p className="text-gray-600 mb-6">
            What would you like to do next?
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Approve Button */}
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className={cn(
                "flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-medium transition-all",
                "bg-green-600 text-white hover:bg-green-700",
                "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span>Approve Document</span>
            </button>

            {/* Request Revision Button */}
            <button
              onClick={handleRequestRevision}
              disabled={isLoading}
              className={cn(
                "flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-medium transition-all",
                "bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200",
                "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Request Revision</span>
            </button>
          </div>

          {/* Info Text */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> Clicking "Request Revision" will reset all signatures
              (except the document creator's) and require the document to be revised and
              re-signed by all parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
