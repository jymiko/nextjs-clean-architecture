"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { StepWizardCompact, type Step } from "./StepWizard";
import { RichTextEditor } from "./RichTextEditor";
import { SignaturePad } from "./SignaturePad";
import { ArrowLeft, Pencil, Calendar as CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { compactCalendarClassNames, calendarPopoverCompactClassName } from "@/lib/calendar-config";
import { apiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { DocumentFormData } from "./AddDocumentModal";
import { DocumentSubmissionInfoPanel } from "./DocumentSubmissionInfoPanel";
import { DocumentSubmissionSignaturePreview } from "./DocumentSubmissionSignaturePreview";
import { PDFViewer } from "@/presentation/components/document-management/PDFViewer";
import { generateDocumentPdf, generatePdfFileName } from "@/lib/pdf/generateSOPPdf";
import { SuccessModal } from "@/presentation/components/department/SuccessModal";
import { ErrorModal } from "@/presentation/components/department/ErrorModal";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface DocumentCategory {
  id: string;
  code: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  position?: { name: string } | null;
}

interface DocumentApprovalData {
  id: string;
  approverId: string;
  level: number;
  status: string;
}

const formSteps: Step[] = [
  { id: "document-info", label: "Document Information" },
  { id: "detail-document", label: "Detail Document" },
  { id: "procedure-document", label: "Procedure Document" },
  { id: "signature-document", label: "Signature Document" },
  { id: "document-preview", label: "Document Preview" },
];

const MAX_TOTAL_APPROVERS = 4;

// Interface untuk error messages per field
interface FormErrors {
  // Step 0
  documentTypeId?: string;
  documentTitle?: string;
  destinationDepartmentId?: string;
  estimatedDistributionDate?: string;
  // Step 1
  purpose?: string;
  scope?: string;
  reviewerIds?: string;
  approverIds?: string;
  acknowledgedIds?: string;
  responsibleDocument?: string;
  termsAndAbbreviations?: string;
  warning?: string;
  relatedDocuments?: string;
  // Step 2
  procedureContent?: string;
  // Step 3
  signature?: string;
}

const initialFormData: DocumentFormData = {
  departmentId: "",
  departmentName: "",
  documentTypeId: "",
  documentCode: "",
  documentTitle: "",
  destinationDepartmentId: "",
  estimatedDistributionDate: "",
  purpose: "",
  scope: "",
  reviewerIds: [],
  approverIds: [],
  acknowledgedIds: [],
  responsibleDocument: "",
  termsAndAbbreviations: "",
  warning: "",
  relatedDocuments: "",
  procedureContent: "",
  signature: "",
};

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentFormData, status: "DRAFT" | "IN_REVIEW") => void;
  documentId: string | null;
  isLoading?: boolean;
}

