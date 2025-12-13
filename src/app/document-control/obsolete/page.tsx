"use client";

import { useState, useMemo } from "react";
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

// Mock data for obsolete documents
const mockObsoleteDocuments: ObsoleteDocument[] = [
  {
    id: "1",
    code: "SOP-DT-001-002",
    title: "Digitalisasi Arsip Kepegawaian",
    type: "SOP",
    department: "Digital Transformation",
    createdBy: "Firdiyatus Sholihah",
    effectiveDate: "Fri, 17 Jun 2025",
    obsoleteDate: "Fri, 17 Jun 2025",
    remarks: "Diganti dengan dokumen baru",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "2",
    code: "STANDART-WH-002-003",
    title: "Dokumen Operasional",
    type: "Standart",
    department: "Warehouse",
    createdBy: "Firdiyatus Sholihah",
    effectiveDate: "Thu, 23 Feb 2025",
    obsoleteDate: "Thu, 23 Feb 2025",
    remarks: "Sudah tidak berlaku lagi",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "3",
    code: "SPEK-PDI-RM-002-003",
    title: "Manual Mutu dan Keamanan Pangan",
    type: "Spesifikasi",
    department: "Food Safety",
    createdBy: "Firdiyatus Sholihah",
    effectiveDate: "Mon, 12 Feb 2025",
    obsoleteDate: "Mon, 12 Feb 2025",
    remarks: "Diganti dengan dokumen baru",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "4",
    code: "WI-EHS-004-004",
    title: "Penanganan dan Pembuangan Limbah Kimia",
    type: "WI",
    department: "Environment, Health and Safety",
    createdBy: "Firdiyatus Sholihah",
    effectiveDate: "Tue, 10 Jan 2025",
    obsoleteDate: "Tue, 10 Jan 2025",
    remarks: "Sudah tidak berlaku lagi",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "5",
    code: "SOP-HR-001-001",
    title: "Prosedur Rekrutmen Karyawan",
    type: "SOP",
    department: "Human Resources",
    createdBy: "Sanusi",
    effectiveDate: "Mon, 05 Dec 2024",
    obsoleteDate: "Mon, 05 Dec 2024",
    remarks: "Diganti dengan dokumen baru",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "6",
    code: "WI-FIN-002-001",
    title: "Instruksi Kerja Penggajian",
    type: "WI",
    department: "Finance",
    createdBy: "Handoko",
    effectiveDate: "Fri, 15 Nov 2024",
    obsoleteDate: "Fri, 15 Nov 2024",
    remarks: "Sudah tidak berlaku lagi",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "7",
    code: "STANDART-OP-003-002",
    title: "Standar Operasional Produksi",
    type: "Standart",
    department: "Operations",
    createdBy: "Kaluna",
    effectiveDate: "Wed, 10 Oct 2024",
    obsoleteDate: "Wed, 10 Oct 2024",
    remarks: "Diganti dengan dokumen baru",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "8",
    code: "SPEK-WH-001-001",
    title: "Spesifikasi Penyimpanan Bahan Baku",
    type: "Spesifikasi",
    department: "Warehouse",
    createdBy: "Firdiyatus Sholihah",
    effectiveDate: "Tue, 05 Sep 2024",
    obsoleteDate: "Tue, 05 Sep 2024",
    remarks: "Sudah tidak berlaku lagi",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "9",
    code: "SOP-EHS-001-001",
    title: "Prosedur Keselamatan Kerja",
    type: "SOP",
    department: "Environment, Health and Safety",
    createdBy: "Sanusi",
    effectiveDate: "Mon, 01 Aug 2024",
    obsoleteDate: "Mon, 01 Aug 2024",
    remarks: "Diganti dengan dokumen baru",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "10",
    code: "WI-DT-001-001",
    title: "Instruksi Kerja Backup Data",
    type: "WI",
    department: "Digital Transformation",
    createdBy: "Handoko",
    effectiveDate: "Fri, 15 Jul 2024",
    obsoleteDate: "Fri, 15 Jul 2024",
    remarks: "Sudah tidak berlaku lagi",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "11",
    code: "SOP-FS-002-001",
    title: "Prosedur Inspeksi Keamanan Pangan",
    type: "SOP",
    department: "Food Safety",
    createdBy: "Kaluna",
    effectiveDate: "Wed, 01 Jun 2024",
    obsoleteDate: "Wed, 01 Jun 2024",
    remarks: "Diganti dengan dokumen baru",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  {
    id: "12",
    code: "STANDART-HR-001-001",
    title: "Standar Penilaian Kinerja",
    type: "Standart",
    department: "Human Resources",
    createdBy: "Firdiyatus Sholihah",
    effectiveDate: "Mon, 15 May 2024",
    obsoleteDate: "Mon, 15 May 2024",
    remarks: "Sudah tidak berlaku lagi",
    pdfUrl: "/documents/draft-bawang.pdf",
  },
];

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

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Filter documents based on current filters
  const filteredDocuments = useMemo(() => {
    return mockObsoleteDocuments.filter((doc) => {
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

      // Search filter (searches in code, title, and remarks)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !doc.code.toLowerCase().includes(searchLower) &&
          !doc.title.toLowerCase().includes(searchLower) &&
          !doc.remarks.toLowerCase().includes(searchLower)
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
            <ObsoleteDocumentTable
              documents={paginatedDocuments}
              onViewDocument={handleViewDocument}
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
