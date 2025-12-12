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

interface ReportPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (value: number) => void;
}

export function ReportPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: ReportPaginationProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const handleItemsPerPageChange = (value: string) => {
    onItemsPerPageChange?.(Number(value));
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 0) return null;

  return (
    <>
      {/* Desktop Pagination */}
      <div className="hidden lg:flex items-center justify-between px-4 lg:px-6 py-4 border-t border-[#e1e2e3]">
        {/* Items per page */}
        <div className="flex items-center gap-2">
          <span className="text-xs lg:text-sm text-[#384654]">Show</span>
          <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-[60px] lg:w-[70px] h-8 lg:h-9 text-xs lg:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs lg:text-sm text-[#384654]">entries</span>
        </div>

        {/* Page info */}
        <div className="text-xs lg:text-sm text-[#384654]">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} entries
        </div>

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
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Pagination */}
      <div className="flex lg:hidden flex-col items-center gap-3 px-4 py-4 border-t border-[#e1e2e3]">
        {/* Items per page - Mobile */}
        <div className="flex items-center justify-center gap-2 w-full">
          <span className="text-xs text-[#384654]">Show</span>
          <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-[60px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-[#384654]">entries</span>
        </div>

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
            Page {currentPage} of {totalPages || 1}
          </span>

          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-9 px-4 text-xs"
          >
            Next
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>

        {/* Info */}
        <span className="text-xs text-[#6b7280]">
          Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems}
        </span>
      </div>
    </>
  );
}
