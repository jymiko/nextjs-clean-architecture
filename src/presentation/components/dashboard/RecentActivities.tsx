"use client";

import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Activity {
  id: string;
  fileName: string;
  action: string;
  time: string;
  type: "approved" | "revision";
}

const activities: Activity[] = [
  {
    id: "1",
    fileName: "SOP-DT-001.pdf",
    action: "Approved by Acknowledge",
    time: "1 minutes ago",
    type: "approved",
  },
  {
    id: "2",
    fileName: "Standart-DT-001.pdf",
    action: "Revisi by Reviewer",
    time: "7 hours ago",
    type: "revision",
  },
  {
    id: "3",
    fileName: "WI-DT-001.pdf",
    action: "Approved by Reviewer",
    time: "yesterday",
    type: "approved",
  },
  {
    id: "4",
    fileName: "WI-DT-001.pdf",
    action: "Approved by Acknowledge",
    time: "10 Sept 2025",
    type: "approved",
  },
  {
    id: "5",
    fileName: "Standart-DT-001.pdf",
    action: "Revisi by Approver",
    time: "14 Oct 2025",
    type: "revision",
  },
];

export function RecentActivities() {
  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-black text-lg font-bold">Recent Activities</CardTitle>
          <Button variant="link" className="text-[#4DB1D4] text-base font-normal p-0 h-auto">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {/* Activities List */}
        <div className="flex flex-col gap-3 flex-1 w-full">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white flex items-center gap-6 px-4 py-3 rounded-[8px] hover:bg-gray-50 transition-colors flex-1"
            >
              {/* Icon */}
              <div
                className={`size-[23px] rounded flex items-center justify-center shrink-0 ${
                  activity.type === "approved"
                    ? "bg-[#DBFFE0] text-[#0E9211]"
                    : "bg-[#FFE4D6] text-[#F24822]"
                }`}
              >
                <FileText className="size-4" />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1">
                <p className="text-[#0e1115] text-sm font-medium leading-none">
                  {activity.fileName}
                </p>
                <p className="text-[#737373] text-sm font-medium leading-none">
                  {activity.action}
                </p>
                <p className="text-[#737373] text-xs font-medium leading-none">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
