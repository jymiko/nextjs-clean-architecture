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
import { DocumentStatus } from "@/presentation/components/reports/DocumentStatusBadge";

// Mock data for User role (with Department column)
// pdfUrl bisa berupa:
// 1. URL langsung: "https://api.example.com/documents/123/file.pdf"
// 2. URL dengan auth: akan di-fetch dengan token di header
// 3. Local file: "/documents/sample.pdf"
const mockUserDocuments: ManagementDocument[] = [
  {
    id: "1",
    code: "SOP-DT-001-002",
    title: "Digitalisasi Arsip Kepegawaian",
    type: "SOP",
    department: "Digital Transformation",
    distributedDate: "Mon, 17 Jun 2024",
    expiredDate: "Fri, 17 Jun 2025",
    status: "active" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf", // Contoh: local file
  },
  {
    id: "2",
    code: "STANDART-WH-003-002",
    title: "Dokumen Operasional",
    type: "Standart",
    department: "Warehouse",
    distributedDate: "Tue, 23 Feb 2024",
    expiredDate: "Thu, 23 Feb 2025",
    status: "pending_obsolete_approval" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf", // Contoh: dari API nanti
  },
  {
    id: "3",
    code: "SPEK-PDI-RM-003-002",
    title: "Manual Mutu dan Keamanan Pangan",
    type: "Spesifikasi",
    department: "Food Safety",
    distributedDate: "Fri, 12 Feb 2024",
    expiredDate: "Mon, 12 Feb 2025",
    status: "active" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "4",
    code: "WI-EHS-004-001",
    title: "Penanganan dan Pembuangan Limbah Kimia",
    type: "WI",
    department: "Environment, Health and Safety",
    distributedDate: "Wed, 10 Jan 2024",
    expiredDate: "Tue, 10 Jan 2025",
    status: "expiring_soon" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
];

// Mock data for Admin role (with Approved Date column)
const mockAdminDocuments: ManagementDocument[] = [
  {
    id: "1",
    code: "SOP-DT-001-002",
    title: "Digitalisasi Arsip Kepegawaian",
    type: "SOP",
    approvedDate: "Fri, 17 Jun 2025",
    distributedDate: "Wed, 17 Jun 2025",
    expiredDate: "Fri, 17 Jun 2025",
    status: "pending_obsolete_approval" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "2",
    code: "STANDART-DT-001-001",
    title: "Dokumen Operasional",
    type: "Standart",
    approvedDate: "Thu, 23 Feb 2025",
    distributedDate: "Fri, 23 Feb 2024",
    expiredDate: "Thu, 23 Feb 2025",
    status: "active" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "3",
    code: "SPEK-DT-RM-001-004",
    title: "Manual Mutu dan Keamanan Pangan",
    type: "Spesifikasi",
    approvedDate: "Mon, 12 Feb 2025",
    distributedDate: "Tue, 12 Feb 2025",
    expiredDate: "Mon, 12 Feb 2025",
    status: "pending_obsolete_approval" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "4",
    code: "WI-DT-001-003",
    title: "Penanganan dan Pembuangan Limbah Kimia",
    type: "WI",
    approvedDate: "Tue, 10 Jan 2025",
    distributedDate: "Thu, 10 Jan 2024",
    expiredDate: "Tue, 10 Jan 2025",
    status: "expiring_soon" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
];

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

  // For demo purposes, this should come from auth context in real app
  // Set to true to show Admin view, false for User view
  const isAdmin = true;

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Select data based on role
  const mockDocuments = isAdmin ? mockAdminDocuments : mockUserDocuments;

  // Filter documents based on current filters
  const filteredDocuments = useMemo(() => {
    return mockDocuments.filter((doc) => {
      // Department filter (only for user role)
      if (!isAdmin && filters.department && doc.department) {
        const deptMap: Record<string, string> = {
          "digital-transformation": "Digital Transformation",
          "warehouse": "Warehouse",
          "food-safety": "Food Safety",
          "ehs": "Environment, Health and Safety",
          "hr": "Human Resources",
          "finance": "Finance",
          "operations": "Operations",
        };
        if (doc.department !== deptMap[filters.department]) {
          return false;
        }
      }

      // Document type filter
      if (filters.documentType) {
        const typeMap: Record<string, string> = {
          "sop": "SOP",
          "standart": "Standart",
          "spesifikasi": "Spesifikasi",
          "wi": "WI",
          "policy": "Policy",
          "guideline": "Guideline",
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
  }, [filters, mockDocuments, isAdmin]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

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
            <DocumentManagementTable
              documents={paginatedDocuments}
              onViewDocument={handleViewDocument}
              onApproveDocument={handleApproveDocument}
              isAdmin={isAdmin}
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
