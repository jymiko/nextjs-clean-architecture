"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useReducedMotion, useCardAnimation } from "@/lib/animations/hooks";
import { springConfig } from "@/lib/animations/config";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  subtitleColor: "cyan" | "warning" | "error" | "success";
  icon: ReactNode;
  isLoading?: boolean;
  index?: number;
}

const subtitleColorClasses = {
  cyan: "text-[#4DB1D4]",
  warning: "text-[#C08F2C]",
  error: "text-[#F24822]",
  success: "text-[#0E9211]",
};

export function StatCard({
  title,
  value,
  subtitle,
  subtitleColor,
  icon,
  isLoading = false,
  index = 0,
}: StatCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const cardAnimation = useCardAnimation();

  if (isLoading) {
    return (
      <Card className="border-[#e9f5fe] h-auto sm:h-[134px] w-full">
        <CardContent className="p-4 sm:p-[23px]">
          <div className="flex justify-between items-start gap-3 sm:gap-4 animate-pulse">
            <div className="flex flex-col gap-2">
              <div className="h-5 w-24 sm:w-28 bg-gray-200 rounded" />
              <div className="h-7 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded" />
            </div>
            <div className="size-[40px] sm:size-[50px] bg-gray-200 rounded-[10px] sm:rounded-xl shrink-0" />
          </div>
          <div className="h-4 w-28 sm:w-32 bg-gray-200 rounded mt-2 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...springConfig.smooth,
        delay: index * 0.1,
      }}
      whileHover={shouldReduceMotion ? undefined : {
        y: -4,
        transition: springConfig.snappy,
      }}
    >
      <Card className="border-[#e9f5fe] h-auto sm:h-[134px] w-full transition-shadow hover:shadow-lg">
        <CardContent className="p-4 sm:p-[23px]">
          <div className="flex justify-between items-start gap-3 sm:gap-4">
            <div className="flex flex-col">
              <motion.p
                className="text-[#425166] text-sm sm:text-base font-medium leading-5 sm:leading-6"
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.1 }}
              >
                {title}
              </motion.p>
              <motion.p
                className="text-[#151D48] text-xl sm:text-2xl font-semibold leading-7 sm:leading-8"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.15, ...springConfig.bouncy }}
              >
                {value}
              </motion.p>
            </div>
            <motion.div
              className="size-[40px] sm:size-[50px] shrink-0"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.1 + 0.2, ...springConfig.bouncy }}
            >
              {icon}
            </motion.div>
          </div>
          <motion.p
            className={`text-[10px] sm:text-[11px] font-medium leading-4 mt-1 ${subtitleColorClasses[subtitleColor]}`}
            initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.25 }}
          >
            {subtitle}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
