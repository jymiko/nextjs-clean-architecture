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
import { ArrowLeft, Pencil, Calendar, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { DocumentFormData } from "./AddDocumentModal";

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
];

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
  onSubmit: (data: DocumentFormData) => void;
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
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data for dropdowns
  const [departments, setDepartments] = useState<Department[]>([]);
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

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
      const reviewerIds = doc.approvals?.filter((a: any) => a.level === 1).map((a: any) => a.approverId) || [];
      const approverIds = doc.approvals?.filter((a: any) => a.level === 2).map((a: any) => a.approverId) || [];
      const acknowledgedIds = doc.approvals?.filter((a: any) => a.level === 3).map((a: any) => a.approverId) || [];

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
    } catch (err: any) {
      console.error("Failed to fetch document:", err);
      setError(err.message || "Failed to load document");
    } finally {
      setIsLoadingDocument(false);
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

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    setError(null);
    onClose();
  };

  // Calculate word count for procedure content
  const getWordCount = (text: string) => {
    const strippedText = text.replace(/<[^>]*>/g, "").trim();
    if (!strippedText) return 0;
    return strippedText.split(/\s+/).length;
  };

  // Memoize user options for each field
  const reviewerOptions = useMemo(() => {
    return users.map((user) => ({
      value: user.id,
      label: `${user.name}${user.position ? ` - ${user.position.name}` : ""}`,
    }));
  }, [users]);

  const approverOptions = useMemo(() => {
    return users.map((user) => ({
      value: user.id,
      label: `${user.name}${user.position ? ` - ${user.position.name}` : ""}`,
    }));
  }, [users]);

  const acknowledgedOptions = useMemo(() => {
    return users.map((user) => ({
      value: user.id,
      label: `${user.name}${user.position ? ` - ${user.position.name}` : ""}`,
    }));
  }, [users]);

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
      default:
        return null;
    }
  };

  const isLastStep = currentStep === formSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[90vh] overflow-y-auto">
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
            onStepClick={(step) => setCurrentStep(step)}
          />
        </div>

        {/* Form Content */}
        <div className="py-4 max-h-[50vh] overflow-y-auto">
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
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-[#4DB1D4] hover:bg-[#3da0bf] text-white"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
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
  );
}
