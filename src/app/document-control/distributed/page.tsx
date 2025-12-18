"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { DocumentManagementHeader } from "@/presentation/components/document-management/DocumentManagementHeader";
import {
  DistributedDocumentStats,
  DistributedDocumentFilters,
  DistributedDocumentTable,
  DistributedDocument,
  FilterState,
} from "@/presentation/components/distributed-document";
import { Pagination } from "@/components/ui/pagination";
import {
  DocumentViewerModal,
} from "@/presentation/components/document-management";
import { useDistributedDocuments, type DistributedDocumentFilters as ApiFilters } from "@/hooks/use-distributed-documents";

export default function DistributedDocumentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    department: "",
    documentType: "",
    status: "",
    dateFrom: undefined,
    dateTo: undefined,
    search: "",
  });

  // Modal states
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DistributedDocument | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Build API filters from UI filters
  const apiFilters: ApiFilters = useMemo(() => {
    return {
      search: filters.search || undefined,
      departmentId: filters.department || undefined,
      categoryId: filters.documentType || undefined,
      status: (filters.status as ApiFilters['status']) || 'all',
    };
  }, [filters]);

  // Fetch documents from API
  const {
    documents: apiDocuments,
    pagination,
    statistics,
    isLoading,
    error,
    refetch
  } = useDistributedDocuments({
    page: currentPage,
    limit: itemsPerPage,
    filters: apiFilters,
  });

  // Map API documents to DistributedDocument interface
  const documents: DistributedDocument[] = useMemo(() => {
    return apiDocuments.map(doc => ({
      id: doc.id,
      code: doc.code,
      title: doc.title,
      type: doc.type,
      originDepartment: doc.originDepartment,
      documentBy: doc.documentBy,
      distributedDate: doc.distributedDate || '',
      status: doc.status,
      pdfUrl: doc.pdfUrl || '',
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

  const handleViewDocument = (document: DistributedDocument) => {
    setSelectedDocument(document);
    setViewerModalOpen(true);
  };

  const handleEditDocument = (document: DistributedDocument) => {
    // TODO: Implement edit functionality for obsolete request
    console.log("Edit document:", document);
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
          title="Distributed Documents"
          subtitle="View documents distributed to your department"
        />

        {/* Content Area */}
        <div className="flex flex-col gap-1.5 p-4 lg:p-0 lg:px-0">
          {/* Filters Section */}
          <div className="bg-white px-4 py-2">
            <DistributedDocumentFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Stats Section */}
          <DistributedDocumentStats
            totalDocuments={statistics.total}
            approvedDocuments={statistics.active}
            pendingDocuments={statistics.obsoleteRequest}
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
                <DistributedDocumentTable
                  documents={documents}
                  onViewDocument={handleViewDocument}
                  onEditDocument={handleEditDocument}
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
            department: selectedDocument.originDepartment,
            distributedDate: selectedDocument.distributedDate,
            expiredDate: "",
            status: selectedDocument.status,
            pdfUrl: selectedDocument.pdfUrl,
          }}
          isAdmin={false}
        />
      )}
    </div>
  );
}
