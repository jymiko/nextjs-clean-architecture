"use client";

import { useState, useEffect } from "react";
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
import { StepWizardCompact, type Step } from "./StepWizard";
import { RichTextEditor } from "./RichTextEditor";
import { SignaturePad } from "./SignaturePad";
import { ArrowLeft, Plus, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useCurrentUser } from "@/hooks/use-current-user";

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
  reviewerId: string;
  approverId: string;
  acknowledgedId: string;
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
  reviewerId: "",
  approverId: "",
  acknowledgedId: "",
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

  // Data for dropdowns
  const [departments, setDepartments] = useState<Department[]>([]);
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

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

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    onClose();
  };

  // Calculate word count for procedure content
  const getWordCount = (text: string) => {
    const strippedText = text.replace(/<[^>]*>/g, "").trim();
    if (!strippedText) return 0;
    return strippedText.split(/\s+/).length;
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
        <Select
          value={formData.reviewerId}
          onValueChange={(value) => updateFormData("reviewerId", value)}
        >
          <SelectTrigger className="h-12 border-[#E1E1E6] rounded-sm">
            <SelectValue placeholder="Reviewer" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} {user.position ? `- ${user.position.name}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Approver */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Approver</Label>
        <Select
          value={formData.approverId}
          onValueChange={(value) => updateFormData("approverId", value)}
        >
          <SelectTrigger className="h-12 border-[#E1E1E6] rounded-sm">
            <SelectValue placeholder="Approver" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} {user.position ? `- ${user.position.name}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Acknowledged */}
      <div className="space-y-1">
        <Label className="text-[#323238] text-sm font-bold">Acknowledged</Label>
        <Select
          value={formData.acknowledgedId}
          onValueChange={(value) => updateFormData("acknowledgedId", value)}
        >
          <SelectTrigger className="h-12 border-[#E1E1E6] rounded-sm">
            <SelectValue placeholder="Acknowledged" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} {user.position ? `- ${user.position.name}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            <Plus className="h-5 w-5 text-[#4DB1D4]" />
            Add New Document
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
                {isLoading ? "Generating..." : "Generate"}
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
