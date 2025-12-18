"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";
import { useReducedMotion } from "@/lib/animations/hooks";
import { duration } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

export interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  pageKey?: string;
  mode?: "wait" | "sync" | "popLayout";
}

export function PageTransition({
  children,
  className,
  pageKey,
  mode = "wait",
}: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: duration.normal,
          ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
        }}
        className={cn(className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Simplified version without AnimatePresence (for use inside existing AnimatePresence)
export interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: duration.normal,
        ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
