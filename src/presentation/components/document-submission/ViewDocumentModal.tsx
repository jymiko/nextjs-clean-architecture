"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DocumentStatusBadge, DocumentStatus } from "../reports/DocumentStatusBadge";
import {
  FileText,
  FileCode,
  Type,
  Calendar,
  User,
  Building2,
  UserCheck,
  CheckCircle,
  Users,
  Clock,
  StickyNote,
  Pencil,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { generateDocumentPdf } from "@/lib/pdf/generateSOPPdf";
import { DocumentFormData } from "@/presentation/components/document-submission";
import { PDFViewer } from "@/presentation/components/document-management/PDFViewer";

export interface ViewDocumentData {
  id: string;
  documentNumber: string;
  title: string;
  description?: string;
  categoryName?: string;
  departmentName?: string;
  destinationDepartmentName?: string;
  estimatedDistributionDate?: string;
  scope?: string;
  reviewerName?: string;
  approverName?: string;
  acknowledgerName?: string;
  responsibleDocument?: string;
  termsAndAbbreviations?: string;
  warning?: string;
  relatedDocumentsText?: string;
  procedureContent?: string;
  signature?: string;
  createdByName?: string;
  createdAt?: string;
  status?: string;
  approvedDate?: string;
  lastUpdate?: string;
  notes?: string;
  pdfUrl?: string;
  createdByPosition?: string;
  reviewerPosition?: string;
  approverPosition?: string;
  acknowledgers?: { name: string; position: string }[];
}

interface ViewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
  onEdit?: (documentId: string) => void;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

function InfoRow({ icon, label, value, valueClassName }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="text-[#738193] mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-[#738193] text-xs block mb-1">{label}</span>
        <div className={cn("text-[#384654] text-sm", valueClassName)}>{value}</div>
      </div>
    </div>
  );
}

function mapStatusToDocumentStatus(status?: string): DocumentStatus {
  const statusMap: Record<string, DocumentStatus> = {
    "active": "active",
    "obsolete": "obsolete",
    "pending_obsolete_approval": "pending_obsolete_approval",
    "expiring_soon": "expiring_soon",
    "draft": "draft",
    "pending_approval": "pending_approval",
    "rejected": "rejected",
    "on_review": "on_review",
    "on_approval": "on_approval",
    "revision_by_reviewer": "revision_by_reviewer",
    "pending_ack": "pending_ack",
    "approved": "approved",
    "distributed": "distributed",
    "DRAFT": "draft",
    "PENDING_REVIEW": "on_review",
    "ON_REVIEW": "on_review",
    "REVISION_BY_REVIEWER": "revision_by_reviewer",
    "PENDING_APPROVAL": "pending_approval",
    "ON_APPROVAL": "on_approval",
    "APPROVED": "approved",
    "PENDING_ACK": "pending_ack",
    "DISTRIBUTED": "distributed",
    "REJECTED": "rejected",
    "OBSOLETE": "obsolete",
  };
  return statusMap[status || "draft"] || "draft";
}

