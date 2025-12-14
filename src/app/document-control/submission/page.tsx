"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { DocumentManagementHeader } from "@/presentation/components/document-management/DocumentManagementHeader";
import { Pagination } from "@/components/ui/pagination";
import {
  DocumentSubmissionTable,
  DocumentSubmissionFilters,
  RevisionModal,
  RejectModal,
  ApproveModal,
  AddDocumentModal,
  ViewDocumentModal,
  EditDocumentModal,
  DeleteDocumentModal,
  type SubmissionDocument,
  type FilterState,
  type DocumentFormData,
} from "@/presentation/components/document-submission";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function DocumentSubmissionPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    documentType: "",
    status: "",
    search: "",
  });

  // Data state
  const [documents, setDocuments] = useState<SubmissionDocument[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [addDocumentModalOpen, setAddDocumentModalOpen] = useState(false);
  const [viewDocumentModalOpen, setViewDocumentModalOpen] = useState(false);
  const [editDocumentModalOpen, setEditDocumentModalOpen] = useState(false);
  const [deleteDocumentModalOpen, setDeleteDocumentModalOpen] = useState(false);
  const [isSubmittingDocument, setIsSubmittingDocument] = useState(false);
  const [isDeletingDocument, setIsDeletingDocument] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<SubmissionDocument | null>(null);

  // For demo purposes - in real app this comes from auth context
  // "user" | "reviewer" | "admin" | "approval" | "ack"
  const userRole = "user" as const;

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
      });

      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.documentType) params.set("documentType", filters.documentType);

      const response = await apiClient.get(`/api/documents/submission?${params.toString()}`);
      setDocuments(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, itemsPerPage]);

  // Fetch documents on mount and when filters/page change
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleViewDocument = (document: SubmissionDocument) => {
    setSelectedDocument(document);
    setViewDocumentModalOpen(true);
  };

  const handleEditDocument = (document: SubmissionDocument) => {
    setSelectedDocument(document);
    setEditDocumentModalOpen(true);
  };

  const handleDeleteDocument = (document: SubmissionDocument) => {
    setSelectedDocument(document);
    setDeleteDocumentModalOpen(true);
  };

  const handleApproveDocument = (document: SubmissionDocument) => {
    setSelectedDocument(document);
    setApproveModalOpen(true);
  };

  const handleRejectDocument = (document: SubmissionDocument) => {
    setSelectedDocument(document);
    setRejectModalOpen(true);
  };

  const handleRevisionSubmit = (reason: string) => {
    console.log("Revision requested:", selectedDocument, reason);
    setRevisionModalOpen(false);
    setSelectedDocument(null);
  };

  const handleRejectSubmit = (reason: string) => {
    console.log("Document rejected:", selectedDocument, reason);
    setRejectModalOpen(false);
    setSelectedDocument(null);
  };

  const handleApproveConfirm = () => {
    console.log("Document approved:", selectedDocument);
    setApproveModalOpen(false);
    setSelectedDocument(null);
  };

  const handleAddDocument = () => {
    setAddDocumentModalOpen(true);
  };

  const handleAddDocumentSubmit = async (data: DocumentFormData) => {
    setIsSubmittingDocument(true);
    try {
      await apiClient.post("/api/documents/submission", {
        documentTypeId: data.documentTypeId,
        documentTitle: data.documentTitle,
        destinationDepartmentId: data.destinationDepartmentId,
        estimatedDistributionDate: data.estimatedDistributionDate,
        purpose: data.purpose,
        scope: data.scope,
        reviewerId: data.reviewerId || undefined,
        approverId: data.approverId || undefined,
        acknowledgedId: data.acknowledgedId || undefined,
        responsibleDocument: data.responsibleDocument,
        termsAndAbbreviations: data.termsAndAbbreviations,
        warning: data.warning,
        relatedDocuments: data.relatedDocuments,
        procedureContent: data.procedureContent,
        signature: data.signature,
      });
      setAddDocumentModalOpen(false);
      fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error("Failed to submit document:", error);
      alert("Failed to submit document");
    } finally {
      setIsSubmittingDocument(false);
    }
  };

  const handleAddDocumentSaveDraft = (data: DocumentFormData) => {
    console.log("Saving draft:", data);
    // TODO: API call to save draft
    setAddDocumentModalOpen(false);
  };

  const handleEditDocumentSubmit = async (data: DocumentFormData) => {
    setIsSubmittingDocument(true);
    try {
      console.log("Updating document:", selectedDocument?.id, data);
      // TODO: API call to update document
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEditDocumentModalOpen(false);
      setSelectedDocument(null);
      // TODO: Refresh document list
    } finally {
      setIsSubmittingDocument(false);
    }
  };

  const handleDeleteDocumentConfirm = async () => {
    setIsDeletingDocument(true);
    try {
      console.log("Deleting document:", selectedDocument?.id);
      // TODO: API call to delete document
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDeleteDocumentModalOpen(false);
      setSelectedDocument(null);
      // TODO: Refresh document list
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
      <div className="lg:ml-[280px] flex flex-col gap-1.5 min-h-screen">
        {/* Header */}
        <DocumentManagementHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Document Submission"
          subtitle="Submit and Track Your Document Approvals"
        />

        {/* Content Area */}
        <div className="flex flex-col gap-1.5 p-4 lg:p-0 lg:px-0">
          {/* Action Bar */}
          <div className="bg-white px-4 py-3 flex items-center justify-between">
            <h2 className="text-[#384654] font-semibold text-lg">
              Your Submissions
            </h2>
            {userRole === "user" && (
              <Button
                onClick={handleAddDocument}
                className="bg-[#4DB1D4] hover:bg-[#3da0bf] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            )}
          </div>

          {/* Filters Section */}
          <div className="bg-white px-4 py-2">
            <DocumentSubmissionFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Documents Table */}
          <div className="bg-white px-4 py-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : (
              <DocumentSubmissionTable
                documents={documents}
                userRole={userRole}
                onViewDocument={handleViewDocument}
                onEditDocument={handleEditDocument}
                onDeleteDocument={handleDeleteDocument}
                onApproveDocument={handleApproveDocument}
                onRejectDocument={handleRejectDocument}
              />
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={documents.length}
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
      <RevisionModal
        isOpen={revisionModalOpen}
        onClose={() => setRevisionModalOpen(false)}
        onSubmit={handleRevisionSubmit}
        documentCode={selectedDocument?.code}
        documentTitle={selectedDocument?.title}
      />

      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleRejectSubmit}
        documentCode={selectedDocument?.code}
        documentTitle={selectedDocument?.title}
      />

      <ApproveModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleApproveConfirm}
        documentCode={selectedDocument?.code}
        documentTitle={selectedDocument?.title}
      />

      <AddDocumentModal
        isOpen={addDocumentModalOpen}
        onClose={() => setAddDocumentModalOpen(false)}
        onSubmit={handleAddDocumentSubmit}
        onSaveDraft={handleAddDocumentSaveDraft}
        isLoading={isSubmittingDocument}
      />

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
