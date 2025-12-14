"use client";

import { useState, useMemo } from "react";
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

// Mock data for Documents Validation
const mockValidationDocuments: ValidationDocument[] = [
  {
    id: "1",
    code: "SOP-DT-001-003",
    title: "Digitalisasi Arsip Kepegawaian",
    type: "SOP",
    department: "Digital Transformation",
    createdBy: "Digital Transformation",
    submissionDate: "Fri, 17 Jun 2025",
    status: "waiting_validation" as DocumentStatus,
    approver: "Gilang Prakasa",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "2",
    code: "STANDART-WH-103-002",
    title: "Dokumen Operasional",
    type: "Standart",
    department: "Warehouse",
    createdBy: "Warehouse",
    submissionDate: "Thu, 23 Feb 2025",
    status: "waiting_validation" as DocumentStatus,
    approver: "Febrianti Utami",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "3",
    code: "SPEK-PDI-RM-003-004",
    title: "Manual Mutu dan Keamanan Pangan",
    type: "Spesifikasi",
    department: "Food Safety",
    createdBy: "Food Safety",
    submissionDate: "Mon, 12 Feb 2025",
    status: "waiting_validation" as DocumentStatus,
    approver: "Susan Hidayati",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "4",
    code: "WI-EHS-008-001",
    title: "Penanganan dan Pembuangan Limbah Kimia",
    type: "WI",
    department: "Environment, Health and Safety",
    createdBy: "Environment, Health and Safety",
    submissionDate: "Tue, 10 Jan 2025",
    status: "waiting_validation" as DocumentStatus,
    approver: "Dwi Cahyo Utomo",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
];

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

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Filter documents based on current filters
  const filteredDocuments = useMemo(() => {
    return mockValidationDocuments.filter((doc) => {
      // Document type filter
      if (filters.documentType) {
        const typeMap: Record<string, string> = {
          sop: "SOP",
          standart: "Standart",
          spesifikasi: "Spesifikasi",
          wi: "WI",
        };
        if (doc.type !== typeMap[filters.documentType]) {
          return false;
        }
      }

      // Status filter
      if (filters.status && doc.status !== filters.status) {
        return false;
      }

      // Search filter (searches in code and title)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !doc.code.toLowerCase().includes(searchLower) &&
          !doc.title.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

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

  const handleApproveFromViewer = () => {
    // TODO: Implement API call to approve document
    console.log("Approving document:", selectedDocument);
    setViewerModalOpen(false);
    setSelectedDocument(null);
  };

  const handleRejectFromViewer = () => {
    setViewerModalOpen(false);
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = (_document: unknown, reason: string) => {
    // TODO: Implement API call to reject document with reason
    console.log("Rejecting document:", selectedDocument, "Reason:", reason);
    setRejectModalOpen(false);
    setSelectedDocument(null);
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
              documents={paginatedDocuments}
              onViewDocument={handleViewDocument}
              onApproveDocument={handleApproveDocument}
              onEditDocument={handleEditDocument}
              onDeleteDocument={handleDeleteDocument}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredDocuments.length}
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
