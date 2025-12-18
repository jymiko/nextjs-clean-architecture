"use client";

import { FilePlus, Share2, FileQuestion, FileText, Users } from "lucide-react";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/lib/animations/hooks";
import { springConfig } from "@/lib/animations/config";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springConfig.snappy,
  },
};

export function QuickActions() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
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
          <div className="flex flex-col gap-3 w-full flex-1">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                className="w-full flex items-center justify-start gap-3 sm:gap-6 px-3 sm:px-4 py-3 h-auto rounded-[10px] flex-1"
              >
                <div
                  className={`size-5 sm:size-[23px] rounded flex items-center justify-center shrink-0 ${action.iconBg} ${action.iconColor}`}
                >
                  {action.icon}
                </div>
                <div className="flex flex-col gap-1 text-left min-w-0 flex-1">
                  <p className="text-[#0e1115] text-xs sm:text-sm font-medium leading-none truncate">
                    {action.title}
                  </p>
                  <p className="text-[#737373] text-xs sm:text-sm font-medium leading-none truncate">
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springConfig.smooth, delay: 0.3 }}
    >
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
          <motion.div
            className="flex flex-col gap-3 w-full flex-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {quickActions.map((action, index) => (
              <motion.div key={action.id} variants={itemVariants}>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start gap-3 sm:gap-6 px-3 sm:px-4 py-3 h-auto rounded-[10px] flex-1 transition-all hover:scale-[1.02]"
                >
                  <motion.div
                    className={`size-5 sm:size-[23px] rounded flex items-center justify-center shrink-0 ${action.iconBg} ${action.iconColor}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={springConfig.snappy}
                  >
                    {action.icon}
                  </motion.div>
                  <div className="flex flex-col gap-1 text-left min-w-0 flex-1">
                    <p className="text-[#0e1115] text-xs sm:text-sm font-medium leading-none truncate">
                      {action.title}
                    </p>
                    <p className="text-[#737373] text-xs sm:text-sm font-medium leading-none truncate">
                      {action.description}
                    </p>
                  </div>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