export function EditDocumentModal({
  isOpen,
  onClose,
  onSubmit,
  documentId,
  isLoading,
}: EditDocumentModalProps) {
  const { user: currentUser } = useCurrentUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DocumentFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Data for dropdowns
  const [departments, setDepartments] = useState<Department[]>([]);
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // PDF Preview state
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Popup state for submission feedback
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [isSubmittingDocument, setIsSubmittingDocument] = useState(false);

  // Fetch dropdown data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  // Fetch document data when documentId changes
  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocument();
    }
  }, [isOpen, documentId]);

  const fetchDropdownData = async () => {
    setIsLoadingData(true);
    try {
      const [deptRes, catRes, usersRes] = await Promise.all([
        apiClient.get("/api/departments?limit=100&isActive=true"),
        apiClient.get("/api/documents/categories?limit=100"),
        apiClient.get("/api/users?limit=100"),
      ]);

      setDepartments(deptRes.data || []);
      setDocumentCategories(catRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error("Failed to fetch dropdown data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchDocument = async () => {
    if (!documentId) return;

    setIsLoadingDocument(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/documents/${documentId}`);
      const doc = response;

      // Get all approvals for each level
      const approvals = (doc.approvals || []) as DocumentApprovalData[];
      const reviewerIds = approvals.filter((a) => a.level === 1).map((a) => a.approverId);
      const approverIds = approvals.filter((a) => a.level === 2).map((a) => a.approverId);
      const acknowledgedIds = approvals.filter((a) => a.level === 3).map((a) => a.approverId);

      // Map document data to form data
      setFormData({
        departmentId: doc.createdBy?.departmentId || "",
        departmentName: doc.createdBy?.department?.name || "",
        documentTypeId: doc.categoryId || "",
        documentCode: doc.documentNumber || "",
        documentTitle: doc.title || "",
        destinationDepartmentId: doc.destinationDepartmentId || "",
        estimatedDistributionDate: doc.estimatedDistributionDate
          ? new Date(doc.estimatedDistributionDate).toISOString().split("T")[0]
          : "",
        purpose: doc.description || "",
        scope: doc.scope || "",
        reviewerIds,
        approverIds,
        acknowledgedIds,
        responsibleDocument: doc.responsibleDocument || "",
        termsAndAbbreviations: doc.termsAndAbbreviations || "",
        warning: doc.warning || "",
        relatedDocuments: doc.relatedDocumentsText || "",
        procedureContent: doc.procedureContent || "",
        signature: doc.createdBy?.signature || "",
      });
    } catch (err) {
      console.error("Failed to fetch document:", err);
      setError(err instanceof Error ? err.message : "Failed to load document");
    } finally {
      setIsLoadingDocument(false);
    }
  };

  const updateFormData = (field: keyof DocumentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error untuk field yang diubah
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Fungsi untuk validasi step dan menampilkan error
  const validateStep = (step: number): boolean => {
    const errors: FormErrors = {};

    switch (step) {
      case 0: // Document Information
        if (!formData.documentTypeId) errors.documentTypeId = "Jenis dokumen wajib dipilih";
        if (!formData.documentTitle?.trim()) errors.documentTitle = "Judul dokumen wajib diisi";
        if (!formData.destinationDepartmentId) errors.destinationDepartmentId = "Departemen tujuan wajib dipilih";
        if (!formData.estimatedDistributionDate) errors.estimatedDistributionDate = "Tanggal distribusi wajib diisi";
        break;
      case 1: // Detail Document
        if (!formData.purpose?.trim()) errors.purpose = "Tujuan wajib diisi";
        if (!formData.scope?.trim()) errors.scope = "Ruang lingkup wajib diisi";
        if (!formData.reviewerIds?.length) errors.reviewerIds = "Reviewer wajib dipilih";
        if (!formData.approverIds?.length) errors.approverIds = "Approver wajib dipilih";
        if (!formData.acknowledgedIds?.length) errors.acknowledgedIds = "Acknowledged wajib dipilih";
        if (!formData.responsibleDocument?.trim()) errors.responsibleDocument = "Penanggung jawab wajib diisi";
        if (!formData.termsAndAbbreviations?.trim()) errors.termsAndAbbreviations = "Istilah dan singkatan wajib diisi";
        if (!formData.warning?.trim()) errors.warning = "Peringatan wajib diisi";
        if (!formData.relatedDocuments?.trim()) errors.relatedDocuments = "Dokumen terkait wajib diisi";
        break;
      case 2: // Procedure Document
        if (!formData.procedureContent?.trim() || formData.procedureContent === "<p></p>") errors.procedureContent = "Konten prosedur wajib diisi";
        break;
      case 3: // Signature Document
        if (!formData.signature) errors.signature = "Tanda tangan wajib diisi";
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fungsi untuk check validasi tanpa set error (untuk disable tombol)
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(
          formData.documentTypeId &&
          formData.documentTitle?.trim() &&
          formData.destinationDepartmentId &&
          formData.estimatedDistributionDate
        );
      case 1:
        return !!(
          formData.purpose?.trim() &&
          formData.scope?.trim() &&
          formData.reviewerIds?.length &&
          formData.approverIds?.length &&
          formData.acknowledgedIds?.length &&
          formData.responsibleDocument?.trim() &&
          formData.termsAndAbbreviations?.trim() &&
          formData.warning?.trim() &&
          formData.relatedDocuments?.trim()
        );
      case 2:
        return !!(formData.procedureContent?.trim() && formData.procedureContent !== "<p></p>");
      case 3:
        return !!formData.signature;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < formSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Helper function to get user info by ID
  const getUserInfo = (userId: string): { name: string; position: string } => {
    const user = users.find((u) => u.id === userId);
    return {
      name: user?.name || "",
      position: user?.position?.name || "",
    };
  };

  // Helper function to get department name by ID
  const getDepartmentName = (deptId: string): string => {
    const dept = departments.find((d) => d.id === deptId);
    return dept?.name || "";
  };

  // Helper function to get document type name by ID
  const getDocumentTypeName = (typeId: string): string => {
    const cat = documentCategories.find((c) => c.id === typeId);
    return cat?.name || "";
  };

  // Generate PDF and go to preview step
  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const additionalData = {
        documentTypeName: getDocumentTypeName(formData.documentTypeId),
        destinationDepartmentName: getDepartmentName(formData.destinationDepartmentId),
        reviewerNames: formData.reviewerIds.map(id => getUserInfo(id).name).filter(Boolean),
        approverNames: formData.approverIds.map(id => getUserInfo(id).name).filter(Boolean),
        acknowledgedNames: formData.acknowledgedIds.map(id => getUserInfo(id).name).filter(Boolean),
      };

      // Generate PDF blob
      const blob = await generateDocumentPdf(formData, additionalData);

      // Set PDF data
      setPdfBlob(blob);
      setPdfFileName(generatePdfFileName(formData.documentCode));

      // Create URL for preview
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      // Move to preview step
      setCurrentStep(4);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Submit with status
  const handleFinalSubmit = async (status: "DRAFT" | "IN_REVIEW") => {
    try {
      if (!pdfBlob) {
        alert("Please generate PDF first");
        return;
      }

      if (!documentId) {
        alert("Document ID not found");
        return;
      }

      setIsSubmittingDocument(true);
      try {
        await apiClient.put(`/api/documents/${documentId}`, {
          ...formData,
          status,
        });

        // Show success modal based on status
        if (status === "DRAFT") {
          setModalTitle("Draft Berhasil Disimpan!");
          setModalMessage(`Draft dokumen "${formData.documentTitle}" berhasil disimpan.`);
        } else {
          setModalTitle("Dokumen Berhasil Disubmit!");
          setModalMessage(`Dokumen "${formData.documentTitle}" berhasil disubmit untuk review.`);
        }
        setShowSuccessModal(true);
      } catch (error: unknown) {
        console.error("Failed to submit document:", error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan dokumen.";

        if (status === "DRAFT") {
          setModalTitle("Gagal Menyimpan Draft");
        } else {
          setModalTitle("Gagal Submit Dokumen");
        }
        setModalMessage(errorMessage);
        setShowErrorModal(true);
      } finally {
        setIsSubmittingDocument(false);
      }
    } catch (error) {
      console.error("Failed to submit document:", error);
      alert("Failed to submit document. Please try again.");
    }
  };

  const handleClosePreview = () => {
    // Clean up PDF URL and go back to step 4
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl("");
      setPdfBlob(null);
    }
    setCurrentStep(3);
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    setFormErrors({});
    setError(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl("");
      setPdfBlob(null);
    }
    onClose();
  };

  // Calculate word count for procedure content
  const getWordCount = (text: string) => {
    const strippedText = text.replace(/<[^>]*>/g, "").trim();
    if (!strippedText) return 0;
    return strippedText.split(/\s+/).length;
  };

  // Memoize user options for each field with disabled state for users already selected in other fields
  // Also exclude the current user (document creator) from all options
  const reviewerOptions = useMemo(() => {
    const disabledIds = new Set([
      ...formData.approverIds,
      ...formData.acknowledgedIds,
      currentUser?.id || '',
    ]);
    return users.map((user) => ({
      value: user.id,
      label: `${user.name}${user.position ? ` - ${user.position.name}` : ""}`,
      disabled: disabledIds.has(user.id),
    }));
  }, [users, formData.approverIds, formData.acknowledgedIds, currentUser?.id]);

  const approverOptions = useMemo(() => {
    const disabledIds = new Set([
      ...formData.reviewerIds,
      ...formData.acknowledgedIds,
      currentUser?.id || '',
    ]);
    return users.map((user) => ({
      value: user.id,
      label: `${user.name}${user.position ? ` - ${user.position.name}` : ""}`,
      disabled: disabledIds.has(user.id),
    }));
  }, [users, formData.reviewerIds, formData.acknowledgedIds, currentUser?.id]);

  const acknowledgedOptions = useMemo(() => {
    const disabledIds = new Set([
      ...formData.reviewerIds,
      ...formData.approverIds,
      currentUser?.id || '',
    ]);
    return users.map((user) => ({
      value: user.id,
      label: `${user.name}${user.position ? ` - ${user.position.name}` : ""}`,
      disabled: disabledIds.has(user.id),
    }));
  }, [users, formData.reviewerIds, formData.approverIds, currentUser?.id]);

  // Handle multi-select change
  const handleMultiSelectChange = (
    fieldName: 'reviewerIds' | 'approverIds' | 'acknowledgedIds',
    selectedIds: string[]
  ) => {
    const newFormData = { ...formData };

    // Update the current field
    if (fieldName === 'reviewerIds') {
      newFormData.reviewerIds = selectedIds;
    } else if (fieldName === 'approverIds') {
      newFormData.approverIds = selectedIds;
    } else {
      newFormData.acknowledgedIds = selectedIds;
    }

    setFormData(newFormData);

    // Clear error untuk field yang diubah
    if (formErrors[fieldName]) {
      setFormErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  // Step 1: Document Information
  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Departement (read-only) */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Departement</Label>
        <div className="h-12 px-4 py-2 bg-[#E1E2E3] border border-[#E1E1E6] rounded-sm flex items-center">
          <span className="text-[#243644] text-sm">
            {formData.departmentName || "Loading..."}
          </span>
        </div>
      </div>

      {/* Type Document */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Type Document</Label>
        <Select
          value={formData.documentTypeId}
          onValueChange={(value) => updateFormData("documentTypeId", value)}
        >
          <SelectTrigger className={`h-12 border-[#E1E1E6] rounded-sm ${formErrors.documentTypeId ? "border-red-500" : ""}`}>
            <SelectValue placeholder="Choose type Document" />
          </SelectTrigger>
          <SelectContent>
            {documentCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.documentTypeId && (
          <p className="text-sm text-red-500 mt-1">{formErrors.documentTypeId}</p>
        )}
      </div>

      {/* Document Code (read-only) */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Document Code</Label>
        <div className="h-12 px-4 py-2 bg-[#E1E2E3] border border-[#E1E1E6] rounded-sm flex items-center">
          <span className="text-[#8D8D99] text-sm">
            {formData.documentCode || "Document Code"}
          </span>
        </div>
      </div>

      {/* Document Title */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Document Title</Label>
        <Input
          value={formData.documentTitle}
          onChange={(e) => updateFormData("documentTitle", e.target.value)}
          placeholder="Document Title"
          className={`h-12 border-[#E1E1E6] rounded-sm ${formErrors.documentTitle ? "border-red-500" : ""}`}
        />
        {formErrors.documentTitle && (
          <p className="text-sm text-red-500 mt-1">{formErrors.documentTitle}</p>
        )}
      </div>

      {/* Department of Destination */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Department of Destination</Label>
        <Select
          value={formData.destinationDepartmentId}
          onValueChange={(value) => updateFormData("destinationDepartmentId", value)}
        >
          <SelectTrigger className={`h-12 border-[#E1E1E6] rounded-sm ${formErrors.destinationDepartmentId ? "border-red-500" : ""}`}>
            <SelectValue placeholder="Departement of Destination" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.destinationDepartmentId && (
          <p className="text-sm text-red-500 mt-1">{formErrors.destinationDepartmentId}</p>
        )}
      </div>

      {/* Estimated Last Date of Distribution */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">
          Estimated Last Date of Distribution
        </Label>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full h-12 justify-between text-left font-normal border-[#E1E1E6] rounded-sm hover:bg-white ${formErrors.estimatedDistributionDate ? "border-red-500" : ""}`}
            >
              <span className={formData.estimatedDistributionDate ? "text-[#384654]" : "text-[#a0aec0]"}>
                {formData.estimatedDistributionDate
                  ? format(new Date(formData.estimatedDistributionDate), "dd / MM / yyyy")
                  : "dd / mm / yyyy"}
              </span>
              <CalendarIcon className="h-5 w-5 text-[#D946EF]" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={calendarPopoverCompactClassName} align="start">
            <Calendar
              mode="single"
              selected={formData.estimatedDistributionDate ? new Date(formData.estimatedDistributionDate) : undefined}
              onSelect={(date) => {
                updateFormData("estimatedDistributionDate", date ? format(date, "yyyy-MM-dd") : "");
                setDatePickerOpen(false);
              }}
              initialFocus
              classNames={compactCalendarClassNames}
              showMonthYearDropdown
            />
          </PopoverContent>
        </Popover>
        {formErrors.estimatedDistributionDate && (
          <p className="text-sm text-red-500 mt-1">{formErrors.estimatedDistributionDate}</p>
        )}
      </div>
    </div>
  );

  // Step 2: Detail Document
  const renderStep2 = () => (
    <div className="space-y-4">
      {/* Purpose */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Purpose</Label>
        <Input
          value={formData.purpose}
          onChange={(e) => updateFormData("purpose", e.target.value)}
          placeholder="Purpose"
          className={`h-12 border-[#E1E1E6] rounded-sm ${formErrors.purpose ? "border-red-500" : ""}`}
        />
        {formErrors.purpose && (
          <p className="text-sm text-red-500 mt-1">{formErrors.purpose}</p>
        )}
      </div>

      {/* Scope */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Scope</Label>
        <Textarea
          value={formData.scope}
          onChange={(e) => updateFormData("scope", e.target.value)}
          placeholder="Scope this document"
          className={`min-h-[80px] border-[#E1E1E6] rounded-sm resize-none ${formErrors.scope ? "border-red-500" : ""}`}
        />
        {formErrors.scope && (
          <p className="text-sm text-red-500 mt-1">{formErrors.scope}</p>
        )}
      </div>

      {/* Reviewer */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Reviewer</Label>
        <MultiSelect
          options={reviewerOptions}
          selected={formData.reviewerIds}
          onChange={(selectedIds) => handleMultiSelectChange('reviewerIds', selectedIds)}
          placeholder="Select reviewers..."
          maxSelections={MAX_TOTAL_APPROVERS}
          currentTotalSelected={formData.approverIds.length + formData.acknowledgedIds.length}
          error={!!formErrors.reviewerIds}
        />
        {formErrors.reviewerIds && (
          <p className="text-sm text-red-500 mt-1">{formErrors.reviewerIds}</p>
        )}
      </div>

      {/* Approver */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Approver</Label>
        <MultiSelect
          options={approverOptions}
          selected={formData.approverIds}
          onChange={(selectedIds) => handleMultiSelectChange('approverIds', selectedIds)}
          placeholder="Select approvers..."
          maxSelections={MAX_TOTAL_APPROVERS}
          currentTotalSelected={formData.reviewerIds.length + formData.acknowledgedIds.length}
          error={!!formErrors.approverIds}
        />
        {formErrors.approverIds && (
          <p className="text-sm text-red-500 mt-1">{formErrors.approverIds}</p>
        )}
      </div>

      {/* Acknowledged */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Acknowledged</Label>
        <MultiSelect
          options={acknowledgedOptions}
          selected={formData.acknowledgedIds}
          onChange={(selectedIds) => handleMultiSelectChange('acknowledgedIds', selectedIds)}
          placeholder="Select acknowledged users..."
          maxSelections={MAX_TOTAL_APPROVERS}
          currentTotalSelected={formData.reviewerIds.length + formData.approverIds.length}
          error={!!formErrors.acknowledgedIds}
        />
        {formErrors.acknowledgedIds && (
          <p className="text-sm text-red-500 mt-1">{formErrors.acknowledgedIds}</p>
        )}
      </div>

      {/* Responsible Document */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Responsible Document</Label>
        <Textarea
          value={formData.responsibleDocument}
          onChange={(e) => updateFormData("responsibleDocument", e.target.value)}
          placeholder="Responsible this document"
          className={`min-h-[80px] border-[#E1E1E6] rounded-sm resize-none ${formErrors.responsibleDocument ? "border-red-500" : ""}`}
        />
        {formErrors.responsibleDocument && (
          <p className="text-sm text-red-500 mt-1">{formErrors.responsibleDocument}</p>
        )}
      </div>

      {/* List of Terms and Abbreviations */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">List of Terms and Abbreviations</Label>
        <Textarea
          value={formData.termsAndAbbreviations}
          onChange={(e) => updateFormData("termsAndAbbreviations", e.target.value)}
          placeholder="List of Terms and Abbreviations in this document"
          className={`min-h-[80px] border-[#E1E1E6] rounded-sm resize-none ${formErrors.termsAndAbbreviations ? "border-red-500" : ""}`}
        />
        {formErrors.termsAndAbbreviations && (
          <p className="text-sm text-red-500 mt-1">{formErrors.termsAndAbbreviations}</p>
        )}
      </div>

      {/* Warning */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Warning</Label>
        <Textarea
          value={formData.warning}
          onChange={(e) => updateFormData("warning", e.target.value)}
          placeholder="Warning for this document"
          className={`min-h-[80px] border-[#E1E1E6] rounded-sm resize-none ${formErrors.warning ? "border-red-500" : ""}`}
        />
        {formErrors.warning && (
          <p className="text-sm text-red-500 mt-1">{formErrors.warning}</p>
        )}
      </div>

      {/* Related documents */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Related documents</Label>
        <Textarea
          value={formData.relatedDocuments}
          onChange={(e) => updateFormData("relatedDocuments", e.target.value)}
          placeholder="Related document"
          className={`min-h-[80px] border-[#E1E1E6] rounded-sm resize-none ${formErrors.relatedDocuments ? "border-red-500" : ""}`}
        />
        {formErrors.relatedDocuments && (
          <p className="text-sm text-red-500 mt-1">{formErrors.relatedDocuments}</p>
        )}
      </div>
    </div>
  );

  // Step 3: Procedure Document
  const renderStep3 = () => (
    <div className="space-y-4">
      <Label className="text-[#323238] text-sm font-bold">Detail Prosedure Document</Label>
      <div className={formErrors.procedureContent ? "border border-red-500 rounded-sm" : ""}>
        <RichTextEditor
          value={formData.procedureContent}
          onChange={(value) => updateFormData("procedureContent", value)}
          placeholder="Write your procedure document here..."
        />
      </div>
      {formErrors.procedureContent && (
        <p className="text-sm text-red-500">{formErrors.procedureContent}</p>
      )}
      <div className="text-[#8D8D99] text-sm">
        Word count: {getWordCount(formData.procedureContent)}
      </div>
    </div>
  );

  // Step 4: Signature Document
  const renderStep4 = () => (
    <div className="space-y-4">
      <Label className="text-[#323238] text-sm font-bold">Signature your Document</Label>
      <div className={formErrors.signature ? "border border-red-500 rounded-sm p-1" : ""}>
        <SignaturePad
          value={formData.signature}
          onChange={(value) => updateFormData("signature", value)}
        />
      </div>
      {formErrors.signature && (
        <p className="text-sm text-red-500">{formErrors.signature}</p>
      )}
    </div>
  );

  // Step 5: Document Preview with Info Panel and Signature Preview
  const renderStep5 = () => {
    // Get current date for lastUpdate
    const now = new Date();
    const lastUpdate = now.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Get destination department names
    const destinationDept = getDepartmentName(formData.destinationDepartmentId);
    const departmentOfDestination = destinationDept ? [destinationDept] : [];

    // Get reviewer, approver, acknowledged info (supports multiple)
    const reviewers = formData.reviewerIds.map((id) => getUserInfo(id)).filter((u) => u.name);
    const approvers = formData.approverIds.map((id) => getUserInfo(id)).filter((u) => u.name);
    const acknowledgers = formData.acknowledgedIds.map((id) => getUserInfo(id)).filter((u) => u.name);

    // Get current user info for preparedBy
    const preparedBy = {
      name: currentUser?.name || "",
      position: currentUser?.position?.name || "",
      signature: formData.signature || null,
    };

    return (
      <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[500px]">
        {/* Left Panel - Document Info */}
        <div className="w-full lg:w-[380px] shrink-0 overflow-y-auto">
          <DocumentSubmissionInfoPanel
            documentCode={formData.documentCode}
            documentTitle={formData.documentTitle}
            createdBy={currentUser?.name || ""}
            createdByPosition={currentUser?.position?.name || ""}
            departmentOfDestination={departmentOfDestination}
            reviewers={reviewers}
            approvers={approvers}
            acknowledgers={acknowledgers}
            lastUpdate={lastUpdate}
            onSubmit={() => handleFinalSubmit("IN_REVIEW")}
            onDraft={() => handleFinalSubmit("DRAFT")}
            onClose={handleClosePreview}
            isSubmitting={isLoading || isSubmittingDocument}
          />
        </div>

        {/* Right Panel - PDF Preview + Signature Panel */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
          {/* PDF Viewer */}
          <div className="flex-1 bg-white rounded-lg border border-[#E1E2E3] overflow-hidden min-h-[300px]">
            {pdfUrl ? (
              <PDFViewer file={pdfUrl} showDownload={false} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4DB1D4] mx-auto mb-4"></div>
                  <p className="text-[#8D8D99]">Loading PDF Preview...</p>
                </div>
              </div>
            )}
          </div>

          {/* Signature Preview Panel */}
          <DocumentSubmissionSignaturePreview
            preparedBy={preparedBy}
            reviewers={reviewers}
            approvers={approvers}
            acknowledgers={acknowledgers}
          />
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    if (isLoadingDocument) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-[#8D8D99]">Loading document...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] gap-4">
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

    switch (currentStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      case 3:
        return renderStep4();
      case 4:
        return renderStep5();
      default:
        return null;
    }
  };

  const isLastStep = currentStep === formSteps.length - 1;
  const isFirstStep = currentStep === 0;

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    handleClose(); // Close the main modal after success popup
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`w-[95vw] max-h-[90vh] overflow-y-auto ${currentStep === 4 ? 'sm:max-w-[90vw] lg:max-w-[1200px]' : 'sm:max-w-[900px]'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#384654]">
            <Pencil className="h-5 w-5 text-[#4DB1D4]" />
            Edit Document
          </DialogTitle>
        </DialogHeader>

        {/* Step Wizard */}
        <div className="border border-[#E1E2E3] rounded-lg p-5 mb-4">
          <StepWizardCompact
            steps={formSteps}
            currentStep={currentStep}
            onStepClick={(step) => {
              // If going back from step 5, clean up PDF
              if (currentStep === 4 && step < currentStep) {
                handleClosePreview();
                if (step < 3) {
                  setCurrentStep(step);
                }
              } else {
                setCurrentStep(step);
              }
            }}
          />
        </div>

        {/* Form Content */}
        <div className={`py-4 ${currentStep === 4 ? 'flex flex-col' : 'max-h-[50vh] overflow-y-auto'}`}>
          {renderStepContent()}
        </div>

        {/* Navigation Buttons - Hidden on Step 5 since actions are in the info panel */}
        {currentStep !== 4 && (
          <div className="flex items-center justify-between pt-6 border-t border-[#E1E2E3]">
            <div>
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="border-[#E1E2E3] text-[#384654]"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentStep === 3 ? (
                // Step 4: Show Generate button
                <>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="border-[#F24822] text-[#F24822] hover:bg-[#FFD6CD]"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf || !formData.signature}
                    className="bg-[#4DB1D4] hover:bg-[#3da0bf] text-white"
                  >
                    {isGeneratingPdf ? "Generating..." : "Generate"}
                  </Button>
                </>
              ) : (
                // Other steps: Show Next button
                <>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="border-[#F24822] text-[#F24822] hover:bg-[#FFD6CD]"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid(currentStep)}
                    className={`bg-[#4DB1D4] hover:bg-[#3da0bf] text-white ${!isStepValid(currentStep) ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Next
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title={modalTitle}
        message={modalMessage}
        autoClose={true}
        autoCloseDelay={3000}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={modalTitle}
        message={modalMessage}
        autoClose={false}
      />
    </>
  );
}
