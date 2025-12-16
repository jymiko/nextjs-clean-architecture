"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

interface DocumentSubmissionFiltersProps {
  documentTypes?: DocumentType[];
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  documentType: string;
  status: string;
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

// Draft status removed - drafts have their own page at /document-control/draft
const submissionStatuses = [
  { id: "on_review", name: "On Review" },
  { id: "on_approval", name: "On Approval" },
  { id: "revision_by_reviewer", name: "Revision by Reviewer" },
  { id: "pending_ack", name: "Pending Ack" },
  { id: "approved", name: "Approved" },
  { id: "rejected", name: "Rejected" },
];

export function DocumentSubmissionFilters({
  documentTypes = defaultDocumentTypes,
  filters: externalFilters,
  onFilterChange,
}: DocumentSubmissionFiltersProps) {
  const [internalFilters, setInternalFilters] = useState<FilterState>({
    documentType: "",
    status: "",
    search: "",
  });

  const filters = externalFilters || internalFilters;

  const updateFilter = (key: keyof FilterState, value: string) => {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Document Type Select */}
          <Select
            value={filters.documentType || "all"}
            onValueChange={(value) => updateFilter("documentType", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full h-11 bg-white border-[#e1e2e3] text-sm text-[#384654] rounded">
              <SelectValue placeholder="All Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Type</SelectItem>
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
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {submissionStatuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
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
    </div>
  );
}
