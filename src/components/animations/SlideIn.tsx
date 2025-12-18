"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/animations/hooks";
import { springConfig } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

export interface SlideInProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "exit"> {
  children: ReactNode;
  direction?: "left" | "right" | "top" | "bottom";
  delay?: number;
  className?: string;
  distance?: number | string;
}

export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  (
    {
      children,
      direction = "right",
      delay = 0,
      className,
      distance = "100%",
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();

    const getInitialPosition = () => {
      if (shouldReduceMotion) return {};

      switch (direction) {
        case "left":
          return { x: distance };
        case "right":
          return { x: typeof distance === "number" ? -distance : `-${distance}` };
        case "top":
          return { y: typeof distance === "number" ? -distance : `-${distance}` };
        case "bottom":
          return { y: distance };
        default:
          return {};
      }
    };

    const getExitPosition = () => {
      if (shouldReduceMotion) return { opacity: 0 };

      switch (direction) {
        case "left":
          return { x: distance, opacity: 0 };
        case "right":
          return { x: typeof distance === "number" ? -distance : `-${distance}`, opacity: 0 };
        case "top":
          return { y: typeof distance === "number" ? -distance : `-${distance}`, opacity: 0 };
        case "bottom":
          return { y: distance, opacity: 0 };
        default:
          return { opacity: 0 };
      }
    };

    return (
      <motion.div
        ref={ref}
        initial={{ ...getInitialPosition(), opacity: shouldReduceMotion ? 1 : 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={getExitPosition()}
        transition={{
          ...springConfig.smooth,
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

SlideIn.displayName = "SlideIn";

export default SlideIn;
