"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import { useReducedMotion } from "@/lib/animations/hooks";
import { springConfig } from "@/lib/animations/config";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm }: DeleteConfirmModalProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0 rounded-lg shadow-[0px_14px_32px_-2px_rgba(16,24,40,0.06),0px_2px_4px_0px_rgba(16,24,40,0.02)]">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Confirm Delete
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="p-6">
          <div className="flex flex-col items-center gap-4">
            {shouldReduceMotion ? (
              <div className="w-16 h-16 rounded-full bg-[#FEE4E2] flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-[#F24822]" />
              </div>
            ) : (
              <motion.div
                className="w-16 h-16 rounded-full bg-[#FEE4E2] flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={springConfig.bouncy}
              >
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 10, 0],
                  }}
                  transition={{
                    delay: 0.3,
                    duration: 0.5,
                    ease: "easeInOut"
                  }}
                >
                  <AlertTriangle className="w-8 h-8 text-[#F24822]" />
                </motion.div>
              </motion.div>
            )}
            <p className="text-sm text-[#454545] text-center leading-[21px]">
              Are you sure you want to delete this Division? This action cannot be undone.
            </p>
          </div>
        </DialogBody>

        <DialogFooter className="px-6 py-4 bg-[#fcfcfc] border-t border-[#f5f5f5] gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-11 border-[#4db1d4] text-[#4db1d4] hover:bg-[#4db1d4]/10"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 h-11 bg-[#F24822] hover:bg-[#d93d1a] text-white"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
