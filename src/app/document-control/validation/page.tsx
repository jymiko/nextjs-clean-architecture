"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/presentation/components/Sidebar";
import {
  DocumentValidationHeader,
  DocumentValidationFilters,
  DocumentValidationTable,
  ValidationDocument,
  ValidationFilterState,
} from "@/presentation/components/document-validation";
import { Pagination } from "@/components/ui/pagination";
import { DocumentStatus } from "@/presentation/components/reports/DocumentStatusBadge";
import {
  DocumentViewerModal,
  RejectReasonModal,
} from "@/presentation/components/document-management";

export default function DocumentValidationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ValidationFilterState>({
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
  const [selectedDocument, setSelectedDocument] = useState<ValidationDocument | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for fetched documents
  const [documents, setDocuments] = useState<ValidationDocument[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Fetch validation documents from API
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: "WAITING_VALIDATION",
      });

      if (filters.search) params.set("search", filters.search);
      if (filters.documentType) params.set("documentType", filters.documentType);

      const response = await fetch(`/api/documents/submission?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Failed to fetch");

      const mappedDocs = (result.data || []).map((doc: {
        id: string;
        code: string;
        title: string;
        type: string;
        createdBy: string;
        submissionDate: string;
        status: string;
        approver: string;
      }) => ({
        id: doc.id,
        code: doc.code,
        title: doc.title,
        type: doc.type,
        department: doc.createdBy,
        createdBy: doc.createdBy,
        submissionDate: doc.submissionDate,
        status: doc.status as DocumentStatus,
        approver: doc.approver,
        pdfUrl: undefined,
      }));

      setDocuments(mappedDocs);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalItems(result.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch validation documents:", error);
      toast.error("Failed to fetch documents");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, filters.search, filters.documentType]);

  // Fetch documents on mount and when dependencies change
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFilterChange = (newFilters: ValidationFilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleViewDocument = (document: ValidationDocument) => {
    setSelectedDocument(document);
    setViewerModalOpen(true);
  };

  const handleApproveDocument = (document: ValidationDocument) => {
    setSelectedDocument(document);
    setViewerModalOpen(true);
  };

  const handleEditDocument = (document: ValidationDocument) => {
    // TODO: Implement edit document functionality
    console.log("Edit document:", document);
  };

  const handleDeleteDocument = (document: ValidationDocument) => {
    // TODO: Implement delete document functionality
    console.log("Delete document:", document);
  };

  const handleApproveFromViewer = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve");
      }

      toast.success("Document validated and approved successfully");
      setViewerModalOpen(false);
      setSelectedDocument(null);
      fetchDocuments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve document");
    }
  };

  const handleRejectFromViewer = () => {
    setViewerModalOpen(false);
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (_document: unknown, reason: string) => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", comments: reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject");
      }

      toast.success("Document rejected. Creator has been notified.");
      setRejectModalOpen(false);
      setSelectedDocument(null);
      fetchDocuments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject document");
    }
  };

  // Convert ValidationDocument to ManagementDocument for the viewer modal
  const convertToManagementDocument = (doc: ValidationDocument | null) => {
    if (!doc) return null;
    return {
      id: doc.id,
      code: doc.code,
      title: doc.title,
      type: doc.type,
      department: doc.department,
      distributedDate: doc.submissionDate,
      expiredDate: doc.submissionDate,
      status: doc.status,
      pdfUrl: doc.pdfUrl,
    };
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
        <DocumentValidationHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Documents Validation"
          subtitle="Documents awaiting final verification and distribution"
        />

        {/* Content Area */}
        <div className="flex flex-col gap-1.5 p-4 lg:p-0 lg:px-0">
          {/* Filters Section */}
          <div className="bg-white px-4 py-2">
            <DocumentValidationFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Documents Table */}
          <div className="bg-white px-4 py-2">
            <DocumentValidationTable
              documents={documents}
              isLoading={isLoading}
              onViewDocument={handleViewDocument}
              onApproveDocument={handleApproveDocument}
              onEditDocument={handleEditDocument}
              onDeleteDocument={handleDeleteDocument}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              showItemsPerPage={true}
              showPageInfo={true}
            />
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        open={viewerModalOpen}
        onOpenChange={setViewerModalOpen}
        document={convertToManagementDocument(selectedDocument)}
        onApprove={handleApproveFromViewer}
        onReject={handleRejectFromViewer}
        isAdmin={true}
      />

      {/* Reject Reason Modal */}
      <RejectReasonModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        document={convertToManagementDocument(selectedDocument)}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
}
