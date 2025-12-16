"use client";

import { Search, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { format } from "date-fns";
import { responsiveCalendarClassNames, calendarPopoverClassName } from "@/lib/calendar-config";

interface DocumentType {
  id: string;
  name: string;
}

interface DraftDocumentFiltersProps {
  documentTypes?: DocumentType[];
  filters?: DraftFilterState;
  onFilterChange?: (filters: DraftFilterState) => void;
}

export interface DraftFilterState {
  documentType: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

const defaultDocumentTypes: DocumentType[] = [
  { id: "sop", name: "SOP" },
  { id: "standart", name: "Standart" },
  { id: "spesifikasi", name: "Spesifikasi" },
  { id: "wi", name: "WI" },
  { id: "policy", name: "Policy" },
  { id: "guideline", name: "Guideline" },
];

export function DraftDocumentFilters({
  documentTypes = defaultDocumentTypes,
  filters: externalFilters,
  onFilterChange,
}: DraftDocumentFiltersProps) {
  const [internalFilters, setInternalFilters] = useState<DraftFilterState>({
    documentType: "",
    search: "",
    dateFrom: "",
    dateTo: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  const filters = externalFilters || internalFilters;

  const updateFilter = (key: keyof DraftFilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    if (!externalFilters) {
      setInternalFilters(newFilters);
    }
    onFilterChange?.(newFilters);
  };

  const selectedTypeName = filters.documentType
    ? documentTypes.find((t) => t.id === filters.documentType)?.name || "All Type Documents"
    : "All Type Documents";

  // Parse date strings to Date objects
  const dateFromValue = filters.dateFrom ? new Date(filters.dateFrom) : undefined;
  const dateToValue = filters.dateTo ? new Date(filters.dateTo) : undefined;

  return (
    <div className="bg-white px-4 py-3">
      {/* Filter Row - Grid Layout Full Width */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        {/* Document Type Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full h-9 px-3 bg-white border border-[#e1e2e3] rounded text-sm text-[#384654] flex items-center justify-between"
          >
            <span className="truncate text-xs">{selectedTypeName}</span>
            <ChevronDown className="h-4 w-4 text-[#D946EF] shrink-0 ml-1" />
          </button>
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#e1e2e3] rounded shadow-lg z-20">
                <button
                  type="button"
                  onClick={() => {
                    updateFilter("documentType", "");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-[#384654] hover:bg-[#e9f5fe]"
                >
                  All Type Documents
                </button>
                {documentTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      updateFilter("documentType", type.id);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-[#384654] hover:bg-[#e9f5fe]"
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Date From - Using Shadcn Calendar with Radix CSS custom property */}
        <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-9 px-3 justify-between text-left font-normal border-[#e1e2e3] hover:bg-white"
            >
              <span className={`text-xs ${!dateFromValue ? "text-[#a0aec0]" : "text-[#384654]"}`}>
                {dateFromValue ? format(dateFromValue, "dd/MM/yyyy") : "Date From"}
              </span>
              <CalendarIcon className="h-4 w-4 text-[#D946EF]" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={calendarPopoverClassName} align="start">
            <Calendar
              mode="single"
              selected={dateFromValue}
              onSelect={(date) => {
                updateFilter("dateFrom", date ? format(date, "yyyy-MM-dd") : "");
                setDateFromOpen(false);
              }}
              initialFocus
              classNames={responsiveCalendarClassNames}
            />
          </PopoverContent>
        </Popover>

        {/* Date To - Using Shadcn Calendar with Radix CSS custom property */}
        <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-9 px-3 justify-between text-left font-normal border-[#e1e2e3] hover:bg-white"
            >
              <span className={`text-xs ${!dateToValue ? "text-[#a0aec0]" : "text-[#384654]"}`}>
                {dateToValue ? format(dateToValue, "dd/MM/yyyy") : "Date To"}
              </span>
              <CalendarIcon className="h-4 w-4 text-[#D946EF]" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={calendarPopoverClassName} align="start">
            <Calendar
              mode="single"
              selected={dateToValue}
              onSelect={(date) => {
                updateFilter("dateTo", date ? format(date, "yyyy-MM-dd") : "");
                setDateToOpen(false);
              }}
              initialFocus
              classNames={responsiveCalendarClassNames}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Search Row - Full Width */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a0aec0] pointer-events-none" />
        <Input
          placeholder="Search"
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="w-full pl-9 h-9 bg-white border-[#e1e2e3] text-sm focus-visible:ring-1 focus-visible:ring-[#e1e2e3] focus-visible:ring-offset-0 rounded"
        />
      </div>
    </div>
  );
}
