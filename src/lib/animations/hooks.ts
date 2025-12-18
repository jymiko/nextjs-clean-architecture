"use client";

import { useReducedMotion as useFramerReducedMotion } from "framer-motion";
import { useMemo } from "react";
import {
  springConfig,
  duration,
  fadeVariants,
  fadeUpVariants,
  scaleVariants,
  dialogContentVariants,
  dialogOverlayVariants,
} from "./config";
import type { Variants, Transition } from "framer-motion";

/**
 * Hook to check if user prefers reduced motion
 * Uses framer-motion's built-in hook
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}

/**
 * Returns animation configuration that respects reduced motion preferences
 */
export function useAnimationConfig() {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(() => {
    if (shouldReduceMotion) {
      // Return minimal/no animation config
      return {
        initial: false as const,
        animate: false as const,
        exit: false as const,
        transition: { duration: 0 } as Transition,
        whileHover: undefined,
        whileTap: undefined,
      };
    }

    return {
      initial: "hidden" as const,
      animate: "visible" as const,
      exit: "exit" as const,
      transition: springConfig.smooth,
      whileHover: "hover" as const,
      whileTap: "tap" as const,
    };
  }, [shouldReduceMotion]);
}

/**
 * Returns appropriate variants based on reduced motion preference
 */
export function useAnimationVariants<T extends Variants>(
  variants: T,
  reducedVariants?: T
): T | Record<string, never> {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(() => {
    if (shouldReduceMotion) {
      // Return empty variants or reduced versions
      return reducedVariants ?? ({} as T);
    }
    return variants;
  }, [shouldReduceMotion, variants, reducedVariants]);
}

/**
 * Hook for dialog/modal animations with reduced motion support
 */
export function useDialogAnimation() {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(() => {
    if (shouldReduceMotion) {
      return {
        overlay: {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.1 },
        },
        content: {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.1 },
        },
      };
    }

    return {
      overlay: {
        variants: dialogOverlayVariants,
        initial: "hidden",
        animate: "visible",
        exit: "exit",
        transition: { duration: duration.fast },
      },
      content: {
        variants: dialogContentVariants,
        initial: "hidden",
        animate: "visible",
        exit: "exit",
      },
    };
  }, [shouldReduceMotion]);
}

/**
 * Hook for page transition animations
 */
export function usePageTransition() {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(() => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
      };
    }

    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: duration.normal, ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number] },
    };
  }, [shouldReduceMotion]);
}

/**
 * Hook for list/stagger animations
 */
export function useStaggerAnimation(staggerDelay = 0.05) {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(() => {
    if (shouldReduceMotion) {
      return {
        container: {},
        item: {},
      };
    }

    return {
      container: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      },
      item: {
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: springConfig.snappy,
        },
      },
    };
  }, [shouldReduceMotion, staggerDelay]);
}

/**
 * Hook for button animations
 */
export function useButtonAnimation() {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(() => {
    if (shouldReduceMotion) {
      return {
        whileHover: undefined,
        whileTap: undefined,
        transition: undefined,
      };
    }

    return {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
      transition: springConfig.snappy,
    };
  }, [shouldReduceMotion]);
}

/**
 * Hook for card animations
 */
export function useCardAnimation() {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(() => {
    if (shouldReduceMotion) {
      return {
        initial: {},
        whileHover: {},
        variants: fadeVariants,
      };
    }

    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      whileHover: {
        y: -4,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      },
      transition: springConfig.smooth,
      variants: fadeUpVariants,
    };
  }, [shouldReduceMotion]);
}

/**
 * Hook for skeleton loading animations
 */
export function useSkeletonAnimation() {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(() => {
    if (shouldReduceMotion) {
      return {
        animate: {},
        transition: {},
      };
    }

    return {
      animate: {
        opacity: [0.5, 1, 0.5],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    };
  }, [shouldReduceMotion]);
}

/**
 * Hook for fade animations with configurable direction
 */
export function useFadeAnimation(direction: "up" | "down" | "left" | "right" | "none" = "up") {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(() => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
      };
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

    return {
      initial: { opacity: 0, ...directionMap[direction] },
      animate: { opacity: 1, y: 0, x: 0 },
      exit: { opacity: 0, ...exitMap[direction] },
      transition: { duration: duration.normal, ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number] },
    };
  }, [shouldReduceMotion, direction]);
}
