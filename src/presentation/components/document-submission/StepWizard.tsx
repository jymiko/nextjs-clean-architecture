"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

export interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepWizardProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

const defaultSteps: Step[] = [
  { id: "document-info", label: "Document Information" },
  { id: "detail-document", label: "Detail Document" },
  { id: "procedure-document", label: "Procedure Document" },
  { id: "signature-document", label: "Signature Document" },
];

export function StepWizard({
  steps = defaultSteps,
  currentStep,
  onStepClick,
  className,
}: StepWizardProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index <= currentStep;

          return (
            <div
              key={step.id}
              className="flex items-center"
            >
              {/* Step Circle and Label */}
              <div
                className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded cursor-default",
                  isClickable && "cursor-pointer"
                )}
                onClick={() => isClickable && onStepClick?.(index)}
              >
                {/* Circle */}
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                    isCompleted && "bg-[#1D8841] text-white",
                    isCurrent && "bg-[#4DB1D4] text-white",
                    !isCompleted && !isCurrent && "bg-[#E1E1E6] text-[#8D8D99]"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </div>
                {/* Label */}
                <span
                  className={cn(
                    "text-base font-bold whitespace-nowrap font-['IBM_Plex_Sans']",
                    isCompleted && "text-[#323238]",
                    isCurrent && "text-[#323238]",
                    !isCompleted && !isCurrent && "text-[#8D8D99]"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Arrow */}
              {index < steps.length - 1 && (
                <ChevronRight className="h-5 w-5 mx-2 text-[#8D8D99]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function StepWizardCompact({
  steps = defaultSteps,
  currentStep,
  onStepClick,
  className,
}: StepWizardProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index <= currentStep;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Indicator */}
              <div
                className={cn(
                  "flex items-center gap-2 cursor-default",
                  isClickable && "cursor-pointer"
                )}
                onClick={() => isClickable && onStepClick?.(index)}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                    isCompleted && "bg-[#4DB1D4] text-white",
                    isCurrent && "bg-[#4DB1D4] text-white",
                    !isCompleted && !isCurrent && "bg-[#E1E2E3] text-[#738193]"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:inline",
                    isCompleted && "text-[#4DB1D4]",
                    isCurrent && "text-[#4DB1D4]",
                    !isCompleted && !isCurrent && "text-[#738193]"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 sm:w-12 h-[2px] mx-2",
                    index < currentStep ? "bg-[#4DB1D4]" : "bg-[#E1E2E3]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
