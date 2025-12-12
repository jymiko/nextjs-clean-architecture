"use client";

import { FilePlus, Share2, FileQuestion, FileText, Users } from "lucide-react";
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

const quickActions: QuickAction[] = [
  {
    id: "1",
    title: "New Documents",
    description: "List new documents submission",
    icon: <FilePlus className="size-5" />,
    iconBg: "bg-[#E9F5FE]",
    iconColor: "text-[#4DB1D4]",
  },
  {
    id: "2",
    title: "Distributed Documents",
    description: "distributed documents",
    icon: <Share2 className="size-5" />,
    iconBg: "bg-[#FFF4D4]",
    iconColor: "text-[#C08F2C]",
  },
  {
    id: "3",
    title: "Request Documents",
    description: "request the documents you need",
    icon: <FileQuestion className="size-5" />,
    iconBg: "bg-[#DBFFE0]",
    iconColor: "text-[#0E9211]",
  },
  {
    id: "4",
    title: "Report Documents",
    description: "View your report documents",
    icon: <FileText className="size-5" />,
    iconBg: "bg-[#FFD6CD]",
    iconColor: "text-[#F24822]",
  },
  {
    id: "5",
    title: "Manage Dept & Users",
    description: "Manage your Departments & users",
    icon: <Users className="size-5" />,
    iconBg: "bg-[#F1F4FF]",
    iconColor: "text-[#4DB1D4]",
  },
];

export function QuickActions() {
  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-black text-lg font-bold">Quick Action</CardTitle>
          <Button variant="link" className="text-[#4DB1D4] text-base font-normal p-0 h-auto">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {/* Actions List */}
        <div className="flex flex-col gap-3 w-full flex-1">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              className="w-full flex items-center justify-start gap-6 px-4 py-3 h-auto rounded-[10px] flex-1"
            >
              {/* Icon */}
              <div
                className={`size-[23px] rounded flex items-center justify-center shrink-0 ${action.iconBg} ${action.iconColor}`}
              >
                {action.icon}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1 text-left">
                <p className="text-[#0e1115] text-sm font-medium leading-none">
                  {action.title}
                </p>
                <p className="text-[#737373] text-sm font-medium leading-none">
                  {action.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
