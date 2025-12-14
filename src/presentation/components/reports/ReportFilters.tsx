"use client";

import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
}

interface DocumentType {
  id: string;
  name: string;
}

interface ReportFiltersProps {
  departments?: Department[];
  documentTypes?: DocumentType[];
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
  isLoading?: boolean;
}

export interface FilterState {
  department: string;
  documentType: string;
  status: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  search: string;
}

export function ReportFilters({
  departments = [],
  documentTypes = [],
  filters: externalFilters,
  onFilterChange,
  isLoading = false,
}: ReportFiltersProps) {
  const [internalFilters, setInternalFilters] = useState<FilterState>({
    department: "",
    documentType: "",
    status: "",
    dateFrom: undefined,
    dateTo: undefined,
    search: "",
  });

  const filters = externalFilters || internalFilters;

  const updateFilter = (key: keyof FilterState, value: string | Date | undefined) => {
    const newFilters = { ...filters, [key]: value };
    if (!externalFilters) {
      setInternalFilters(newFilters);
    }
    onFilterChange?.(newFilters);
  };

  return (
    <div className="bg-[#e9f5fe] p-4 rounded-md">
      <div className="flex flex-col gap-3">
        {/* First Row - Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Department Select */}
          <Select
            value={filters.department || "all"}
            onValueChange={(value) => updateFilter("department", value === "all" ? "" : value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full h-11 bg-white border-[#e1e2e3] text-base text-[#384654]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="loading" disabled>
                  {isLoading ? "Loading..." : "No departments available"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* Document Type Select */}
          <Select
            value={filters.documentType || "all"}
            onValueChange={(value) => updateFilter("documentType", value === "all" ? "" : value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full h-11 bg-white border-[#e1e2e3] text-base text-[#384654]">
              <SelectValue placeholder="All Type Documents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Type Documents</SelectItem>
              {documentTypes.length > 0 ? (
                documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="loading" disabled>
                  {isLoading ? "Loading..." : "No document types available"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* Status Select */}
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => updateFilter("status", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full h-11 bg-white border-[#e1e2e3] text-base text-[#384654]">
              <SelectValue placeholder="All Status Documents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status Documents</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="obsolete">Obsolete</SelectItem>
            </SelectContent>
          </Select>

          {/* Date From */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-11 justify-between bg-white border-[#e1e2e3] text-base font-normal",
                  filters.dateFrom ? "text-[#384654]" : "text-[#a0aec0]"
                )}
              >
                {filters.dateFrom ? format(filters.dateFrom, "dd MMM yyyy") : "Date From"}
                <Calendar className="h-5 w-5 text-[#a0aec0]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" sideOffset={4}>
              <CalendarComponent
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => updateFilter("dateFrom", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Date To */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-11 justify-between bg-white border-[#e1e2e3] text-base font-normal",
                  filters.dateTo ? "text-[#384654]" : "text-[#a0aec0]"
                )}
              >
                {filters.dateTo ? format(filters.dateTo, "dd MMM yyyy") : "Date To"}
                <Calendar className="h-5 w-5 text-[#a0aec0]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" sideOffset={4}>
              <CalendarComponent
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => updateFilter("dateTo", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Second Row - Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#a0aec0] pointer-events-none" />
          <Input
            placeholder="Search"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 h-11 bg-white border-[#e1e2e3] text-base focus-visible:ring-1 focus-visible:ring-[#e1e2e3] focus-visible:ring-offset-0"
          />
        </div>
      </div>
    </div>
  );
}
