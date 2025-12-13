"use client";

import { CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = "Successfully Deleted!",
  message = "The Position data has been deleted from the system. The changes have been saved successfully.",
  autoClose = true,
  autoCloseDelay = 3000
}: SuccessModalProps) {

  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[716px] p-0 gap-0 rounded-[20px] border-0">
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center justify-center py-9 px-6">
          {/* Success Icon with Glow Effect */}
          <div className="relative mb-9">
            {/* Outer glow */}
            <div className="absolute inset-0 w-[228px] h-[228px] rounded-full bg-[#4db1d4]/10" />
            {/* Middle glow */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[170px] h-[170px] rounded-full bg-[#4db1d4]/20" />
            {/* Inner circle with icon */}
            <div className="relative w-[228px] h-[228px] flex items-center justify-center">
              <div className="w-[100px] h-[100px] rounded-full bg-[#4db1d4] flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-medium text-[#1a1a1a]">
              {title}
            </h2>
            <p className="text-xl text-[#1a1a1a] max-w-[480px]">
              {message}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
