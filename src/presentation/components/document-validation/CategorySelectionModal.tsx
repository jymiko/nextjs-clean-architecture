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
  X,
  FileEdit,
  Send,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { generateDocumentPdf, generateFinalDocumentPdf, PdfSignatureData } from "@/lib/pdf/generateSOPPdf";
import { DocumentFormData } from "@/presentation/components/document-submission";
import { PDFViewer } from "@/presentation/components/document-management/PDFViewer";
import { StampUploadArea } from "./StampUploadArea";
import { ConfirmSendModal } from "./ConfirmSendModal";
import { ValidatedCategory } from "@/domain/entities/Document";

// Helper to convert blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

type ModalStep = "category" | "stamp";

interface PreparedByData {
  id?: string;
  name: string;
  position: string;
  signature: string | null;
  signedAt: Date | string | null;
}

interface SignatureApprovalData {
  id: string;
  level: number;
  approver: {
    id: string;
    name: string;
    position: string;
  };
  signatureImage: string | null;
  signedAt: Date | string | null;
  status: string;
  confirmedAt?: Date | string | null;
}

interface ViewDocumentData {
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
  preparedBy?: PreparedByData;
  signatureApprovals?: SignatureApprovalData[];
}

interface CategorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { category: ValidatedCategory; stamp: string; finalPdfBase64?: string }) => Promise<void>;
  documentId: string | null;
  documentTitle?: string;
  isLoading?: boolean;
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
    "waiting_validation": "waiting_validation",
    "WAITING_VALIDATION": "waiting_validation",
    "approved": "approved",
    "APPROVED": "approved",
    "draft": "draft",
    "DRAFT": "draft",
  };
  return statusMap[status || "draft"] || "draft";
}

// Signature Card Component
function SignatureCard({
  title,
  name,
  position,
  signature,
  signedAt,
}: {
  title: string;
  name: string;
  position: string;
  signature: string | null;
  signedAt: Date | string | null;
}) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    try {
      return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="border border-[#E1E2E3] rounded-lg p-4 text-center w-[180px] flex-shrink-0">
      <p className="text-[#384654] text-sm font-medium mb-3">{title}</p>
      <div className="h-24 flex items-center justify-center mb-3 bg-[#F9FBFF] rounded border border-[#E1E2E3]">
        {signature ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signature}
            alt={`${name}'s signature`}
            className="max-h-20 max-w-full object-contain"
          />
        ) : (
          <span className="text-[#738193] text-xs">No signature</span>
        )}
      </div>
      <p className="text-[#384654] text-sm font-medium truncate">{name}</p>
      <p className="text-[#738193] text-xs truncate">({position})</p>
      {signedAt && (
        <p className="text-[#738193] text-xs mt-1">{formatDate(signedAt)}</p>
      )}
    </div>
  );
}

