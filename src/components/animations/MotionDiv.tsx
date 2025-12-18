"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { useReducedMotion, useButtonAnimation, useCardAnimation } from "@/lib/animations/hooks";
import { cn } from "@/lib/utils";

// Generic motion div with reduced motion support
export interface MotionDivProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div ref={ref} className={cn(className)} {...props}>
        {children}
      </motion.div>
    );
  }
);

MotionDiv.displayName = "MotionDiv";

// Button with hover/tap animations
export interface AnimatedButtonWrapperProps extends Omit<HTMLMotionProps<"div">, "whileHover" | "whileTap"> {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const AnimatedButtonWrapper = forwardRef<HTMLDivElement, AnimatedButtonWrapperProps>(
  ({ children, className, disabled, ...props }, ref) => {
    const animation = useButtonAnimation();

    return (
      <motion.div
        ref={ref}
        whileHover={disabled ? undefined : animation.whileHover}
        whileTap={disabled ? undefined : animation.whileTap}
        transition={animation.transition}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedButtonWrapper.displayName = "AnimatedButtonWrapper";

// Card with hover animation
export interface AnimatedCardWrapperProps extends Omit<HTMLMotionProps<"div">, "whileHover" | "initial" | "animate"> {
  children: ReactNode;
  className?: string;
  enableHover?: boolean;
}

export const AnimatedCardWrapper = forwardRef<HTMLDivElement, AnimatedCardWrapperProps>(
  ({ children, className, enableHover = true, ...props }, ref) => {
    const animation = useCardAnimation();
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.div
        ref={ref}
        initial={animation.initial}
        animate={animation.animate}
        whileHover={enableHover && !shouldReduceMotion ? animation.whileHover : undefined}
        transition={animation.transition}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCardWrapper.displayName = "AnimatedCardWrapper";

export default MotionDiv;
