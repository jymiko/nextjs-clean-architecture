"use client";

import { ChevronDown, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Simple Line Chart Component
function LineChart() {
  const data = [25, 35, 30, 45, 40, 55];
  const months = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun"];
  const maxValue = 60;
  const height = 420;
  const width = 950;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((value, index) => {
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
    return { x, y, value };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  // Create area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
      {/* Grid lines */}
      {[0, 20, 40, 60].map((value) => {
        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
        return (
          <g key={value}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#E9F5FE"
              strokeWidth={1}
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              className="text-[14px] fill-black"
            >
              {value}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaD} fill="url(#gradient)" opacity={0.3} />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#4DB1D4" strokeWidth={2} />

      {/* Points */}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={4}
          fill="#4DB1D4"
          stroke="white"
          strokeWidth={2}
        />
      ))}

      {/* X-axis labels */}
      {months.map((month, index) => {
        const x = padding.left + (index / (months.length - 1)) * chartWidth;
        return (
          <text
            key={month}
            x={x}
            y={height - 8}
            textAnchor="middle"
            className="text-[14px] fill-black"
          >
            {month}
          </text>
        );
      })}

      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4DB1D4" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#4DB1D4" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Simple Pie Chart Component
function PieChart() {
  const activePercent = 75;

  // Calculate pie segments
  const activeAngle = (activePercent / 100) * 360;
  const radius = 120;
  const centerX = 130;
  const centerY = 130;

  // Convert angle to radians and calculate path
  const activeEndAngle = (activeAngle - 90) * (Math.PI / 180);

  const activeEndX = centerX + radius * Math.cos(activeEndAngle);
  const activeEndY = centerY + radius * Math.sin(activeEndAngle);

  const largeArcFlag = activePercent > 50 ? 1 : 0;

  const activePath = `
    M ${centerX} ${centerY}
    L ${centerX} ${centerY - radius}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${activeEndX} ${activeEndY}
    Z
  `;

  const obsoletePath = `
    M ${centerX} ${centerY}
    L ${activeEndX} ${activeEndY}
    A ${radius} ${radius} 0 ${1 - largeArcFlag} 1 ${centerX} ${centerY - radius}
    Z
  `;

  return (
    <div className="flex flex-col items-center h-full justify-center">
      <svg width={260} height={260} className="overflow-visible">
        <path d={activePath} fill="#4DB1D4" />
        <path d={obsoletePath} fill="#DA318C" />
        {/* Inner circle for donut effect */}
        <circle cx={centerX} cy={centerY} r={65} fill="white" />
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-3 mt-6">
        <div className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-[#4DB1D4]" />
          <span className="text-base text-[#243644]">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-[#DA318C]" />
          <span className="text-base text-[#243644]">Obsolete</span>
        </div>
      </div>
    </div>
  );
}

export function DocumentsAnalytics() {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle className="text-black text-lg font-bold leading-6">Documents Analytics</CardTitle>
          <div className="flex gap-4">
            {/* Category Dropdown */}
            <Button
              variant="outline"
              className="flex items-center justify-between gap-2 px-3 py-2 border-[#8a8f9d] w-[180px] h-[38px]"
            >
              <span className="text-sm font-medium text-black">Category Documents</span>
              <ChevronDown className="size-5" />
            </Button>

            {/* Date Range */}
            <Button
              variant="outline"
              className="flex items-center justify-between gap-2 px-3 py-2 border-[#8a8f9d] w-[180px] h-[38px]"
            >
              <span className="text-sm font-medium text-black">Jan 2025 - Jun 2025</span>
              <Calendar className="size-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {/* Charts Section */}
        <div className="flex gap-4 flex-1 min-h-0 h-full">
          {/* Line Chart Section */}
          <div className="flex-[2.5] min-w-0 flex flex-col min-h-0">
            <p className="text-sm text-black mb-2">All Documents</p>
            <div className="flex-1 w-full min-h-0">
              <LineChart />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="size-3 rounded-full bg-[#4DB1D4]" />
              <span className="text-sm text-black">New Documents</span>
            </div>
          </div>

          {/* Pie Chart Section */}
          <div className="flex-1 max-w-[300px] shrink-0 flex flex-col min-h-0">
            <p className="text-sm text-black mb-2">Approval Rate</p>
            <div className="flex justify-center items-center flex-1 min-h-0">
              <PieChart />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
