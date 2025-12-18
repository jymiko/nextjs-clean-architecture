import type { Transition, Variants } from "framer-motion";

// Spring configurations for different animation feels
export const springConfig = {
  gentle: { type: "spring", stiffness: 120, damping: 14 } as Transition,
  snappy: { type: "spring", stiffness: 300, damping: 30 } as Transition,
  bouncy: { type: "spring", stiffness: 400, damping: 10 } as Transition,
  smooth: { type: "spring", stiffness: 200, damping: 25 } as Transition,
};

// Duration presets (in seconds)
export const duration = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  slower: 0.6,
};

// Easing presets (as tuples for proper typing)
export const easing = {
  easeOut: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
  easeIn: [0.4, 0.0, 1, 1] as [number, number, number, number],
  easeInOut: [0.4, 0.0, 0.2, 1] as [number, number, number, number],
  spring: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
};

// Common animation variants
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export const fadeLeftVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

export const fadeRightVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
};

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const scaleBounceVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    }
  },
  exit: { opacity: 0, scale: 0.9 },
};

// Modal/Dialog specific variants
export const dialogOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const dialogContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.15,
    }
  },
};

// Stagger container variants
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    }
  },
  exit: { opacity: 0, y: -10 },
};

// Button interaction variants
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Card hover variants
export const cardHoverVariants: Variants = {
  initial: { y: 0, boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" },
  hover: {
    y: -4,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    }
  },
};

// Page transition variants
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easing.easeOut,
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: easing.easeIn,
    }
  },
};

// Slide variants for sheets/drawers
export const slideFromRightVariants: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  },
  exit: { x: "100%" },
};

export const slideFromLeftVariants: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  },
  exit: { x: "-100%" },
};

export const slideFromTopVariants: Variants = {
  hidden: { y: "-100%" },
  visible: {
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  },
  exit: { y: "-100%" },
};

export const slideFromBottomVariants: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  },
  exit: { y: "100%" },
};

// Loading spinner variants
export const spinnerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.15,
    }
  },
};

// Success checkmark variants
export const checkmarkVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.4, ease: "easeOut" },
      opacity: { duration: 0.2 },
    }
  },
};

// Skeleton pulse variants (enhanced)
export const skeletonVariants: Variants = {
  hidden: { opacity: 0.6 },
  visible: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
