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
import { ArrowLeft, Plus, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { generateDocumentPdf, generatePdfFileName } from "@/lib/pdf/generateSOPPdf";

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

const formSteps: Step[] = [
  { id: "document-info", label: "Document Information" },
  { id: "detail-document", label: "Detail Document" },
  { id: "procedure-document", label: "Procedure Document" },
  { id: "signature-document", label: "Signature Document" },
  { id: "document-preview", label: "Document Preview" },
];

export interface DocumentFormData {
  // Step 1: Document Information
  departmentId: string;
  departmentName: string;
  documentTypeId: string;
  documentCode: string;
  documentTitle: string;
  destinationDepartmentId: string;
  estimatedDistributionDate: string;

  // Step 2: Detail Document
  purpose: string;
  scope: string;
  reviewerIds: string[];
  approverIds: string[];
  acknowledgedIds: string[];
  responsibleDocument: string;
  termsAndAbbreviations: string;
  warning: string;
  relatedDocuments: string;

  // Step 3: Procedure Document
  procedureContent: string;

  // Step 4: Signature Document
  signature: string;
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

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentFormData) => void;
  onSaveDraft?: (data: DocumentFormData) => void;
  isLoading?: boolean;
}

export function AddDocumentModal({
  isOpen,
  onClose,
  onSubmit,
  onSaveDraft,
  isLoading,
}: AddDocumentModalProps) {
  const { user: currentUser } = useCurrentUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DocumentFormData>(initialFormData);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
    }
  }, [isOpen]);

  // Data for dropdowns
  const [departments, setDepartments] = useState<Department[]>([]);
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // PDF Preview state
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string>("");

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Set department from current user
  useEffect(() => {
    if (currentUser?.departmentId && departments.length > 0) {
      const userDept = departments.find((d) => d.id === currentUser.departmentId);
      if (userDept) {
        setFormData((prev) => ({
          ...prev,
          departmentId: currentUser.departmentId || "",
          departmentName: userDept.name,
        }));
      }
    }
  }, [currentUser, departments]);

  // Generate document code when document type changes
  useEffect(() => {
    if (formData.documentTypeId && formData.departmentId) {
      const category = documentCategories.find((c) => c.id === formData.documentTypeId);
      const dept = departments.find((d) => d.id === formData.departmentId);
      if (category && dept) {
        const code = `${category.code}-${dept.code}-001-001`;
        setFormData((prev) => ({ ...prev, documentCode: code }));
      }
    }
  }, [formData.documentTypeId, formData.departmentId, documentCategories, departments]);

  // Create PDF URL when blob is available
  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [pdfBlob]);

  const fetchData = async () => {
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
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const updateFormData = (field: keyof DocumentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    onSaveDraft?.(formData);
    handleClose();
  };

  const handleGeneratePdf = async () => {
    try {
      // Get additional data for PDF
      const documentType = documentCategories.find(c => c.id === formData.documentTypeId);
      const destinationDept = departments.find(d => d.id === formData.destinationDepartmentId);
      const reviewers = formData.reviewerIds.map(id => users.find(u => u.id === id)?.name).filter((name): name is string => Boolean(name));
      const approvers = formData.approverIds.map(id => users.find(u => u.id === id)?.name).filter((name): name is string => Boolean(name));
      const acknowledgeds = formData.acknowledgedIds.map(id => users.find(u => u.id === id)?.name).filter((name): name is string => Boolean(name));

      // Generate PDF blob
      const blob = await generateDocumentPdf(formData, {
        documentTypeName: documentType?.name || "",
        destinationDepartmentName: destinationDept?.name || "",
        reviewerNames: reviewers,
        approverNames: approvers,
        acknowledgedNames: acknowledgeds,
      });

      // Set PDF data
      setPdfBlob(blob);
      setPdfFileName(generatePdfFileName(formData.documentCode));

      // Move to preview step
      setCurrentStep(4);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleFinalSubmit = async () => {
    try {
      if (!pdfBlob) {
        alert("Please generate PDF first");
        return;
      }

      // TODO: Upload PDF to S3
      // const pdfUrl = await uploadPdfToS3(pdfBlob, pdfFileName);

      // For now, just submit with blob (you'll need to implement S3 upload)
      console.log("PDF ready for upload:", pdfFileName);

      // Submit form data (add pdfUrl to formData when S3 is implemented)
      onSubmit(formData);

      // Close modal
      handleClose();
    } catch (error) {
      console.error("Failed to submit document:", error);
      alert("Failed to submit document. Please try again.");
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    setPdfBlob(null);
    setPdfFileName("");
    setPdfUrl("");
    onClose();
  };

  // Calculate word count for procedure content
  const getWordCount = (text: string) => {
    const strippedText = text.replace(/<[^>]*>/g, "").trim();
    if (!strippedText) return 0;
    return strippedText.split(/\s+/).length;
  };

  
  // Memoize user options for each field with disabled state for users already selected in other fields
  const reviewerOptions = useMemo(() => {
    const disabledIds = new Set([...formData.approverIds, ...formData.acknowledgedIds]);
    return users.map((user) => ({
      value: user.id,
      label: `${user.name}${user.position ? ` - ${user.position.name}` : ""}`,
      disabled: disabledIds.has(user.id),
    }));
  }, [users, formData.approverIds, formData.acknowledgedIds]);

  const approverOptions = useMemo(() => {
    const disabledIds = new Set([...formData.reviewerIds, ...formData.acknowledgedIds]);
    return users.map((user) => ({
      value: user.id,
      label: `${user.name}${user.position ? ` - ${user.position.name}` : ""}`,
      disabled: disabledIds.has(user.id),
    }));
  }, [users, formData.reviewerIds, formData.acknowledgedIds]);

  const acknowledgedOptions = useMemo(() => {
    const disabledIds = new Set([...formData.reviewerIds, ...formData.approverIds]);
    return users.map((user) => ({
      value: user.id,
      label: `${user.name}${user.position ? ` - ${user.position.name}` : ""}`,
      disabled: disabledIds.has(user.id),
    }));
  }, [users, formData.reviewerIds, formData.approverIds]);

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
          <SelectTrigger className="h-12 border-[#E1E1E6] rounded-sm">
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
          className="h-12 border-[#E1E1E6] rounded-sm"
        />
      </div>

      {/* Department of Destination */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Department of Destination</Label>
        <Select
          value={formData.destinationDepartmentId}
          onValueChange={(value) => updateFormData("destinationDepartmentId", value)}
        >
          <SelectTrigger className="h-12 border-[#E1E1E6] rounded-sm">
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
      </div>

      {/* Estimated Last Date of Distribution */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">
          Estimated Last Date of Distribution
        </Label>
        <div className="relative">
          <Input
            type="date"
            value={formData.estimatedDistributionDate}
            onChange={(e) => updateFormData("estimatedDistributionDate", e.target.value)}
            placeholder="Estimated Last Date of Distribution"
            className="h-12 border-[#E1E1E6] rounded-sm pr-10"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#E53888] pointer-events-none" />
        </div>
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
          className="h-12 border-[#E1E1E6] rounded-sm"
        />
      </div>

      {/* Scope */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Scope</Label>
        <Textarea
          value={formData.scope}
          onChange={(e) => updateFormData("scope", e.target.value)}
          placeholder="Scope this document"
          className="min-h-[80px] border-[#E1E1E6] rounded-sm resize-none"
        />
      </div>

      {/* Reviewer */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Reviewer</Label>
        <MultiSelect
          options={reviewerOptions}
          selected={formData.reviewerIds}
          onChange={(selectedIds) => handleMultiSelectChange('reviewerIds', selectedIds)}
          placeholder="Select reviewers..."
        />
      </div>

      {/* Approver */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Approver</Label>
        <MultiSelect
          options={approverOptions}
          selected={formData.approverIds}
          onChange={(selectedIds) => handleMultiSelectChange('approverIds', selectedIds)}
          placeholder="Select approvers..."
        />
      </div>

      {/* Acknowledged */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Acknowledged</Label>
        <MultiSelect
          options={acknowledgedOptions}
          selected={formData.acknowledgedIds}
          onChange={(selectedIds) => handleMultiSelectChange('acknowledgedIds', selectedIds)}
          placeholder="Select acknowledged users..."
        />
      </div>

      {/* Responsible Document */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Responsible Document</Label>
        <Textarea
          value={formData.responsibleDocument}
          onChange={(e) => updateFormData("responsibleDocument", e.target.value)}
          placeholder="Responsible this document"
          className="min-h-[80px] border-[#E1E1E6] rounded-sm resize-none"
        />
      </div>

      {/* List of Terms and Abbreviations */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">List of Terms and Abbreviations</Label>
        <Textarea
          value={formData.termsAndAbbreviations}
          onChange={(e) => updateFormData("termsAndAbbreviations", e.target.value)}
          placeholder="List of Terms and Abbreviations in this document"
          className="min-h-[80px] border-[#E1E1E6] rounded-sm resize-none"
        />
      </div>

      {/* Warning */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Warning</Label>
        <Textarea
          value={formData.warning}
          onChange={(e) => updateFormData("warning", e.target.value)}
          placeholder="Warning for this document"
          className="min-h-[80px] border-[#E1E1E6] rounded-sm resize-none"
        />
      </div>

      {/* Related documents */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Related documents</Label>
        <Textarea
          value={formData.relatedDocuments}
          onChange={(e) => updateFormData("relatedDocuments", e.target.value)}
          placeholder="Related document"
          className="min-h-[80px] border-[#E1E1E6] rounded-sm resize-none"
        />
      </div>
    </div>
  );

  // Step 3: Procedure Document
  const renderStep3 = () => (
    <div className="space-y-4">
      <Label className="text-[#323238] text-sm font-bold">Detail Prosedure Document</Label>
      <RichTextEditor
        value={formData.procedureContent}
        onChange={(value) => updateFormData("procedureContent", value)}
        placeholder="Write your procedure document here..."
      />
      <div className="text-[#8D8D99] text-sm">
        Word count: {getWordCount(formData.procedureContent)}
      </div>
    </div>
  );

  // Step 4: Signature Document
  const renderStep4 = () => (
    <div className="space-y-4">
      <Label className="text-[#323238] text-sm font-bold">Signature your Document</Label>
      <SignaturePad
        value={formData.signature}
        onChange={(value) => updateFormData("signature", value)}
      />
    </div>
  );

  // Step 5: Document Preview
  const renderStep5 = () => (
    <div className="space-y-4 h-full flex flex-col">
      <Label className="text-[#323238] text-sm font-bold flex-shrink-0">Preview Your Document</Label>
      <div className="border border-[#E1E2E3] rounded-lg overflow-hidden bg-gray-100 flex-1 min-h-0">
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
            className="w-full h-full border-0"
            title="PDF Preview"
            style={{ minHeight: '500px' }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4DB1D4] mx-auto mb-4"></div>
              <p className="text-[#8D8D99]">Loading PDF Preview...</p>
            </div>
          </div>
        )}
      </div>
      <p className="text-sm text-[#8D8D99] flex-shrink-0">
        Review your document before submitting. Click "Confirm & Upload" to save the document to the database.
      </p>
    </div>
  );

  const renderStepContent = () => {
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[80vw] w-[80vw] h-[100vh] max-h-[100vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#384654]">
              <Plus className="h-5 w-5 text-[#4DB1D4]" />
              Add New Document
            </DialogTitle>
          </DialogHeader>

          {/* Step Wizard */}
          <div className="border border-[#E1E2E3] rounded-lg p-5 mb-4 flex-shrink-0">
            <StepWizardCompact
              steps={formSteps}
              currentStep={currentStep}
              onStepClick={(step) => setCurrentStep(step)}
            />
          </div>

          {/* Form Content */}
          <div className={`py-4 flex-1 overflow-y-auto ${currentStep === 4 ? 'flex flex-col' : ''}`}>
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
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
                    disabled={isLoading}
                    className="bg-[#4DB1D4] hover:bg-[#3da0bf] text-white"
                  >
                    {isLoading ? "Generating..." : "Generate"}
                  </Button>
                </>
              ) : isLastStep ? (
                // Step 5: Show Confirm & Upload button
                <Button
                  onClick={handleFinalSubmit}
                  disabled={isLoading || !pdfBlob}
                  className="bg-[#4DB1D4] hover:bg-[#3da0bf] text-white"
                >
                  {isLoading ? "Uploading..." : "Confirm & Upload"}
                </Button>
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
                    className="bg-[#4DB1D4] hover:bg-[#3da0bf] text-white"
                  >
                    Next
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
