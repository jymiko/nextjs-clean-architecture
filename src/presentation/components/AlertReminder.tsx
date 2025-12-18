"use client";

import { Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardAlert } from "@/domain/entities/Dashboard";

// ============================================
// Props Interface
// ============================================

interface AlertsRemindersProps {
  alerts: DashboardAlert[];
  isLoading?: boolean;
  onViewDetail?: (alert: DashboardAlert) => void;
}

// ============================================
// Skeleton Component
// ============================================

function AlertSkeleton() {
  return (
    <div className="relative bg-white border-[3px] rounded-[8px] p-4 sm:p-5 flex-1 border-gray-100 animate-pulse">
      {/* Left Accent Bar Skeleton */}
      <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gray-200" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ml-2">
        {/* Icon + Content Skeleton */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <div className="size-6 sm:size-8 rounded bg-gray-200 shrink-0" />
          <div className="flex-1">
            <div className="h-5 w-32 sm:w-48 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-full sm:w-64 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="h-9 w-full sm:w-24 bg-gray-200 rounded shrink-0" />
      </div>
    </div>
  );
}

// ============================================
// Helper Functions
// ============================================

function getAlertIcon(type: DashboardAlert['type'], severity: DashboardAlert['severity']) {
  if (type === 'pending_distribution') {
    return (
      <Clock
        className={`size-6 ${severity === 'warning' ? 'text-[#C08F2C]' : 'text-[#F24822]'}`}
      />
    );
  }
  return (
    <AlertTriangle
      className={`size-6 ${severity === 'warning' ? 'text-[#C08F2C]' : 'text-[#F24822]'}`}
    />
  );
}

function getAlertStyles(severity: DashboardAlert['severity']) {
  if (severity === 'warning') {
    return {
      border: 'border-[rgba(255,244,215,0.96)]',
      accent: 'bg-[#C08F2C]',
      text: 'text-[#c08f2c]',
      button: 'bg-[#fff4d4] border-[#ffde89] hover:bg-[#ffefbd] text-[#c08f2c]',
    };
  }
  return {
    border: 'border-[#fde6f3]',
    accent: 'bg-[#F24822]',
    text: 'text-[#f24822]',
    button: 'bg-[#ffd6cd] border-[#ffd6cd] hover:bg-[#ffc4b8] text-[#f24822]',
  };
}

// ============================================
// Main Component
// ============================================

export function AlertsReminders({
  alerts,
  isLoading = false,
  onViewDetail,
}: AlertsRemindersProps) {
  return (
    <Card className="border-[#e9f5fe] w-full h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-[#243644] text-xl font-semibold">Alerts & Reminders</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {/* Alerts List */}
        <div className="flex flex-col gap-4 flex-1 h-full">
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: 3 }).map((_, index) => (
              <AlertSkeleton key={index} />
            ))
          ) : alerts.length === 0 ? (
            // Empty state
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
              <AlertTriangle className="size-12 mb-2 opacity-50" />
              <p className="text-sm">No alerts or reminders</p>
              <p className="text-xs mt-1">Everything looks good!</p>
            </div>
          ) : (
            // Alerts list
            alerts.map((alert) => {
              const styles = getAlertStyles(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`relative bg-white border-[3px] rounded-[8px] p-4 sm:p-5 flex-1 ${styles.border}`}
                >
                  {/* Left Accent Bar */}
                  <div
                    className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${styles.accent}`}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ml-2">
                    {/* Icon + Content */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      {/* Icon */}
                      <div className="size-6 sm:size-8 shrink-0 flex items-center justify-center">
                        {getAlertIcon(alert.type, alert.severity)}
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-black text-sm sm:text-base font-semibold mb-1 truncate">
                          {alert.title}
                        </p>
                        <p className={`text-xs sm:text-sm ${styles.text} truncate`}>
                          {alert.description}
                        </p>
                      </div>
                    </div>

                    {/* View Detail Button */}
                    <Button
                      variant="ghost"
                      className={`px-4 sm:px-6 py-2 rounded-[5px] border shrink-0 h-auto w-full sm:w-auto ${styles.button}`}
                      onClick={() => onViewDetail?.(alert)}
                    >
                      View Detail
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
