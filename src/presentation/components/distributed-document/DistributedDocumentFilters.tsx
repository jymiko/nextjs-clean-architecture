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
import { responsiveCalendarClassNames, calendarPopoverClassName } from "@/lib/calendar-config";

interface Department {
  id: string;
  name: string;
}

interface DocumentType {
  id: string;
  name: string;
}

interface DistributedDocumentFiltersProps {
  departments?: Department[];
  documentTypes?: DocumentType[];
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  department: string;
  documentType: string;
  status: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  search: string;
}

const defaultDepartments: Department[] = [
  { id: "digital-transformation", name: "Digital Transformation" },
  { id: "warehouse", name: "Warehouse" },
  { id: "food-safety", name: "Food Safety" },
  { id: "ehs", name: "Environment, Health and Safety" },
  { id: "hr", name: "Human Resources" },
  { id: "finance", name: "Finance" },
  { id: "operations", name: "Operations" },
];

const defaultDocumentTypes: DocumentType[] = [
  { id: "sop", name: "SOP" },
  { id: "standart", name: "Standart" },
  { id: "spesifikasi", name: "Spesifikasi" },
  { id: "wi", name: "WI" },
  { id: "policy", name: "Policy" },
  { id: "guideline", name: "Guideline" },
];

export function DistributedDocumentFilters({
  departments = defaultDepartments,
  documentTypes = defaultDocumentTypes,
  filters: externalFilters,
  onFilterChange,
}: DistributedDocumentFiltersProps) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Department Select */}
          <Select
            value={filters.department || "all"}
            onValueChange={(value) => updateFilter("department", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full h-11 bg-white border-[#e1e2e3] text-sm text-[#384654] rounded">
              <SelectValue placeholder="All Departements" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departements</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Document Type Select */}
          <Select
            value={filters.documentType || "all"}
            onValueChange={(value) => updateFilter("documentType", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full h-11 bg-white border-[#e1e2e3] text-sm text-[#384654] rounded">
              <SelectValue placeholder="All Type Documents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Type Documents</SelectItem>
              {documentTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Select */}
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => updateFilter("status", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full h-11 bg-white border-[#e1e2e3] text-sm text-[#384654] rounded">
              <SelectValue placeholder="All Status Documents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status Documents</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="obsolete_request">Obsolete Request</SelectItem>
              <SelectItem value="obsolete">Obsolete</SelectItem>
            </SelectContent>
          </Select>

          {/* Date From */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-11 justify-between bg-white border-[#e1e2e3] text-sm font-normal rounded",
                  filters.dateFrom ? "text-[#384654]" : "text-[#a0aec0]"
                )}
              >
                {filters.dateFrom ? format(filters.dateFrom, "dd MMM yyyy") : "Date From"}
                <Calendar className="h-4 w-4 text-[#D946EF]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className={calendarPopoverClassName} align="start">
              <CalendarComponent
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => updateFilter("dateFrom", date)}
                initialFocus
                classNames={responsiveCalendarClassNames}
                showMonthYearDropdown
              />
            </PopoverContent>
          </Popover>

          {/* Date To */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-11 justify-between bg-white border-[#e1e2e3] text-sm font-normal rounded",
                  filters.dateTo ? "text-[#384654]" : "text-[#a0aec0]"
                )}
              >
                {filters.dateTo ? format(filters.dateTo, "dd MMM yyyy") : "Date To"}
                <Calendar className="h-4 w-4 text-[#D946EF]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className={calendarPopoverClassName} align="start">
              <CalendarComponent
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => updateFilter("dateTo", date)}
                initialFocus
                classNames={responsiveCalendarClassNames}
                showMonthYearDropdown
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
            className="pl-10 h-11 bg-white border-[#e1e2e3] text-sm focus-visible:ring-1 focus-visible:ring-[#e1e2e3] focus-visible:ring-offset-0 rounded"
          />
        </div>
      </div>
    </div>
  );
}
