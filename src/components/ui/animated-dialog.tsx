"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/lib/animations/hooks"
import { dialogOverlayVariants, dialogContentVariants } from "@/lib/animations/config"

const AnimatedDialog = DialogPrimitive.Root

const AnimatedDialogTrigger = DialogPrimitive.Trigger

const AnimatedDialogPortal = DialogPrimitive.Portal

const AnimatedDialogClose = DialogPrimitive.Close

// Motion-enabled Overlay
const AnimatedDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
          className
        )}
        {...props}
      />
    );
  }

  return (
    <DialogPrimitive.Overlay ref={ref} asChild forceMount {...props}>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={dialogOverlayVariants}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
          className
        )}
      />
    </DialogPrimitive.Overlay>
  );
});
AnimatedDialogOverlay.displayName = "AnimatedDialogOverlay"

interface AnimatedDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
}

// Motion-enabled Content
const AnimatedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  AnimatedDialogContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <AnimatedDialogPortal>
        <AnimatedDialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
            className
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full w-8 h-8 flex items-center justify-center bg-[#525659] text-white opacity-90 transition-all hover:opacity-100 hover:bg-[#3a3d40] hover:scale-105 focus:outline-none focus:ring-0 disabled:pointer-events-none">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </AnimatedDialogPortal>
    );
  }

  return (
    <AnimatedDialogPortal forceMount>
      <AnimatePresence mode="wait">
        <AnimatedDialogOverlay />
        <DialogPrimitive.Content ref={ref} asChild forceMount {...props}>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dialogContentVariants}
            className={cn(
              "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
              className
            )}
          >
            {children}
            {showCloseButton && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full w-8 h-8 flex items-center justify-center bg-[#525659] text-white opacity-90 transition-all hover:opacity-100 hover:bg-[#3a3d40] hover:scale-105 focus:outline-none focus:ring-0 disabled:pointer-events-none">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </motion.div>
            )}
          </motion.div>
        </DialogPrimitive.Content>
      </AnimatePresence>
    </AnimatedDialogPortal>
  );
});
AnimatedDialogContent.displayName = "AnimatedDialogContent"

// Header with entrance animation
const AnimatedDialogHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div
        className={cn(
          "flex flex-col space-y-1.5 text-center sm:text-left",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.2 }}
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
AnimatedDialogHeader.displayName = "AnimatedDialogHeader"

// Footer with entrance animation
const AnimatedDialogFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div
        className={cn(
          "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.2 }}
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
AnimatedDialogFooter.displayName = "AnimatedDialogFooter"

// Title
const AnimatedDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
AnimatedDialogTitle.displayName = DialogPrimitive.Title.displayName

// Description
const AnimatedDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AnimatedDialogDescription.displayName = DialogPrimitive.Description.displayName

// Body with staggered content animation
const AnimatedDialogBody = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={cn(className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.08, duration: 0.2 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
AnimatedDialogBody.displayName = "AnimatedDialogBody"

export {
  AnimatedDialog,
  AnimatedDialogPortal,
  AnimatedDialogOverlay,
  AnimatedDialogClose,
  AnimatedDialogTrigger,
  AnimatedDialogContent,
  AnimatedDialogHeader,
  AnimatedDialogFooter,
  AnimatedDialogTitle,
  AnimatedDialogDescription,
  AnimatedDialogBody,
}
