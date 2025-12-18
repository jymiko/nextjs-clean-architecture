"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { useReducedMotion } from "@/lib/animations/hooks";
import { duration } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

export interface FadeInProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  className?: string;
}

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  className,
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  const directionMap = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  };

  const exitMap = {
    up: { y: -10 },
    down: { y: 10 },
    left: { x: -10 },
    right: { x: 10 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...exitMap[direction] }}
      transition={{
        duration: duration.normal,
        delay,
        ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export default FadeIn;
