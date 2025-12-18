// Core animation components
export { FadeIn, type FadeInProps } from "./FadeIn";
export { SlideIn, type SlideInProps } from "./SlideIn";
export { ScaleIn, type ScaleInProps } from "./ScaleIn";

// List and table animations
export {
  AnimatedList,
  AnimatedTableRow,
  AnimatedTableBody,
  type AnimatedListProps,
  type AnimatedTableRowProps,
  type AnimatedTableBodyProps,
} from "./AnimatedList";

// Page transitions
export {
  PageTransition,
  PageContent,
  type PageTransitionProps,
  type PageContentProps,
} from "./PageTransition";

// Content loading
export {
  ContentLoader,
  CrossfadeLoader,
  type ContentLoaderProps,
  type CrossfadeLoaderProps,
} from "./ContentLoader";

// Utility wrappers
export {
  MotionDiv,
  AnimatedButtonWrapper,
  AnimatedCardWrapper,
  type MotionDivProps,
  type AnimatedButtonWrapperProps,
  type AnimatedCardWrapperProps,
} from "./MotionDiv";

// Re-export from framer-motion for convenience
export { motion, AnimatePresence } from "framer-motion";
