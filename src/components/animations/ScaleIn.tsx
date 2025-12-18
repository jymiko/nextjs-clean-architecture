"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/animations/hooks";
import { springConfig } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

export interface ScaleInProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "exit"> {
  children: ReactNode;
  delay?: number;
  className?: string;
  initialScale?: number;
  bounce?: boolean;
}

export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  (
    {
      children,
      delay = 0,
      className,
      initialScale = 0.95,
      bounce = false,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.div
        ref={ref}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: initialScale }}
        animate={{ opacity: 1, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: initialScale }}
        transition={{
          ...(bounce ? springConfig.bouncy : springConfig.smooth),
          delay,
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

ScaleIn.displayName = "ScaleIn";

export default ScaleIn;
