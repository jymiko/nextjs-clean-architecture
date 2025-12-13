"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { DocumentManagementHeader } from "@/presentation/components/document-management/DocumentManagementHeader";
import { Pagination } from "@/components/ui/pagination";
import {
  DraftDocumentStats,
  DraftDocumentFilters,
  DraftDocumentTable,
  type DraftDocument,
  type DraftFilterState,
} from "@/presentation/components/request-document";

// Mock data for Draft Documents
const mockDraftDocuments: DraftDocument[] = [
  {
    id: "1",
    documentCode: "Draft-DT-001-000",
    documentTitle: "Digitalisasi Arsip Kepegawaian",
    type: "SOP",
    createdBy: "Firdiyatus Sholihah",
    lastEdited: "10 Minutes ago",
  },
  {
    id: "2",
    documentCode: "Draft-DT-002-000",
    documentTitle: "Dokumen Operasional",
    type: "Standart",
    createdBy: "Fadila Darojatu S.",
    lastEdited: "2 Hours ago",
  },
  {
    id: "3",
    documentCode: "Draft-DT-003-000",
    documentTitle: "Manual Mutu dan Keamanan Pangan",
    type: "Spesifikasi",
    createdBy: "Arifah",
    lastEdited: "Yesterday",
  },
  {
    id: "4",
    documentCode: "Draft-DT-004-000",
    documentTitle: "Penanganan dan Pembuangan Limbah Kimia",
    type: "WI",
    createdBy: "Firdiyatus Sholihah",
    lastEdited: "2 Days ago",
  },
];

export default function DraftDocumentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<DraftFilterState>({
    documentType: "",
    search: "",
  });

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Filter documents based on current filters
  const filteredDocuments = useMemo(() => {
    return mockDraftDocuments.filter((doc) => {
      // Document type filter
      if (filters.documentType) {
        const typeMap: Record<string, string> = {
          sop: "SOP",
          standart: "Standart",
          spesifikasi: "Spesifikasi",
          wi: "WI",
          policy: "Policy",
          guideline: "Guideline",
        };
        if (doc.type !== typeMap[filters.documentType]) {
          return false;
        }
      }

      // Search filter (searches in document code and title)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !doc.documentCode.toLowerCase().includes(searchLower) &&
          !doc.documentTitle.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredDocuments.length;
    // For demo, count drafts edited in the last week as "recent"
    const recent = filteredDocuments.filter((doc) => {
      const lastEdited = doc.lastEdited.toLowerCase();
      return (
        lastEdited.includes("minute") ||
        lastEdited.includes("hour") ||
        lastEdited.includes("yesterday")
      );
    }).length;
    return { total, recent };
  }, [filteredDocuments]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  const handleFilterChange = (newFilters: DraftFilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleViewDocument = (document: DraftDocument) => {
    console.log("View document:", document);
    // TODO: Implement view document modal or navigation
  };

  const handleEditDocument = (document: DraftDocument) => {
    console.log("Edit document:", document);
    // TODO: Implement edit document modal or navigation
  };

  const handleDeleteDocument = (document: DraftDocument) => {
    console.log("Delete document:", document);
    // TODO: Implement delete confirmation modal
  };

  const handleAddDocument = () => {
    console.log("Add new draft document");
    // TODO: Implement add document modal or navigation
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
          title="Draft Documents"
          subtitle="Create and manage your draft documents before submission"
        />

        {/* Content Area */}
        <div className="flex flex-col gap-1.5 p-4 lg:p-0 lg:px-0">
          {/* Filters Section */}
          <DraftDocumentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onAddDocument={handleAddDocument}
          />

          {/* Stats Section */}
          <DraftDocumentStats
            totalDrafts={stats.total}
            recentDrafts={stats.recent}
          />

          {/* Documents Table */}
          <div className="bg-white px-4 py-2">
            <DraftDocumentTable
              documents={paginatedDocuments}
              onViewDocument={handleViewDocument}
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
    </div>
  );
}
