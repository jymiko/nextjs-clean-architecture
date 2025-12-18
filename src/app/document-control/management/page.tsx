"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import {
  DocumentManagementHeader,
  DocumentManagementFilters,
  DocumentManagementTable,
  DocumentViewerModal,
  RejectReasonModal,
  ManagementDocument,
  FilterState,
} from "@/presentation/components/document-management";
import { Pagination } from "@/components/ui/pagination";
import { useManagementDocuments, type ManagementDocumentFilters } from "@/hooks/use-management-documents";

export default function DocumentManagementPage() {
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
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ManagementDocument | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Build API filters from UI filters
  const apiFilters: ManagementDocumentFilters = useMemo(() => {
    return {
      search: filters.search || undefined,
      departmentId: filters.department || undefined,
      categoryId: filters.documentType || undefined,
      status: (filters.status as ManagementDocumentFilters['status']) || 'all',
    };
  }, [filters]);

  // Fetch documents from API
  const {
    documents: apiDocuments,
    pagination,
    statistics,
    isAdmin,
    isLoading,
    error,
    refetch
  } = useManagementDocuments({
    page: currentPage,
    limit: itemsPerPage,
    filters: apiFilters,
  });

  // Map API documents to ManagementDocument interface
  const documents: ManagementDocument[] = useMemo(() => {
    return apiDocuments.map(doc => ({
      id: doc.id,
      code: doc.code,
      title: doc.title,
      type: doc.type,
      department: doc.department,
      approvedDate: doc.approvedDate,
      distributedDate: doc.distributedDate || '',
      expiredDate: doc.expiredDate || '',
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

  const handleViewDocument = (document: ManagementDocument) => {
    setSelectedDocument(document);
    setViewerModalOpen(true);
  };

  const handleApproveDocument = (document: ManagementDocument) => {
    setSelectedDocument(document);
    setViewerModalOpen(true);
  };

  const handleApproveFromViewer = (document: ManagementDocument) => {
    // TODO: Implement API call to approve document
    console.log("Approving document:", document);
    setViewerModalOpen(false);
    setSelectedDocument(null);
  };

  const handleRejectFromViewer = (document: ManagementDocument) => {
    setViewerModalOpen(false);
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = (document: ManagementDocument, reason: string) => {
    // TODO: Implement API call to reject document with reason
    console.log("Rejecting document:", document, "Reason:", reason);
    setRejectModalOpen(false);
    setSelectedDocument(null);
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
          title="Document Management"
          subtitle="Digitize Your Archives with Maximum Speed and Security"
        />

        {/* Content Area */}
        <div className="flex flex-col gap-1.5 p-4 lg:p-0 lg:px-0">
          {/* Filters Section */}
          <div className="bg-white px-4 py-2">
            <DocumentManagementFilters
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
                <DocumentManagementTable
                  documents={documents}
                  onViewDocument={handleViewDocument}
                  onApproveDocument={handleApproveDocument}
                  isAdmin={isAdmin}
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
      <DocumentViewerModal
        open={viewerModalOpen}
        onOpenChange={setViewerModalOpen}
        document={selectedDocument}
        onApprove={handleApproveFromViewer}
        onReject={handleRejectFromViewer}
        isAdmin={isAdmin}
      />

      {/* Reject Reason Modal */}
      <RejectReasonModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        document={selectedDocument}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
}
