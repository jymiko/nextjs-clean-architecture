"use client";

import { FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/lib/animations/hooks";
import { springConfig } from "@/lib/animations/config";
import type { DashboardActivity } from "@/domain/entities/Dashboard";

// ============================================
// Props Interface
// ============================================

interface RecentActivitiesProps {
  activities: DashboardActivity[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

// ============================================
// Animation Variants
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springConfig.snappy,
  },
};

// ============================================
// Skeleton Component
// ============================================

function ActivitySkeleton() {
  return (
    <div className="bg-white flex items-center gap-3 sm:gap-6 px-3 sm:px-4 py-3 rounded-[8px] animate-pulse flex-1">
      {/* Icon Skeleton */}
      <div className="size-5 sm:size-[23px] rounded bg-gray-200 shrink-0" />

      {/* Content Skeleton */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="h-4 w-24 sm:w-32 bg-gray-200 rounded" />
        <div className="h-3 w-32 sm:w-40 bg-gray-200 rounded" />
        <div className="h-3 w-20 sm:w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// ============================================
// Helper Functions
// ============================================

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}

function getActionText(action: DashboardActivity['action'], role: string): string {
  switch (action) {
    case 'APPROVED':
      return `Approved by ${role}`;
    case 'REJECTED':
      return `Rejected by ${role}`;
    case 'NEEDS_REVISION':
      return `Revision requested by ${role}`;
    case 'SUBMITTED':
      return `Submitted by ${role}`;
    case 'DISTRIBUTED':
      return `Distributed by ${role}`;
    default:
      return `Action by ${role}`;
  }
}

// ============================================
// Main Component
// ============================================

export function RecentActivities({
  activities,
  isLoading = false,
  onViewAll,
}: RecentActivitiesProps) {
  const shouldReduceMotion = useReducedMotion();

  // Non-animated version for reduced motion
  if (shouldReduceMotion) {
    return (
      <Card className="h-full w-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-black text-lg font-bold">Recent Activities</CardTitle>
            <Button
              variant="link"
              className="text-[#4DB1D4] text-base font-normal p-0 h-auto"
              onClick={onViewAll}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pt-0">
          <div className="flex flex-col gap-3 flex-1 w-full">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <ActivitySkeleton key={index} />
              ))
            ) : activities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
                <FileText className="size-12 mb-2 opacity-50" />
                <p className="text-sm">No recent activities</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white flex items-center gap-3 sm:gap-6 px-3 sm:px-4 py-3 rounded-[8px] hover:bg-gray-50 transition-colors flex-1"
                >
                  <div
                    className={`size-5 sm:size-[23px] rounded flex items-center justify-center shrink-0 ${
                      activity.type === "approved"
                        ? "bg-[#DBFFE0] text-[#0E9211]"
                        : "bg-[#FFE4D6] text-[#F24822]"
                    }`}
                  >
                    <FileText className="size-3 sm:size-4" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <p className="text-[#0e1115] text-xs sm:text-sm font-medium leading-none truncate">
                      {activity.documentNumber}
                    </p>
                    <p className="text-[#737373] text-xs sm:text-sm font-medium leading-none truncate">
                      {getActionText(activity.action, activity.actionByRole)}
                    </p>
                    <p className="text-[#737373] text-[10px] sm:text-xs font-medium leading-none">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springConfig.smooth, delay: 0.2 }}
    >
      <Card className="h-full w-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-black text-lg font-bold">Recent Activities</CardTitle>
            <Button
              variant="link"
              className="text-[#4DB1D4] text-base font-normal p-0 h-auto"
              onClick={onViewAll}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pt-0">
          {/* Activities List */}
          <motion.div
            className="flex flex-col gap-3 flex-1 w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoading ? (
              // Skeleton loading state
              Array.from({ length: 5 }).map((_, index) => (
                <ActivitySkeleton key={index} />
              ))
            ) : activities.length === 0 ? (
              // Empty state
              <motion.div
                className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <FileText className="size-12 mb-2 opacity-50" />
                <p className="text-sm">No recent activities</p>
              </motion.div>
            ) : (
              // Activities list
              activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  variants={itemVariants}
                  className="bg-white flex items-center gap-3 sm:gap-6 px-3 sm:px-4 py-3 rounded-[8px] hover:bg-gray-50 transition-colors flex-1 cursor-pointer"
                  whileHover={{ x: 4, backgroundColor: "rgb(249, 250, 251)" }}
                  transition={springConfig.snappy}
                >
                  {/* Icon */}
                  <motion.div
                    className={`size-5 sm:size-[23px] rounded flex items-center justify-center shrink-0 ${
                      activity.type === "approved"
                        ? "bg-[#DBFFE0] text-[#0E9211]"
                        : "bg-[#FFE4D6] text-[#F24822]"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    transition={springConfig.snappy}
                  >
                    <FileText className="size-3 sm:size-4" />
                  </motion.div>

                  {/* Content */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <p className="text-[#0e1115] text-xs sm:text-sm font-medium leading-none truncate">
                      {activity.documentNumber}
                    </p>
                    <p className="text-[#737373] text-xs sm:text-sm font-medium leading-none truncate">
                      {getActionText(activity.action, activity.actionByRole)}
                    </p>
                    <p className="text-[#737373] text-[10px] sm:text-xs font-medium leading-none">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
