"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/lib/animations/hooks";
import { pageVariants } from "@/lib/animations/config";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={pageVariants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
