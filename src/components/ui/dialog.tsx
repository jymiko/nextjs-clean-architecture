"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { motion } from "framer-motion"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/lib/animations/hooks"
import { dialogOverlayVariants, dialogContentVariants } from "@/lib/animations/config"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
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
})
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <DialogPortal>
        <DialogOverlay />
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
      </DialogPortal>
    );
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} asChild {...props}>
        <motion.div
          initial="hidden"
          animate="visible"
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
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
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
}
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
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
}
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
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
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Body wrapper with animation
const DialogBody = ({
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
}
DialogBody.displayName = "DialogBody"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
}
