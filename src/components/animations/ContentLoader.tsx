"use client";

import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/animations/hooks";
import { duration } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

export interface ContentLoaderProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
  mode?: "wait" | "sync" | "popLayout";
}

export const ContentLoader = forwardRef<HTMLDivElement, ContentLoaderProps>(
  (
    {
      isLoading,
      skeleton,
      children,
      className,
      mode = "wait",
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();

    const variants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    };

    return (
      <div ref={ref} className={cn("relative", className)}>
        <AnimatePresence mode={mode}>
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={shouldReduceMotion ? false : "hidden"}
              animate="visible"
              exit="exit"
              variants={variants}
              transition={{ duration: duration.fast }}
            >
              {skeleton}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={shouldReduceMotion ? false : "hidden"}
              animate="visible"
              exit="exit"
              variants={variants}
              transition={{ duration: duration.normal }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

ContentLoader.displayName = "ContentLoader";

// Variant that swaps with crossfade effect
export interface CrossfadeLoaderProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
}

export const CrossfadeLoader = forwardRef<HTMLDivElement, CrossfadeLoaderProps>(
  ({ isLoading, skeleton, children, className }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <div ref={ref} className={cn("relative", className)}>
        <AnimatePresence mode="sync">
          {isLoading && (
            <motion.div
              key="skeleton"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.fast }}
              className="absolute inset-0"
            >
              {skeleton}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: duration.normal, delay: isLoading ? 0 : duration.fast }}
        >
          {children}
        </motion.div>
      </div>
    );
  }
);

CrossfadeLoader.displayName = "CrossfadeLoader";

export default ContentLoader;
