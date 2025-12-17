"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, Check, Link, Clock } from "lucide-react";

interface InvitationLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  invitationLink: string;
  expiresAt?: Date | string;
}

export function InvitationLinkModal({
  isOpen,
  onClose,
  userName,
  userEmail,
  invitationLink,
  expiresAt,
}: InvitationLinkModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  const formatExpiryDate = (date: Date | string | undefined) => {
    if (!date) return '7 days';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 rounded-lg">
        <DialogHeader className="px-6 py-4 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black flex items-center gap-2">
            <Link className="w-5 h-5 text-[#4db1d4]" />
            Invitation Link Generated
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* User Info */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Name:</span> {userName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {userEmail}
            </p>
          </div>

          {/* Invitation Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Invitation Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-100 rounded-lg text-sm break-all text-blue-600 select-all">
                {invitationLink}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="h-10 w-10 flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Expiry Info */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-800">
              This link expires on <strong>{formatExpiryDate(expiresAt)}</strong>
            </p>
          </div>

          {/* Instructions */}
          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-500">
              <li>Copy the link above</li>
              <li>Share it securely with the user (e.g., via WhatsApp, email)</li>
              <li>User clicks the link and sets their own password</li>
              <li>User can then log in with their email and new password</li>
            </ol>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-[#fcfcfc] border-t border-[#f5f5f5] gap-3">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="flex-1 h-11 border-[#4db1d4] text-[#4db1d4] hover:bg-[#4db1d4]/10"
          >
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            onClick={handleClose}
            className="flex-1 h-11 bg-[#4db1d4] hover:bg-[#3da0c2] text-white"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
