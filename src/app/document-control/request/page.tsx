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

// Mock data for Request Documents
const mockRequestDocuments: RequestDocument[] = [
  {
    id: "1",
    requestCode: "Req-2025-10-27",
    documentCode: "SOP-DT-001-001",
    documentTitle: "Digitalisasi Arsip Kepegawaian",
    type: "SOP",
    requestBy: "Firdiyatus Sholihah",
    requestByPosition: "Staff Quality Assurance Manufacture",
    ownedBy: "DT - Digital Transformation",
    requestDate: "October 26, 2025",
    status: "pending",
    remarks: "Awaiting Admin Approval",
  },
  {
    id: "2",
    requestCode: "Req-2025-10-20",
    documentCode: "STANDART-EHS-003-002",
    documentTitle: "Dokumen Operasional",
    type: "Standart",
    requestBy: "Firdiyatus Sholihah",
    requestByPosition: "Staff Quality Assurance Manufacture",
    ownedBy: "EHS - Environment, Health & Safety",
    requestDate: "September 12, 2025",
    status: "approved",
    remarks: "Approved for distribution",
  },
  {
    id: "3",
    requestCode: "Req-2025-09-10",
    documentCode: "SPEK-PD&I-RM-001-003",
    documentTitle: "Manual Mutu dan Keamanan Pangan",
    type: "Spesifikasi",
    requestBy: "Firdiyatus Sholihah",
    requestByPosition: "Staff Quality Assurance Manufacture",
    ownedBy: "PD&I - Product Development & Innovation",
    requestDate: "September 8, 2025",
    status: "approved",
    remarks: "documents have been distributed",
  },
  {
    id: "4",
    requestCode: "Req-2025-07-17",
    documentCode: "WI-DT-002-004",
    documentTitle: "Penanganan dan Pembuangan Limbah Kimia",
    type: "WI",
    requestBy: "Firdiyatus Sholihah",
    requestByPosition: "Staff Quality Assurance Manufacture",
    ownedBy: "DT - Digital Transformation",
    requestDate: "August 29, 2025",
    status: "approved",
    remarks: "documents have been distributed",
  },
];

export default function RequestDocumentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    documentType: "",
    status: "",
    search: "",
  });

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Filter documents based on current filters
  const filteredDocuments = useMemo(() => {
    return mockRequestDocuments.filter((doc) => {
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

      // Status filter
      if (filters.status && doc.status !== filters.status) {
        return false;
      }

      // Search filter (searches in request code, document code, and title)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !doc.requestCode.toLowerCase().includes(searchLower) &&
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
    const approved = filteredDocuments.filter((doc) => doc.status === "approved").length;
    const pending = filteredDocuments.filter((doc) => doc.status === "pending").length;
    return { total, approved, pending };
  }, [filteredDocuments]);

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
            totalDocuments={stats.total}
            approvedDocuments={stats.approved}
            pendingDocuments={stats.pending}
          />

          {/* Documents Table */}
          <div className="bg-white px-4 py-2">
            <RequestDocumentTable
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
    </div>
  );
}
