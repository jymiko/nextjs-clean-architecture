"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { DocumentManagementHeader } from "@/presentation/components/document-management/DocumentManagementHeader";
import { Pagination } from "@/components/ui/pagination";
import {
  RequestDocumentStats,
  RequestDocumentFilters,
  RequestDocumentTable,
  type RequestDocument,
  type FilterState,
} from "@/presentation/components/request-document";
import { useDocumentRequests, type DocumentRequestFilters } from "@/hooks/use-document-requests";

export default function RequestDocumentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    documentType: "",
    status: "",
    search: "",
  });

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Build API filters from UI filters
  const apiFilters: DocumentRequestFilters = useMemo(() => {
    return {
      search: filters.search || undefined,
      categoryId: filters.documentType || undefined,
      status: (filters.status as DocumentRequestFilters['status']) || 'all',
    };
  }, [filters]);

  // Fetch requests from API
  const {
    requests: apiRequests,
    pagination,
    statistics,
    isLoading,
    error,
    refetch
  } = useDocumentRequests({
    page: currentPage,
    limit: itemsPerPage,
    filters: apiFilters,
  });

  // Map API requests to RequestDocument interface
  const documents: RequestDocument[] = useMemo(() => {
    return apiRequests.map(req => ({
      id: req.id,
      requestCode: req.requestCode,
      documentCode: req.documentCode,
      documentTitle: req.documentTitle,
      type: req.type,
      requestBy: req.requestBy,
      requestByPosition: req.requestByPosition,
      ownedBy: req.ownedBy,
      requestDate: req.requestDate,
      status: req.status,
      remarks: req.remarks,
    }));
  }, [apiRequests]);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleViewDocument = (document: RequestDocument) => {
    console.log("View document:", document);
    // TODO: Implement view document modal
  };

  const handleAddDocument = () => {
    console.log("Add new document");
    // TODO: Implement add document modal
  };

  return (
    <div className="min-h-screen bg-[#f9fbff] relative">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        defaultExpandedItems={["document-control"]}
      />

      {/* Main Content */}
      <div className="lg:ml-[280px] flex flex-col gap-1.5 min-h-screen">
        {/* Header */}
        <DocumentManagementHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Request Documents"
          subtitle="Submit and Manage request for Documents owned by other departements"
        />

        {/* Content Area */}
        <div className="flex flex-col gap-1.5 p-4 lg:p-0 lg:px-0">
          {/* Filters Section */}
          <RequestDocumentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onAddDocument={handleAddDocument}
          />

          {/* Stats Section */}
          <RequestDocumentStats
            totalDocuments={statistics.total}
            approvedDocuments={statistics.approved}
            pendingDocuments={statistics.pending}
          />

          {/* Documents Table */}
          <div className="bg-white px-4 py-2">
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <RequestDocumentTable
                  documents={documents}
                  onViewDocument={handleViewDocument}
                  isLoading={isLoading}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
