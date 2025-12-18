"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { DocumentManagementHeader } from "@/presentation/components/document-management/DocumentManagementHeader";
import {
  ObsoleteDocumentFilters,
  ObsoleteDocumentTable,
  ObsoleteDocument,
  FilterState,
} from "@/presentation/components/obsolete-document";
import { Pagination } from "@/components/ui/pagination";
import {
  DocumentViewerModal,
} from "@/presentation/components/document-management";
import { useObsoleteDocuments, type ObsoleteDocumentFilters as ApiFilters } from "@/hooks/use-obsolete-documents";

export default function ObsoleteDocumentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    department: "",
    documentType: "",
    dateFrom: undefined,
    dateTo: undefined,
    search: "",
  });

  // Modal states
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ObsoleteDocument | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Build API filters from UI filters
  const apiFilters: ApiFilters = useMemo(() => {
    return {
      search: filters.search || undefined,
      departmentId: filters.department || undefined,
      categoryId: filters.documentType || undefined,
      dateFrom: filters.dateFrom ? filters.dateFrom.toISOString() : undefined,
      dateTo: filters.dateTo ? filters.dateTo.toISOString() : undefined,
    };
  }, [filters]);

  // Fetch documents from API
  const {
    documents: apiDocuments,
    pagination,
    isLoading,
    error,
    refetch
  } = useObsoleteDocuments({
    page: currentPage,
    limit: itemsPerPage,
    filters: apiFilters,
  });

  // Map API documents to ObsoleteDocument interface
  const documents: ObsoleteDocument[] = useMemo(() => {
    return apiDocuments.map(doc => ({
      id: doc.id,
      code: doc.code,
      title: doc.title,
      type: doc.type,
      department: doc.department,
      createdBy: doc.createdBy,
      effectiveDate: doc.effectiveDate,
      obsoleteDate: doc.obsoleteDate,
      remarks: doc.remarks,
      pdfUrl: doc.pdfUrl,
    }));
  }, [apiDocuments]);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleViewDocument = (document: ObsoleteDocument) => {
    setSelectedDocument(document);
    setViewerModalOpen(true);
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
          title="Obsolete Documents"
          subtitle="View and manage obsolete documents in the system"
        />

        {/* Content Area */}
        <div className="flex flex-col gap-1.5 p-4 lg:p-0 lg:px-0">
          {/* Filters Section */}
          <div className="bg-white px-4 py-2">
            <ObsoleteDocumentFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

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
                <ObsoleteDocumentTable
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

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewerModal
          open={viewerModalOpen}
          onOpenChange={setViewerModalOpen}
          document={{
            id: selectedDocument.id,
            code: selectedDocument.code,
            title: selectedDocument.title,
            type: selectedDocument.type,
            department: selectedDocument.department,
            distributedDate: selectedDocument.effectiveDate,
            expiredDate: selectedDocument.obsoleteDate,
            status: "obsolete",
            pdfUrl: selectedDocument.pdfUrl,
          }}
          isAdmin={false}
        />
      )}
    </div>
  );
}