export function ViewDocumentModal({
  isOpen,
  onClose,
  documentId,
  onEdit,
}: ViewDocumentModalProps) {
  const [document, setDocument] = useState<ViewDocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocument();
    }
  }, [isOpen, documentId]);

  // Generate PDF when document is loaded
  useEffect(() => {
    if (document && !document.pdfUrl) {
      generatePdfFromDocument();
    }
  }, [document]);

  // Cleanup PDF URL on unmount
  useEffect(() => {
    return () => {
      if (generatedPdfUrl) {
        URL.revokeObjectURL(generatedPdfUrl);
      }
    };
  }, [generatedPdfUrl]);

  const generatePdfFromDocument = async () => {
    if (!document) return;

    setIsGeneratingPdf(true);
    try {
      // Convert document data to DocumentFormData format
      const formData: DocumentFormData = {
        documentTypeId: "",
        documentCode: document.documentNumber || "",
        documentTitle: document.title || "",
        departmentId: "",
        departmentName: document.departmentName || "",
        destinationDepartmentId: "",
        estimatedDistributionDate: document.estimatedDistributionDate || "",
        purpose: document.description || "",
        scope: document.scope || "",
        reviewerIds: [],
        approverIds: [],
        acknowledgedIds: [],
        responsibleDocument: document.responsibleDocument || "",
        termsAndAbbreviations: document.termsAndAbbreviations || "",
        warning: document.warning || "",
        relatedDocuments: document.relatedDocumentsText || "",
        procedureContent: document.procedureContent || "",
        signature: document.signature || "",
      };

      const additionalData = {
        documentTypeName: document.categoryName || "Document",
        destinationDepartmentName: document.destinationDepartmentName || "",
        reviewerName: document.reviewerName,
        approverName: document.approverName,
        acknowledgedName: document.acknowledgerName,
      };

      const blob = await generateDocumentPdf(formData, additionalData);
      const url = URL.createObjectURL(blob);
      setGeneratedPdfUrl(url);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const fetchDocument = async () => {
    if (!documentId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/documents/${documentId}`);
      setDocument(response);
    } catch (err: any) {
      console.error("Failed to fetch document:", err);
      setError(err.message || "Failed to load document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDocument(null);
    setError(null);
    if (generatedPdfUrl) {
      URL.revokeObjectURL(generatedPdfUrl);
      setGeneratedPdfUrl("");
    }
    onClose();
  };

  const handleEdit = () => {
    if (documentId && onEdit) {
      onEdit(documentId);
    }
    handleClose();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-[#8D8D99]">Loading...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FFE5E0] flex items-center justify-center">
            <X className="h-8 w-8 text-[#F24822]" />
          </div>
          <div className="text-center">
            <p className="text-[#F24822] font-medium">{error}</p>
            <p className="text-[#8D8D99] text-sm mt-2">Please try again or contact support.</p>
          </div>
        </div>
      );
    }

    if (!document) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-[#8D8D99]">No document data</div>
        </div>
      );
    }

    // Parse destination departments if comma-separated
    const destinationDepartments = document.destinationDepartmentName
      ? document.destinationDepartmentName.split(",").map((d) => d.trim())
      : [];

    // Parse acknowledgers
    const acknowledgers = document.acknowledgers || (document.acknowledgerName
      ? [{ name: document.acknowledgerName, position: "" }]
      : []);

    return (
      <div className="flex flex-col lg:flex-row gap-4 lg:h-[70vh]">
        {/* Left Side - Document Information */}
        <div className="w-full lg:w-[380px] shrink-0 bg-white rounded-lg border border-[#E1E2E3] overflow-hidden flex flex-col order-2 lg:order-1">
          {/* Header */}
          <div className="bg-[#E9F5FE] px-6 py-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-[#4DB1D4]" />
            <h3 className="text-[#384654] font-semibold text-base">Document Viewer</h3>
          </div>

          {/* Document Information Section */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <h4 className="text-[#384654] font-medium text-sm mb-3">Document Information</h4>

            {/* Status */}
            <div className="mb-4">
              <span className="text-[#738193] text-xs block mb-2">Status</span>
              <DocumentStatusBadge status={mapStatusToDocumentStatus(document.status)} />
            </div>

            {/* Document Code */}
            <InfoRow
              icon={<FileCode className="h-4 w-4" />}
              label="Document Code"
              value={document.documentNumber || "-"}
              valueClassName="text-[#4DB1D4] font-semibold"
            />

            {/* Document Title */}
            <InfoRow
              icon={<Type className="h-4 w-4" />}
              label="Document Title"
              value={document.title || "-"}
            />

            {/* Approved Date */}
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Approved Date"
              value={document.approvedDate ? formatDate(document.approvedDate) : "-"}
            />

            {/* Create By */}
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Create By"
              value={
                <span>
                  {document.createdByName || "-"}
                  {document.createdByPosition && (
                    <span className="text-[#738193]"> - {document.createdByPosition}</span>
                  )}
                </span>
              }
            />

            {/* Department Of Destination */}
            {destinationDepartments.length > 0 && (
              <InfoRow
                icon={<Building2 className="h-4 w-4" />}
                label="Department Of Destination"
                value={
                  <div className="space-y-0.5">
                    {destinationDepartments.map((dept, index) => (
                      <div key={index}>{dept}</div>
                    ))}
                  </div>
                }
              />
            )}

            {/* Review By */}
            {document.reviewerName && (
              <InfoRow
                icon={<UserCheck className="h-4 w-4" />}
                label="Review By"
                value={
                  <span>
                    {document.reviewerName}
                    {document.reviewerPosition && (
                      <span className="text-[#738193]"> - {document.reviewerPosition}</span>
                    )}
                  </span>
                }
              />
            )}

            {/* Approved By */}
            {document.approverName && (
              <InfoRow
                icon={<CheckCircle className="h-4 w-4" />}
                label="Approved By"
                value={
                  <span>
                    {document.approverName}
                    {document.approverPosition && (
                      <span className="text-[#738193]"> - {document.approverPosition}</span>
                    )}
                  </span>
                }
              />
            )}

            {/* Acknowledged By */}
            {acknowledgers.length > 0 && (
              <InfoRow
                icon={<Users className="h-4 w-4" />}
                label="Acknowledged By"
                value={
                  <div className="space-y-0.5">
                    {acknowledgers.map((person, index) => (
                      <div key={index}>
                        {person.name}
                        {person.position && (
                          <span className="text-[#738193]"> - {person.position}</span>
                        )}
                      </div>
                    ))}
                  </div>
                }
              />
            )}

            {/* Last Update */}
            {(document.lastUpdate || document.createdAt) && (
              <InfoRow
                icon={<Clock className="h-4 w-4" />}
                label="Last Update"
                value={formatDate(document.lastUpdate || document.createdAt)}
              />
            )}

            {/* Notes */}
            {document.notes && (
              <InfoRow
                icon={<StickyNote className="h-4 w-4" />}
                label="Notes"
                value={document.notes}
                valueClassName="text-[#F24822] italic"
              />
            )}
          </div>

          {/* Review Actions */}
          <div className="px-6 pb-6 pt-2 space-y-3 border-t border-[#E1E2E3]">
            <h4 className="text-[#384654] font-medium text-sm mb-3">Review Actions</h4>

            <Button
              className="w-full h-11 bg-[#F24822] hover:bg-[#d93d1b] text-white"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>

            <Button
              variant="outline"
              className="w-full h-11 border-[#F24822] text-[#F24822] hover:bg-[#FFF4F4]"
              onClick={handleClose}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>

        {/* Right Side - PDF Viewer */}
        <div className="flex-1 bg-white rounded-lg border border-[#E1E2E3] overflow-hidden min-h-[400px] order-1 lg:order-2">
          {document.pdfUrl || generatedPdfUrl ? (
            <PDFViewer
              file={document.pdfUrl || generatedPdfUrl}
              className="h-full"
              showZoomControls={true}
            />
          ) : isGeneratingPdf ? (
            <div className="flex items-center justify-center h-full bg-[#525659]">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-sm opacity-75">Generating PDF preview...</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-[#525659]">
              <div className="text-center text-white">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm opacity-75">No document preview available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[90vw] lg:max-w-[1200px] w-[95vw] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>View Document</DialogTitle>
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
