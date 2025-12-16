"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { DocumentManagementHeader } from "@/presentation/components/document-management/DocumentManagementHeader";
import { Pagination } from "@/components/ui/pagination";
import {
  DraftDocumentFilters,
  DraftDocumentTable,
  type DraftDocument,
  type DraftFilterState,
} from "@/presentation/components/request-document";
import {
  ViewDocumentModal,
  EditDocumentModal,
  DeleteDocumentModal,
  type DocumentFormData,
} from "@/presentation/components/document-submission";
import { apiClient } from "@/lib/api-client";

// Interface for API response
interface ApiDocument {
  id: string;
  code: string;
  title: string;
  type: string;
  createdBy: string;
  lastEdited: string;
}

export default function DraftDocumentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<DraftFilterState>({
    documentType: "",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  // Data state
  const [documents, setDocuments] = useState<DraftDocument[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [viewDocumentModalOpen, setViewDocumentModalOpen] = useState(false);
  const [editDocumentModalOpen, setEditDocumentModalOpen] = useState(false);
  const [deleteDocumentModalOpen, setDeleteDocumentModalOpen] = useState(false);
  const [isSubmittingDocument, setIsSubmittingDocument] = useState(false);
  const [isDeletingDocument, setIsDeletingDocument] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DraftDocument | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Fetch documents from API
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: "DRAFT", // Only fetch draft documents
      });

      if (filters.search) params.set("search", filters.search);
      if (filters.documentType) params.set("documentType", filters.documentType);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);

      const response = await apiClient.get(`/api/documents/submission?${params.toString()}`);

      // Map API response to DraftDocument interface
      const mappedDocuments: DraftDocument[] = (response.data || []).map((doc: ApiDocument) => ({
        id: doc.id,
        documentCode: doc.code,
        documentTitle: doc.title,
        type: doc.type,
        createdBy: doc.createdBy,
        lastEdited: doc.lastEdited,
      }));

      setDocuments(mappedDocuments);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch draft documents:", error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, itemsPerPage]);

  // Fetch documents on mount and when filters/page change
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFilterChange = (newFilters: DraftFilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleViewDocument = (document: DraftDocument) => {
    setSelectedDocument(document);
    setViewDocumentModalOpen(true);
  };

  const handleEditDocument = (document: DraftDocument) => {
    setSelectedDocument(document);
    setEditDocumentModalOpen(true);
  };

  const handleDeleteDocument = (document: DraftDocument) => {
    setSelectedDocument(document);
    setDeleteDocumentModalOpen(true);
  };

  const handleEditDocumentSubmit = async (data: DocumentFormData, status: "DRAFT" | "IN_REVIEW") => {
    if (!selectedDocument?.id) return;

    setIsSubmittingDocument(true);
    try {
      await apiClient.put(`/api/documents/${selectedDocument.id}`, {
        documentTypeId: data.documentTypeId,
        documentTitle: data.documentTitle,
        destinationDepartmentId: data.destinationDepartmentId,
        estimatedDistributionDate: data.estimatedDistributionDate,
        purpose: data.purpose,
        scope: data.scope,
        reviewerIds: data.reviewerIds,
        approverIds: data.approverIds,
        acknowledgedIds: data.acknowledgedIds,
        responsibleDocument: data.responsibleDocument,
        termsAndAbbreviations: data.termsAndAbbreviations,
        warning: data.warning,
        relatedDocuments: data.relatedDocuments,
        procedureContent: data.procedureContent,
        signature: data.signature,
        status: status,
      });
      setEditDocumentModalOpen(false);
      setSelectedDocument(null);
      fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error("Failed to update document:", error);
      alert("Failed to update document");
    } finally {
      setIsSubmittingDocument(false);
    }
  };

  const handleDeleteDocumentConfirm = async () => {
    if (!selectedDocument?.id) return;

    setIsDeletingDocument(true);
    try {
      await apiClient.delete(`/api/documents/${selectedDocument.id}`);
      setDeleteDocumentModalOpen(false);
      setSelectedDocument(null);
      fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert(error instanceof Error ? error.message : "Failed to delete document");
    } finally {
      setIsDeletingDocument(false);
    }
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
      <div className="lg:ml-[280px] flex flex-col min-h-screen">
        {/* Header */}
        <DocumentManagementHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Draft Documents"
          subtitle="Create and manage your draft documents before submission"
        />

        {/* Content Area */}
        <div className="flex flex-col">
          {/* Filters Section */}
          <DraftDocumentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Documents Table */}
          <div className="bg-white px-4 py-2">
            <DraftDocumentTable
              documents={documents}
              onViewDocument={handleViewDocument}
              onEditDocument={handleEditDocument}
              onDeleteDocument={handleDeleteDocument}
              isLoading={isLoading}
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

      {/* Modals */}
      <ViewDocumentModal
        isOpen={viewDocumentModalOpen}
        onClose={() => {
          setViewDocumentModalOpen(false);
          setSelectedDocument(null);
        }}
        documentId={selectedDocument?.id || null}
      />

      <EditDocumentModal
        isOpen={editDocumentModalOpen}
        onClose={() => {
          setEditDocumentModalOpen(false);
          setSelectedDocument(null);
        }}
        onSubmit={handleEditDocumentSubmit}
        documentId={selectedDocument?.id || null}
        isLoading={isSubmittingDocument}
      />

      <DeleteDocumentModal
        isOpen={deleteDocumentModalOpen}
        onClose={() => {
          setDeleteDocumentModalOpen(false);
          setSelectedDocument(null);
        }}
        onConfirm={handleDeleteDocumentConfirm}
        isLoading={isDeletingDocument}
      />
    </div>
  );
}
