import { Clock } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const imgWarning = "/assets/b645436faa43d51618425fd4e84f37b4d91911de.png";

interface Alert {
  id: string;
  title: string;
  description: string;
  type: "error" | "warning";
  icon: "warning" | "clock";
}

const alerts: Alert[] = [
  {
    id: "1",
    title: "5 Documents Expiring Soon",
    description: "These Documents will Expire within the next 3 month",
    type: "error",
    icon: "warning",
  },
  {
    id: "2",
    title: "12 Documents Waiting for Distributed",
    description: "These Documents are pending distributed for more tha  48 hours",
    type: "warning",
    icon: "clock",
  },
  {
    id: "3",
    title: "1 Documents Submitted Obsoleted",
    description: "These documents will be out of date",
    type: "error",
    icon: "warning",
  },
];

export function AlertsReminders() {
  return (
    <Card className="border-[#e9f5fe] w-full h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-[#243644] text-xl font-semibold">Alerts & Reminders</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {/* Alerts List */}
        <div className="flex flex-col gap-4 flex-1 h-full">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`relative bg-white border-[3px] rounded-[8px] p-5 flex-1 ${
                alert.type === "error" ? "border-[#fde6f3]" : "border-[rgba(255,244,215,0.96)]"
              }`}
            >
              {/* Left Accent Bar */}
              <div
                className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${
                  alert.type === "error" ? "bg-[#F24822]" : "bg-[#C08F2C]"
                }`}
              />

              <div className="flex items-center justify-between gap-4 ml-2">
                {/* Icon + Content */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Icon */}
                  <div className="size-8 shrink-0 flex items-center justify-center">
                    {alert.icon === "warning" ? (
                      <Image src={imgWarning} alt="" width={32} height={32} className="object-contain" />
                    ) : (
                      <Clock className={`size-6 ${alert.type === "warning" ? "text-[#C08F2C]" : "text-[#F24822]"}`} />
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1">
                    <p className="text-black text-base font-semibold mb-1">
                      {alert.title}
                    </p>
                    <p
                      className={`text-sm ${
                        alert.type === "error" ? "text-[#f24822]" : "text-[#c08f2c]"
                      }`}
                    >
                      {alert.description}
                    </p>
                  </div>
                </div>

                {/* View Detail Button */}
                <Button
                  variant="ghost"
                  className={`px-6 py-2 rounded-[5px] border shrink-0 h-auto ${
                    alert.type === "error"
                      ? "bg-[#ffd6cd] border-[#ffd6cd] hover:bg-[#ffc4b8] text-[#f24822]"
                      : "bg-[#fff4d4] border-[#ffde89] hover:bg-[#ffefbd] text-[#c08f2c]"
                  }`}
                >
                  View Detail
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
