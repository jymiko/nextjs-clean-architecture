"use client";

import { ChevronDown, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  MonthlyDocumentData,
  DocumentStatusDistribution,
  CategoryDistribution,
  DatePresetValue,
} from "@/domain/entities/Dashboard";
import { DATE_PRESETS } from "@/domain/entities/Dashboard";

// ============================================
// Props Interface
// ============================================

interface DocumentsAnalyticsProps {
  documentsByMonth: MonthlyDocumentData[];
  documentsByStatus: DocumentStatusDistribution;
  documentsByCategory: CategoryDistribution[];
  categories?: Array<{ id: string; name: string }>;
  selectedCategory?: string | null;
  selectedDatePreset?: DatePresetValue;
  onCategoryChange?: (categoryId: string | null) => void;
  onDatePresetChange?: (preset: DatePresetValue) => void;
  isLoading?: boolean;
}

// ============================================
// Skeleton Components
// ============================================

// Fixed heights for skeleton bars (deterministic)
const SKELETON_BAR_HEIGHTS = [45, 65, 55, 75, 60, 80];

function LineChartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col animate-pulse">
      <div className="flex-1 flex items-end justify-between gap-2 px-10 pb-10">
        {SKELETON_BAR_HEIGHTS.map((height, i) => (
          <div
            key={i}
            className="bg-gray-200 rounded-t w-12"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between px-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 w-8 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  );
}

function PieChartSkeleton() {
  return (
    <div className="flex flex-col items-center h-full justify-center animate-pulse">
      <div className="w-[200px] h-[200px] rounded-full bg-gray-200" />
      <div className="flex flex-col gap-3 mt-6">
        <div className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-gray-200" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-gray-200" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Line Chart Component
// ============================================

interface LineChartProps {
  data: MonthlyDocumentData[];
}

function LineChart({ data }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  const values = data.map((d) => d.count);
  const maxValue = Math.max(...values, 10); // Minimum 10 for scale
  const roundedMax = Math.ceil(maxValue / 10) * 10; // Round up to nearest 10
  const height = 420;
  const width = 950;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = values.map((value, index) => {
    const x = padding.left + (index / Math.max(values.length - 1, 1)) * chartWidth;
    const y = padding.top + chartHeight - (value / roundedMax) * chartHeight;
    return { x, y, value };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  // Create area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  // Generate Y-axis values
  const yAxisValues = [0, roundedMax / 3, (roundedMax * 2) / 3, roundedMax].map(Math.round);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
      {/* Grid lines */}
      {yAxisValues.map((value) => {
        const y = padding.top + chartHeight - (value / roundedMax) * chartHeight;
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
      {data.map((item, index) => {
        const x = padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
        return (
          <text
            key={`${item.month}-${item.year}`}
            x={x}
            y={height - 8}
            textAnchor="middle"
            className="text-[14px] fill-black"
          >
            {item.month}
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

// ============================================
// Pie Chart Component
// ============================================

interface PieChartProps {
  data: DocumentStatusDistribution;
}

function PieChart({ data }: PieChartProps) {
  const total = data.active + data.obsolete + data.draft + data.inReview;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center h-full justify-center text-gray-400">
        No data available
      </div>
    );
  }

  const activePercent = (data.active / total) * 100;

  // Calculate pie segments (simplified: active vs others)
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
        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="text-2xl font-bold fill-black"
        >
          {Math.round(activePercent)}%
        </text>
        <text
          x={centerX}
          y={centerY + 15}
          textAnchor="middle"
          className="text-xs fill-gray-500"
        >
          Active
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-3 mt-6">
        <div className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-[#4DB1D4]" />
          <span className="text-base text-[#243644]">Active ({data.active})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-[#DA318C]" />
          <span className="text-base text-[#243644]">Obsolete ({data.obsolete})</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function DocumentsAnalytics({
  documentsByMonth,
  documentsByStatus,
  documentsByCategory: _documentsByCategory, // Reserved for future category-based chart
  categories = [],
  selectedCategory,
  selectedDatePreset = '6m',
  onCategoryChange,
  onDatePresetChange,
  isLoading = false,
}: DocumentsAnalyticsProps) {
  // _documentsByCategory is available for future implementation of category breakdown chart
  void _documentsByCategory;
  const selectedCategoryName = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.name || 'All Categories'
    : 'All Categories';

  const selectedPresetLabel = DATE_PRESETS.find((p) => p.value === selectedDatePreset)?.label || 'Last 6 months';

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle className="text-black text-lg font-bold leading-6">Documents Analytics</CardTitle>
          <div className="flex gap-4">
            {/* Category Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center justify-between gap-2 px-3 py-2 border-[#8a8f9d] w-[180px] h-[38px]"
                  disabled={isLoading}
                >
                  <span className="text-sm font-medium text-black truncate">
                    {selectedCategoryName}
                  </span>
                  <ChevronDown className="size-5 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem
                  onClick={() => onCategoryChange?.(null)}
                  className={!selectedCategory ? 'bg-gray-100' : ''}
                >
                  All Categories
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => onCategoryChange?.(category.id)}
                    className={selectedCategory === category.id ? 'bg-gray-100' : ''}
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Date Range Preset */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center justify-between gap-2 px-3 py-2 border-[#8a8f9d] w-[180px] h-[38px]"
                  disabled={isLoading}
                >
                  <span className="text-sm font-medium text-black truncate">
                    {selectedPresetLabel}
                  </span>
                  <Calendar className="size-5 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                {DATE_PRESETS.map((preset) => (
                  <DropdownMenuItem
                    key={preset.value}
                    onClick={() => onDatePresetChange?.(preset.value)}
                    className={selectedDatePreset === preset.value ? 'bg-gray-100' : ''}
                  >
                    {preset.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
              {isLoading ? (
                <LineChartSkeleton />
              ) : (
                <LineChart data={documentsByMonth} />
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="size-3 rounded-full bg-[#4DB1D4]" />
              <span className="text-sm text-black">New Documents</span>
            </div>
          </div>

          {/* Pie Chart Section */}
          <div className="flex-1 max-w-[300px] shrink-0 flex flex-col min-h-0">
            <p className="text-sm text-black mb-2">Document Status</p>
            <div className="flex justify-center items-center flex-1 min-h-0">
              {isLoading ? (
                <PieChartSkeleton />
              ) : (
                <PieChart data={documentsByStatus} />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
