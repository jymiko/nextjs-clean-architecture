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
import { ValidationViewModal } from "@/presentation/components/document-validation/ValidationViewModal";
import { CategorySelectionModal } from "@/presentation/components/document-validation/CategorySelectionModal";
import { DeleteDocumentModal } from "@/presentation/components/document-validation/DeleteDocumentModal";
import { ValidatedCategory } from "@/domain/entities/Document";
import { generateDocumentPdf } from "@/lib/pdf/generateSOPPdf";
import { DocumentFormData } from "@/presentation/components/document-submission";

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
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ValidationDocument | null>(null);

  // Loading states
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // View document handler
  const handleViewDocument = (document: ValidationDocument) => {
    setSelectedDocument(document);
    setViewModalOpen(true);
  };

  // Download document handler
  const handleDownloadDocument = async (document: ValidationDocument) => {
    try {
      toast.loading("Generating PDF...", { id: "pdf-download" });

      // Fetch full document data
      const response = await fetch(`/api/documents/${document.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch document data");
      }
      const docData = await response.json();

      // Convert to DocumentFormData format
      const formData: DocumentFormData = {
        documentTypeId: "",
        documentCode: docData.documentNumber || document.code,
        documentTitle: docData.title || document.title,
        departmentId: "",
        departmentName: docData.departmentName || "",
        destinationDepartmentId: "",
        estimatedDistributionDate: docData.estimatedDistributionDate || "",
        purpose: docData.description || "",
        scope: docData.scope || "",
        reviewerIds: [],
        approverIds: [],
        acknowledgedIds: [],
        responsibleDocument: docData.responsibleDocument || "",
        termsAndAbbreviations: docData.termsAndAbbreviations || "",
        warning: docData.warning || "",
        relatedDocuments: docData.relatedDocumentsText || "",
        procedureContent: docData.procedureContent || "",
        signature: docData.signature || "",
      };

      const additionalData = {
        documentTypeName: docData.categoryName || document.type,
        destinationDepartmentName: docData.destinationDepartmentName || "",
        reviewerName: docData.reviewerName,
        approverName: docData.approverName,
        acknowledgedName: docData.acknowledgerName,
      };

      const blob = await generateDocumentPdf(formData, additionalData);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${document.code}-${new Date().toISOString().split("T")[0]}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully", { id: "pdf-download" });
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Failed to download PDF", { id: "pdf-download" });
    }
  };

  // Edit document handler - opens category selection modal
  const handleEditDocument = (document: ValidationDocument) => {
    setSelectedDocument(document);
    setCategoryModalOpen(true);
  };

  // Delete document handler
  const handleDeleteDocument = (document: ValidationDocument) => {
    setSelectedDocument(document);
    setDeleteModalOpen(true);
  };

  // Finalize document with category and stamp
  const handleFinalizeDocument = async (data: { category: ValidatedCategory; stamp: string; finalPdfBase64?: string }) => {
    if (!selectedDocument) return;

    setIsFinalizing(true);
    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: data.category,
          companyStamp: data.stamp,
          finalPdfBase64: data.finalPdfBase64,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to finalize document");
      }

      const result = await response.json();
      toast.success(
        `Document finalized as ${data.category === ValidatedCategory.MANAGEMENT ? "Document Management" : "Distributed Document"}`
      );
      setCategoryModalOpen(false);
      setSelectedDocument(null);
      fetchDocuments();

      // Log result for debugging
      console.log("Document finalized:", result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to finalize document");
    } finally {
      setIsFinalizing(false);
    }
  };

  // Confirm delete document
  const handleConfirmDelete = async () => {
    if (!selectedDocument) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete document");
      }

      toast.success("Document deleted successfully");
      setDeleteModalOpen(false);
      setSelectedDocument(null);
      fetchDocuments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete document");
    } finally {
      setIsDeleting(false);
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
              onDownloadDocument={handleDownloadDocument}
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

      {/* View Document Modal */}
      <ValidationViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedDocument(null);
        }}
        documentId={selectedDocument?.id || null}
      />

      {/* Category Selection Modal (Edit) */}
      <CategorySelectionModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setSelectedDocument(null);
        }}
        onSubmit={handleFinalizeDocument}
        documentId={selectedDocument?.id || null}
        documentTitle={selectedDocument?.title}
        isLoading={isFinalizing}
      />

      {/* Delete Document Modal */}
      <DeleteDocumentModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedDocument(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        documentTitle={selectedDocument?.title}
        documentCode={selectedDocument?.code}
      />
    </div>
  );
}