export function CategorySelectionModal({
  isOpen,
  onClose,
  onSubmit,
  documentId,
  documentTitle,
  isLoading = false,
}: CategorySelectionModalProps) {
  const [step, setStep] = useState<ModalStep>("category");
  const [selectedCategory, setSelectedCategory] = useState<ValidatedCategory | null>(null);
  const [stampBase64, setStampBase64] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Document data
  const [document, setDocument] = useState<ViewDocumentData | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Fetch document data when modal opens
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

  const fetchDocument = async () => {
    if (!documentId) return;

    setIsLoadingDoc(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/documents/${documentId}`);
      setDocument(response);
    } catch (err) {
      console.error("Failed to fetch document:", err);
      setError(err instanceof Error ? err.message : "Failed to load document");
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const generatePdfFromDocument = async () => {
    if (!document) return;

    setIsGeneratingPdf(true);
    try {
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

  const handleCategorySelect = (category: ValidatedCategory) => {
    setSelectedCategory(category);
    setStep("stamp");
  };

  const handleBack = () => {
    setStep("category");
    setStampBase64(null);
  };

  const handleClose = () => {
    setStep("category");
    setSelectedCategory(null);
    setStampBase64(null);
    setConfirmModalOpen(false);
    setDocument(null);
    setError(null);
    if (generatedPdfUrl) {
      URL.revokeObjectURL(generatedPdfUrl);
      setGeneratedPdfUrl("");
    }
    onClose();
  };

  const handleSaveClick = () => {
    if (selectedCategory && stampBase64) {
      setConfirmModalOpen(true);
    }
  };

  const handleConfirmSend = async () => {
    if (selectedCategory && stampBase64 && document) {
      try {
        // Build signature data for PDF
        const preparedByData: PreparedByData = {
          id: document.preparedBy?.id,
          name: document.preparedBy?.name || document.createdByName || "",
          position: document.preparedBy?.position || document.createdByPosition || "",
          signature: document.preparedBy?.signature || null,
          signedAt: document.preparedBy?.signedAt || null,
        };

        // Map signatures for PDF
        const signatures: {
          preparedBy?: PdfSignatureData;
          reviewers?: PdfSignatureData[];
          approvers?: PdfSignatureData[];
          acknowledgers?: PdfSignatureData[];
        } = {
          preparedBy: {
            title: "Prepared By",
            name: preparedByData.name,
            position: preparedByData.position,
            signature: preparedByData.signature,
            signedAt: preparedByData.signedAt ? String(preparedByData.signedAt) : null,
          },
          reviewers: reviewers.map((a, idx) => ({
            title: reviewers.length > 1 ? `Reviewer By ${idx + 1}` : "Reviewer By",
            name: a.approver.name,
            position: a.approver.position,
            signature: a.signatureImage,
            signedAt: a.signedAt ? String(a.signedAt) : null,
          })),
          approvers: approvers.map((a, idx) => ({
            title: approvers.length > 1 ? `Approved By ${idx + 1}` : "Approved By",
            name: a.approver.name,
            position: a.approver.position,
            signature: a.signatureImage,
            signedAt: a.signedAt ? String(a.signedAt) : null,
          })),
          acknowledgers: acknowledgers.map((a, idx) => ({
            title: acknowledgers.length > 1 ? `Acknowledged By ${idx + 1}` : "Acknowledged By",
            name: a.approver.name,
            position: a.approver.position,
            signature: a.signatureImage,
            signedAt: a.signedAt ? String(a.signedAt) : null,
          })),
        };

        // Build form data for PDF generation
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

        // Generate final PDF with signatures and stamp
        const finalPdfBlob = await generateFinalDocumentPdf(
          formData,
          additionalData,
          signatures,
          stampBase64
        );

        // Convert blob to base64
        const finalPdfBase64 = await blobToBase64(finalPdfBlob);

        // Submit with final PDF
        await onSubmit({
          category: selectedCategory,
          stamp: stampBase64,
          finalPdfBase64,
        });

        setConfirmModalOpen(false);
        handleClose();
      } catch (err) {
        console.error("Failed to generate final PDF:", err);
        // Still try to submit without final PDF
        await onSubmit({
          category: selectedCategory,
          stamp: stampBase64,
        });
        setConfirmModalOpen(false);
        handleClose();
      }
    }
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

  // Group approvals by level
  const reviewers = document?.signatureApprovals?.filter(a => a.level === 1) || [];
  const approvers = document?.signatureApprovals?.filter(a => a.level === 2) || [];
  const acknowledgers = document?.signatureApprovals?.filter(a => a.level === 3) || [];

  const renderContent = () => {
    if (isLoadingDoc) {
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

    const destinationDepartments = document.destinationDepartmentName
      ? document.destinationDepartmentName.split(",").map((d) => d.trim())
      : [];

    const preparedByData: PreparedByData = {
      id: document.preparedBy?.id,
      name: document.preparedBy?.name || document.createdByName || "",
      position: document.preparedBy?.position || document.createdByPosition || "",
      signature: document.preparedBy?.signature || null,
      signedAt: document.preparedBy?.signedAt || null,
    };

    return (
      <div className="flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
        {/* Left Side - Document Information */}
        <div className="w-full lg:w-[380px] shrink-0 bg-white rounded-lg border border-[#E1E2E3] flex flex-col order-2 lg:order-1 overflow-hidden">
          {/* Header */}
          <div className="bg-[#E9F5FE] px-6 py-4 flex items-center gap-3 shrink-0">
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

            <InfoRow
              icon={<FileCode className="h-4 w-4" />}
              label="Document Code"
              value={document.documentNumber || "-"}
              valueClassName="text-[#4DB1D4] font-semibold"
            />

            <InfoRow
              icon={<Type className="h-4 w-4" />}
              label="Document Title"
              value={document.title || "-"}
            />

            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Approved Date"
              value={document.approvedDate ? formatDate(document.approvedDate) : "-"}
            />

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

            <InfoRow
              icon={<UserCheck className="h-4 w-4" />}
              label="Review By"
              value={document.reviewerName || "-"}
            />

            <InfoRow
              icon={<CheckCircle className="h-4 w-4" />}
              label="Approved By"
              value={document.approverName || "-"}
            />

            <InfoRow
              icon={<Users className="h-4 w-4" />}
              label="Acknowledged By"
              value={document.acknowledgerName || "-"}
            />

            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Last Update"
              value={formatDate(document.lastUpdate || document.createdAt)}
            />
          </div>

          {/* Review Actions */}
          <div className="px-6 pb-6 pt-2 border-t border-[#E1E2E3] shrink-0">
            <h4 className="text-[#384654] font-medium text-sm mb-3">Review Actions</h4>

            {step === "category" ? (
              <div className="space-y-2">
                <Button
                  className="w-full h-11 bg-[#F24822] hover:bg-[#d93d1b] text-white justify-start px-4"
                  onClick={() => handleCategorySelect(ValidatedCategory.MANAGEMENT)}
                  disabled={isLoading}
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  Edit to Document Management
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-11 border-[#4DB1D4] text-[#4DB1D4] hover:bg-[#E9F5FE] justify-start px-4"
                  onClick={() => handleCategorySelect(ValidatedCategory.DISTRIBUTED)}
                  disabled={isLoading}
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  Edit to Document Distributed
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-11 border-[#F24822] text-[#F24822] hover:bg-[#FFF4F4]"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  className={cn(
                    "w-full h-11",
                    !stampBase64
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#4DB1D4] hover:bg-[#3d9fc2] text-white"
                  )}
                  onClick={handleSaveClick}
                  disabled={!stampBase64 || isLoading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-11 border-[#4DB1D4] text-[#4DB1D4] hover:bg-[#E9F5FE]"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-11 border-[#F24822] text-[#F24822] hover:bg-[#FFF4F4]"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - PDF Viewer + Signature Panel */}
        <div className="flex-1 flex flex-col gap-4 order-1 lg:order-2 overflow-hidden">
          {/* PDF Viewer */}
          <div className="bg-white rounded-lg border border-[#E1E2E3] overflow-hidden min-h-[300px] flex-1">
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

          {/* Signature Panel with Stamp Upload */}
          <div className="shrink-0 bg-white rounded-lg border border-[#E1E2E3] p-4">
            <div className="flex flex-wrap items-end gap-3 justify-center">
              {/* Prepared By */}
              <SignatureCard
                title="Prepared By"
                name={preparedByData.name}
                position={preparedByData.position}
                signature={preparedByData.signature}
                signedAt={preparedByData.signedAt}
              />

              {/* Reviewers */}
              {reviewers.map((approval, index) => (
                <SignatureCard
                  key={approval.id}
                  title={reviewers.length > 1 ? `Reviewer By ${index + 1}` : "Reviewer By"}
                  name={approval.approver.name}
                  position={approval.approver.position}
                  signature={approval.signatureImage}
                  signedAt={approval.signedAt}
                />
              ))}

              {/* Approvers */}
              {approvers.map((approval, index) => (
                <SignatureCard
                  key={approval.id}
                  title={approvers.length > 1 ? `Approved By ${index + 1}` : "Approved By"}
                  name={approval.approver.name}
                  position={approval.approver.position}
                  signature={approval.signatureImage}
                  signedAt={approval.signedAt}
                />
              ))}

              {/* Acknowledgers */}
              {acknowledgers.map((approval, index) => (
                <SignatureCard
                  key={approval.id}
                  title={acknowledgers.length > 1 ? `Acknowledged By ${index + 1}` : "Acknowledged By"}
                  name={approval.approver.name}
                  position={approval.approver.position}
                  signature={approval.signatureImage}
                  signedAt={approval.signedAt}
                />
              ))}

              {/* Company Stamp - Only show when in stamp step */}
              {step === "stamp" && (
                <div className="border border-[#E1E2E3] rounded-lg p-4 text-center w-[180px] flex-shrink-0">
                  <p className="text-[#384654] text-sm font-medium mb-3">Company Stamp</p>
                  {stampBase64 ? (
                    <div className="h-24 flex items-center justify-center mb-3 bg-[#F9FBFF] rounded border border-[#E1E2E3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={stampBase64}
                        alt="Company stamp"
                        className="max-h-20 max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      className="h-24 flex flex-col items-center justify-center mb-3 bg-[#F9FBFF] rounded border-2 border-dashed border-[#4DB1D4] cursor-pointer hover:bg-[#E9F5FE]"
                      onClick={() => {
                        const input = window.document.createElement("input");
                        input.type = "file";
                        input.accept = "image/png,image/jpeg,image/jpg,image/webp,image/gif";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setStampBase64(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      <span className="text-[#4DB1D4] text-xs">Click to upload</span>
                    </div>
                  )}
                  {stampBase64 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-[#F24822]"
                      onClick={() => setStampBase64(null)}
                    >
                      Remove
                    </Button>
                  )}
                  {!stampBase64 && (
                    <p className="text-[#738193] text-xs">Required</p>
                  )}
                </div>
              )}
            </div>

            {/* Selected Category Info */}
            {step === "stamp" && selectedCategory && (
              <div className="mt-3 bg-[#E9F5FE] rounded-lg px-4 py-2 text-center">
                <p className="text-[#384654] text-xs">
                  <span className="font-medium">Category:</span>{" "}
                  {selectedCategory === ValidatedCategory.MANAGEMENT
                    ? "Document Management"
                    : "Distributed Document"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen && !confirmModalOpen} onOpenChange={handleClose}>
        <DialogContent className="w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh] p-6 flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {step === "category" ? "Select Document Category" : "Upload Company Stamp"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {renderContent()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Send Modal */}
      <ConfirmSendModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmSend}
        isLoading={isLoading}
        documentTitle={documentTitle || document?.title}
      />
    </>
  );
}
