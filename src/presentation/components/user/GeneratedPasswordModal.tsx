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
import { Copy, Check, AlertTriangle } from "lucide-react";

interface GeneratedPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  generatedPassword: string;
}

export function GeneratedPasswordModal({
  isOpen,
  onClose,
  userName,
  userEmail,
  generatedPassword,
}: GeneratedPasswordModalProps) {
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const handleClose = () => {
    setCopied(false);
    setAcknowledged(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] p-0 gap-0 rounded-lg">
        <DialogHeader className="px-6 py-4 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            User Created Successfully
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Important</p>
              <p>This password will only be shown once. Please copy and share it securely with the user.</p>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Name:</span> {userName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {userEmail}
            </p>
          </div>

          {/* Generated Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Temporary Password
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-100 rounded-lg font-mono text-sm select-all break-all">
                {generatedPassword}
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

          {/* Acknowledgment Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#4db1d4] focus:ring-[#4db1d4] rounded"
            />
            <span className="text-sm text-gray-600">
              I have copied this password and will share it securely with the user
            </span>
          </label>

          {/* Note */}
          <p className="text-xs text-gray-500">
            The user will be required to change this password upon first login.
          </p>
        </div>

        <DialogFooter className="px-6 py-4 bg-[#fcfcfc] border-t border-[#f5f5f5]">
          <Button
            onClick={handleClose}
            disabled={!acknowledged}
            className="w-full h-11 bg-[#4db1d4] hover:bg-[#3da0c2] text-white disabled:opacity-50"
          >
            {acknowledged ? "Done" : "Please acknowledge above to continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
