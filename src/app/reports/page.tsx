"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { DashboardHeader } from "@/presentation/components/dashboard";
import {
  ReportFilters,
  ReportStatsCard,
  ReportDocumentsTable,
  ReportPagination,
  DetailReportModal,
  TotalSubmissionsIcon,
  ActiveDocumentsIcon,
  ObsoleteDocumentsIcon,
  FilterState,
  ReportDocument,
} from "@/presentation/components/reports";

// Mock data for demonstration
const mockDocuments: ReportDocument[] = [
  {
    id: "1",
    code: "IT-POL-011",
    title: "Data Protection Guidelines",
    department: "IT",
    type: "Policy",
    status: "active",
    date: "22 February 2024",
  },
  {
    id: "2",
    code: "IT-POL-010",
    title: "Cloud Security Framework",
    department: "IT",
    type: "Policy",
    status: "active",
    date: "21 February 2024",
  },
  {
    id: "3",
    code: "HR-POL-008",
    title: "Employee Onboarding Guide",
    department: "HR",
    type: "Procedure",
    status: "active",
    date: "20 February 2024",
  },
  {
    id: "4",
    code: "FIN-POL-015",
    title: "Budget Allocation Policy",
    department: "Finance",
    type: "Policy",
    status: "obsolete",
    date: "19 February 2024",
  },
  {
    id: "5",
    code: "OPS-SOP-023",
    title: "Quality Control Procedures",
    department: "Operations",
    type: "SOP",
    status: "active",
    date: "18 February 2024",
  },
  {
    id: "6",
    code: "IT-SOP-012",
    title: "Network Security Protocol",
    department: "IT",
    type: "SOP",
    status: "obsolete",
    date: "17 February 2024",
  },
  {
    id: "7",
    code: "HR-POL-007",
    title: "Performance Review Process",
    department: "HR",
    type: "Policy",
    status: "active",
    date: "16 February 2024",
  },
  {
    id: "8",
    code: "FIN-SOP-014",
    title: "Invoice Processing Guide",
    department: "Finance",
    type: "SOP",
    status: "active",
    date: "15 February 2024",
  },
];

export default function ReportDocumentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDocument, setSelectedDocument] = useState<ReportDocument | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    department: "",
    documentType: "",
    status: "",
    dateFrom: undefined,
    dateTo: undefined,
    search: "",
  });

  // Filter documents based on current filters
  const filteredDocuments = useMemo(() => {
    return mockDocuments.filter((doc) => {
      // Department filter
      if (filters.department && doc.department.toLowerCase() !== filters.department.toLowerCase()) {
        return false;
      }

      // Document type filter
      if (filters.documentType && doc.type.toLowerCase() !== filters.documentType.toLowerCase()) {
        return false;
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

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: filteredDocuments.length,
      active: filteredDocuments.filter((d) => d.status === "active").length,
      obsolete: filteredDocuments.filter((d) => d.status === "obsolete").length,
    };
  }, [filteredDocuments]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when items per page change
  };

  const handleViewDocument = (document: ReportDocument) => {
    setSelectedDocument(document);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDocument(null);
  };

  return (
    <div className="min-h-screen bg-[#f9fbff] relative">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:ml-[280px] p-4 lg:p-6 flex flex-col gap-4 lg:gap-6 min-h-screen">
        {/* Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Report Documents"
        />

        {/* Filters Section */}
        <ReportFilters filters={filters} onFilterChange={handleFilterChange} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <ReportStatsCard
            title="Total Submission"
            value={stats.total}
            icon={<TotalSubmissionsIcon />}
            valueColor="default"
          />
          <ReportStatsCard
            title="Active Documents"
            value={stats.active}
            icon={<ActiveDocumentsIcon />}
            valueColor="success"
          />
          <ReportStatsCard
            title="Obsolete Documents"
            value={stats.obsolete}
            icon={<ObsoleteDocumentsIcon />}
            valueColor="warning"
          />
        </div>

        {/* Documents Table */}
        <div className="flex flex-col">
          <ReportDocumentsTable
            documents={paginatedDocuments}
            onViewDocument={handleViewDocument}
          />
          <ReportPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredDocuments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <DetailReportModal
        document={selectedDocument}
        open={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
