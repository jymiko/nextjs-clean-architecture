"use client";

import { useState, useMemo, useCallback } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { DashboardHeader } from "@/presentation/components/dashboard";
import {
  ReportFilters,
  ReportStatsCard,
  ReportDocumentsTable,
  DetailReportModal,
  TotalSubmissionsIcon,
  ActiveDocumentsIcon,
  ObsoleteDocumentsIcon,
  FilterState,
} from "@/presentation/components/reports";
import { Pagination } from "@/components/ui/pagination";
import { useReports, useReportFilters, type ReportFilters as ReportFiltersType } from "@/hooks/use-reports";
import { format } from "date-fns";

// Map API response to table format
interface ReportDocument {
  id: string;
  code: string;
  title: string;
  department: string;
  type: string;
  status: "active" | "obsolete";
  date: string;
  fileUrl?: string;
  fileName?: string;
}

export default function ReportDocumentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDocument, setSelectedDocument] = useState<ReportDocument | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    department: "",
    documentType: "",
    status: "",
    dateFrom: undefined,
    dateTo: undefined,
    search: "",
  });

  // Fetch filter options (departments and categories)
  const { options: filterOptions, isLoading: filtersLoading } = useReportFilters();

  // Build API filters from UI filters
  const apiFilters: ReportFiltersType = useMemo(() => ({
    search: filters.search || undefined,
    departmentId: filters.department || undefined,
    categoryId: filters.documentType || undefined,
    status: (filters.status as 'active' | 'obsolete' | 'all') || undefined,
    dateFrom: filters.dateFrom ? format(filters.dateFrom, 'yyyy-MM-dd') : undefined,
    dateTo: filters.dateTo ? format(filters.dateTo, 'yyyy-MM-dd') : undefined,
  }), [filters]);

  // Fetch reports data
  const {
    documents: apiDocuments,
    statistics,
    pagination,
    isLoading: reportsLoading,
  } = useReports({
    page: currentPage,
    limit: itemsPerPage,
    filters: apiFilters,
  });

  // Map API documents to table format
  const documents: ReportDocument[] = useMemo(() => {
    return apiDocuments.map((doc) => ({
      id: doc.id,
      code: doc.code,
      title: doc.title,
      department: doc.department,
      type: doc.type,
      status: doc.status,
      date: doc.date,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
    }));
  }, [apiDocuments]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when items per page change
  }, []);

  const handleViewDocument = useCallback((document: ReportDocument) => {
    setSelectedDocument(document);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedDocument(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#f9fbff] relative">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:ml-[280px] p-4 lg:p-6 flex flex-col gap-4 lg:gap-6 min-h-screen">
        {/* Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Report Documents"
        />

        {/* Filters Section */}
        <ReportFilters
          departments={filterOptions.departments}
          documentTypes={filterOptions.categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          isLoading={filtersLoading}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <ReportStatsCard
            title="Total Submission"
            value={statistics.total}
            icon={<TotalSubmissionsIcon />}
            valueColor="default"
          />
          <ReportStatsCard
            title="Active Documents"
            value={statistics.active}
            icon={<ActiveDocumentsIcon />}
            valueColor="success"
          />
          <ReportStatsCard
            title="Obsolete Documents"
            value={statistics.obsolete}
            icon={<ObsoleteDocumentsIcon />}
            valueColor="warning"
          />
        </div>

        {/* Documents Table */}
        <div className="flex flex-col">
          <ReportDocumentsTable
            documents={documents}
            onViewDocument={handleViewDocument}
            isLoading={reportsLoading}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            showItemsPerPage={true}
            showPageInfo={true}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <DetailReportModal
        document={selectedDocument}
        open={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
