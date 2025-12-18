"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/animations/hooks";
import { springConfig } from "@/lib/animations/config";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function ErrorModal({
  isOpen,
  onClose,
  title = "Operation Failed!",
  message = "An error occurred. Please try again.",
  autoClose = true,
  autoCloseDelay = 3000
}: ErrorModalProps) {
  const shouldReduceMotion = useReducedMotion();

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
      <DialogContent className="sm:max-w-[716px] p-0 gap-0 rounded-[20px] border-0" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center justify-center py-9 px-6">
          {/* Error Icon with Glow Effect */}
          <motion.div
            className="relative mb-9"
            initial={shouldReduceMotion ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springConfig.bouncy}
          >
            {/* Outer glow */}
            <motion.div
              className="absolute inset-0 w-[228px] h-[228px] rounded-full bg-[#f24822]/10"
              initial={shouldReduceMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...springConfig.gentle, delay: 0.1 }}
            />
            {/* Middle glow */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[170px] h-[170px] rounded-full bg-[#f24822]/20"
              initial={shouldReduceMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...springConfig.gentle, delay: 0.15 }}
            />
            {/* Inner circle with icon */}
            <div className="relative w-[228px] h-[228px] flex items-center justify-center">
              <motion.div
                className="w-[100px] h-[100px] rounded-full bg-[#f24822] flex items-center justify-center"
                initial={shouldReduceMotion ? false : { scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...springConfig.bouncy, delay: 0.2 }}
              >
                <motion.div
                  initial={shouldReduceMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...springConfig.bouncy, delay: 0.4 }}
                >
                  <AlertTriangle className="w-12 h-12 text-white" strokeWidth={2} />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Text Content */}
          <div className="text-center space-y-2">
            <motion.h2
              className="text-2xl font-medium text-[#1a1a1a]"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {title}
            </motion.h2>
            <motion.p
              className="text-xl text-[#1a1a1a] max-w-[470px]"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {message}
            </motion.p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
