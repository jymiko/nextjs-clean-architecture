"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  onItemsPerPageChange?: (value: number) => void;
  showItemsPerPage?: boolean;
  showPageInfo?: boolean;
  itemsPerPageOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showPageInfo = true,
  itemsPerPageOptions = [5, 10, 25, 50],
  className = "",
}: PaginationProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const handleItemsPerPageChange = (value: string) => {
    onItemsPerPageChange?.(Number(value));
  };

  // Always show pagination, even with no data (shows "0 entries")
  const effectiveTotalPages = Math.max(totalPages, 1);

  const getVisiblePages = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (effectiveTotalPages <= 5) {
      for (let i = 1; i <= effectiveTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(effectiveTotalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < effectiveTotalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (!pages.includes(effectiveTotalPages)) {
        pages.push(effectiveTotalPages);
      }
    }

    return pages;
  };

  return (
    <>
      {/* Desktop Pagination */}
      <div className={`hidden lg:flex items-center justify-between px-4 lg:px-6 py-4 border-t border-[#e1e2e3] ${className}`}>
        {/* Items per page */}
        {showItemsPerPage && onItemsPerPageChange ? (
          <div className="flex items-center gap-2">
            <span className="text-xs lg:text-sm text-[#384654]">Show</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[60px] lg:w-[70px] h-8 lg:h-9 text-xs lg:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs lg:text-sm text-[#384654]">entries</span>
          </div>
        ) : (
          <div />
        )}

        {/* Page info */}
        {showPageInfo ? (
          <div className="text-xs lg:text-sm text-[#384654]">
            {totalItems === 0
              ? "Showing 0 of 0 entries"
              : `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`
            }
          </div>
        ) : (
          <div />
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 lg:h-9 lg:w-9"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="size-4" />
          </Button>

          {/* Page numbers */}
          {getVisiblePages().map((page, index) => (
            <Button
              key={index}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              className={`h-8 w-8 lg:h-9 lg:w-9 text-xs lg:text-sm ${
                currentPage === page
                  ? "bg-[#4db1d4] hover:bg-[#3a9fc2]"
                  : ""
              } ${page === "..." ? "pointer-events-none" : ""}`}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 lg:h-9 lg:w-9"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === effectiveTotalPages || totalItems === 0}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Pagination */}
      <div className={`flex lg:hidden flex-col items-center gap-3 px-4 py-4 border-t border-[#e1e2e3] ${className}`}>
        {/* Items per page - Mobile */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center justify-center gap-2 w-full">
            <span className="text-xs text-[#384654]">Show</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[60px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-[#384654]">entries</span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-9 px-4 text-xs"
          >
            <ChevronLeft className="size-4 mr-1" />
            Prev
          </Button>

          <span className="text-sm font-medium text-[#384654]">
            Page {currentPage} of {effectiveTotalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === effectiveTotalPages || totalItems === 0}
            className="h-9 px-4 text-xs"
          >
            Next
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>

        {/* Info */}
        {showPageInfo && (
          <span className="text-xs text-[#6b7280]">
            {totalItems === 0
              ? "Showing 0 of 0"
              : `Showing ${startIndex + 1}-${endIndex} of ${totalItems}`
            }
          </span>
        )}
      </div>
    </>
  );
}
