"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentManagementPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function DocumentManagementPagination({
  currentPage,
  totalPages,
  onPageChange,
}: DocumentManagementPaginationProps) {
  if (totalPages <= 0) return null;

  return (
    <div className="flex items-center justify-end gap-2 p-2.5">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-[#f7fafb] rounded-md"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="size-4 text-[#bdcedf]" />
      </Button>

      {/* Current Page */}
      <Button
        variant="default"
        size="icon"
        className="h-8 w-8 bg-[#00b3d8] hover:bg-[#00a0c2] text-white font-extrabold text-xs rounded-md"
      >
        {currentPage}
      </Button>

      {/* Next Button */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-[#f7fafb] rounded-md"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        <ChevronRight className="size-4 text-[#dce5ee]" />
      </Button>
    </div>
  );
}
