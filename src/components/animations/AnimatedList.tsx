"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Children, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/animations/hooks";
import { springConfig } from "@/lib/animations/config";
import { cn } from "@/lib/utils";

export interface AnimatedListProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springConfig.snappy,
  },
};

export function AnimatedList({
  children,
  staggerDelay = 0.05,
  className,
  itemClassName,
}: AnimatedListProps) {
  const shouldReduceMotion = useReducedMotion();

  const customContainerVariants: Variants = {
    ...containerVariants,
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  if (shouldReduceMotion) {
    return (
      <div className={cn(className)}>
        {Children.map(children, (child, index) => (
          <div key={index} className={cn(itemClassName)}>
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={customContainerVariants}
      className={cn(className)}
    >
      <AnimatePresence>
        {Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={cn(itemClassName)}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Simpler version for table rows
export interface AnimatedTableRowProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedTableRow({ children, className }: AnimatedTableRowProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <tr className={className}>{children}</tr>;
  }

  return (
    <motion.tr
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.tr>
  );
}

// Wrapper for table body with stagger
export interface AnimatedTableBodyProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function AnimatedTableBody({
  children,
  staggerDelay = 0.03,
  className,
}: AnimatedTableBodyProps) {
  const shouldReduceMotion = useReducedMotion();

  const customContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.05,
      },
    },
  };

  if (shouldReduceMotion) {
    return <tbody className={className}>{children}</tbody>;
  }

  return (
    <motion.tbody
      initial="hidden"
      animate="visible"
      variants={customContainerVariants}
      className={className}
    >
      {children}
    </motion.tbody>
  );
}

export default AnimatedList;
