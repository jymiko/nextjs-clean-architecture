"use client";

import { Search, Plus, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface DocumentType {
  id: string;
  name: string;
}

interface DraftDocumentFiltersProps {
  documentTypes?: DocumentType[];
  filters?: DraftFilterState;
  onFilterChange?: (filters: DraftFilterState) => void;
  onAddDocument?: () => void;
}

export interface DraftFilterState {
  documentType: string;
  search: string;
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
  onAddDocument,
}: DraftDocumentFiltersProps) {
  const [internalFilters, setInternalFilters] = useState<DraftFilterState>({
    documentType: "",
    search: "",
  });

  const filters = externalFilters || internalFilters;

  const updateFilter = (key: keyof DraftFilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    if (!externalFilters) {
      setInternalFilters(newFilters);
    }
    onFilterChange?.(newFilters);
  };

  return (
    <div className="bg-white px-4 py-2">
      <div className="bg-[#e9f5fe] p-4 rounded-md">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Document Type Select */}
          <Select
            value={filters.documentType || "all"}
            onValueChange={(value) => updateFilter("documentType", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full sm:w-[200px] h-11 bg-white border-[#e1e2e3] text-sm text-[#384654] rounded">
              <SelectValue placeholder="All Type Documents" />
              <ChevronDown className="h-5 w-5 opacity-50" />
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

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#a0aec0] pointer-events-none" />
            <Input
              placeholder="Search by code or title"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10 h-11 bg-white border-[#e1e2e3] text-sm focus-visible:ring-1 focus-visible:ring-[#e1e2e3] focus-visible:ring-offset-0 rounded"
            />
          </div>

          {/* Add Button */}
          <Button
            onClick={onAddDocument}
            className="h-11 bg-[#4DB1D4] hover:bg-[#3da0bf] text-white shadow-[0px_6px_12px_0px_rgba(10,141,208,0.2)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
