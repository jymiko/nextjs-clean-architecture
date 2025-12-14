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
import { DocumentStatus } from "@/presentation/components/reports/DocumentStatusBadge";

// Mock data for distributed documents
const mockDistributedDocuments: DistributedDocument[] = [
  {
    id: "1",
    code: "SOP-DT-001-003",
    title: "Digitalisasi Arsip Kepegawaian",
    type: "SOP",
    originDepartment: "Digital Transformation",
    documentBy: "Firdiyatus Sholihah",
    distributedDate: "Fri, 17 Jun 2025",
    status: "active" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "2",
    code: "STANDART-WH-011-005",
    title: "Dokumen Operasional",
    type: "Standart",
    originDepartment: "Warehouse",
    documentBy: "Sanusi",
    distributedDate: "Thu, 23 Feb 2025",
    status: "obsolete_request" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "3",
    code: "SPEK-PDI-RM-001-002",
    title: "Manual Mutu dan Keamanan Pangan",
    type: "Spesifikasi",
    originDepartment: "Food Safety",
    documentBy: "Handoko",
    distributedDate: "Mon, 12 Feb 2025",
    status: "active" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "4",
    code: "WI-EHS-002-006-001",
    title: "Penanganan dan Pembuangan Limbah Kimia",
    type: "WI",
    originDepartment: "Environment, Health and Safety",
    documentBy: "Kaluna",
    distributedDate: "Tue, 10 Jan 2025",
    status: "active" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "5",
    code: "WI-EHS-002-006-002",
    title: "Penanganan dan Pembuangan Limbah Kimia",
    type: "WI",
    originDepartment: "Environment, Health and Safety",
    documentBy: "Kaluna",
    distributedDate: "Tue, 10 Jan 2025",
    status: "active" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "6",
    code: "WI-EHS-002-006-003",
    title: "Penanganan dan Pembuangan Limbah Kimia",
    type: "WI",
    originDepartment: "Environment, Health and Safety",
    documentBy: "Kaluna",
    distributedDate: "Tue, 10 Jan 2025",
    status: "active" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "7",
    code: "WI-EHS-002-006-004",
    title: "Penanganan dan Pembuangan Limbah Kimia",
    type: "WI",
    originDepartment: "Environment, Health and Safety",
    documentBy: "Kaluna",
    distributedDate: "Tue, 10 Jan 2025",
    status: "active" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "8",
    code: "WI-EHS-002-006-005",
    title: "Penanganan dan Pembuangan Limbah Kimia",
    type: "WI",
    originDepartment: "Environment, Health and Safety",
    documentBy: "Kaluna",
    distributedDate: "Tue, 10 Jan 2025",
    status: "active" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "9",
    code: "WI-EHS-002-006-006",
    title: "Penanganan dan Pembuangan Limbah Kimia",
    type: "WI",
    originDepartment: "Environment, Health and Safety",
    documentBy: "Kaluna",
    distributedDate: "Tue, 10 Jan 2025",
    status: "active" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "10",
    code: "WI-EHS-002-006-007",
    title: "Penanganan dan Pembuangan Limbah Kimia",
    type: "WI",
    originDepartment: "Environment, Health and Safety",
    documentBy: "Kaluna",
    distributedDate: "Tue, 10 Jan 2025",
    status: "active" as DocumentStatus,
    pdfUrl: "/documents/draft-bawang.pdf",
  },
];

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

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockDistributedDocuments.length;
    const approved = mockDistributedDocuments.filter(
      (doc) => doc.status === "active"
    ).length;
    const pending = mockDistributedDocuments.filter(
      (doc) => doc.status === "obsolete_request"
    ).length;
    return { total, approved, pending };
  }, []);

  // Filter documents based on current filters
  const filteredDocuments = useMemo(() => {
    return mockDistributedDocuments.filter((doc) => {
      // Department filter
      if (filters.department) {
        const deptMap: Record<string, string> = {
          "digital-transformation": "Digital Transformation",
          "warehouse": "Warehouse",
          "food-safety": "Food Safety",
          "ehs": "Environment, Health and Safety",
          "hr": "Human Resources",
          "finance": "Finance",
          "operations": "Operations",
        };
        if (doc.originDepartment !== deptMap[filters.department]) {
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
  }, [filters]);

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
            totalDocuments={stats.total}
            approvedDocuments={stats.approved}
            pendingDocuments={stats.pending}
          />

          {/* Documents Table */}
          <div className="bg-white px-4 py-2">
            <DistributedDocumentTable
              documents={paginatedDocuments}
              onViewDocument={handleViewDocument}
              onEditDocument={handleEditDocument}
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
