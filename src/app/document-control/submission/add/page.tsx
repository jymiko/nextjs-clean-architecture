"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/presentation/components/Sidebar";
import { DocumentManagementHeader } from "@/presentation/components/document-management/DocumentManagementHeader";
import { StepWizard, type Step } from "@/presentation/components/document-submission/StepWizard";
import { RichTextEditor } from "@/presentation/components/document-submission/RichTextEditor";
import { SignaturePad } from "@/presentation/components/document-submission/SignaturePad";
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
import { ArrowLeft, X, Calendar } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

const formSteps: Step[] = [
  { id: "document-info", label: "Document Information" },
  { id: "detail-document", label: "Detail Document" },
  { id: "procedure-document", label: "Procedure Document" },
  { id: "signature-document", label: "Signature Document" },
];

interface DocumentFormData {
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

  // Step 4: Signature
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

interface Department {
  id: string;
  name: string;
  code: string;
}

interface DocumentCategory {
  id: string;
  name: string;
  code: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  position?: { name: string } | null;
}

export default function AddDocumentPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DocumentFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data for dropdowns
  const [departments, setDepartments] = useState<Department[]>([]);
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch departments, categories, and users
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [deptRes, catRes, usersRes] = await Promise.all([
          fetch("/api/departments?limit=100", { credentials: 'include' }),
          fetch("/api/documents/categories?limit=100", { credentials: 'include' }),
          fetch("/api/users?limit=100", { credentials: 'include' }),
        ]);

        if (deptRes.ok) {
          const deptData = await deptRes.json();
          setDepartments(deptData.data || []);
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          setDocumentCategories(catData.data || []);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Set department from current user
  useEffect(() => {
    if (currentUser?.departmentId) {
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
        // Generate a code like "SOP-DT-001-001"
        const code = `${category.code}-${dept.code}-001-001`;
        setFormData((prev) => ({ ...prev, documentCode: code }));
      }
    }
  }, [formData.documentTypeId, formData.departmentId, documentCategories, departments]);

  const updateFormData = (
    field: keyof DocumentFormData,
    value: string
  ) => {
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

  const handleClose = () => {
    router.push("/document-control/submission");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/documents/submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentTypeId: formData.documentTypeId,
          documentTitle: formData.documentTitle,
          destinationDepartmentId: formData.destinationDepartmentId,
          estimatedDistributionDate: formData.estimatedDistributionDate,
          purpose: formData.purpose,
          scope: formData.scope,
          reviewerId: formData.reviewerId || undefined,
          approverId: formData.approverId || undefined,
          acknowledgedId: formData.acknowledgedId || undefined,
          responsibleDocument: formData.responsibleDocument,
          termsAndAbbreviations: formData.termsAndAbbreviations,
          warning: formData.warning,
          relatedDocuments: formData.relatedDocuments,
          procedureContent: formData.procedureContent,
          signature: formData.signature,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit document");
      }

      router.push("/document-control/submission");
    } catch (error) {
      console.error("Failed to submit document:", error);
      alert(error instanceof Error ? error.message : "Failed to submit document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Step 1: Document Information
  const renderStep1 = () => (
    <div className="flex flex-col gap-4">
      {/* Department (disabled) */}
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Departement
        </Label>
        <div className="h-14 px-4 py-2 bg-[#E1E2E3] border border-[#E1E1E6] rounded-sm flex items-center">
          <span className="text-[#243644] text-base font-normal font-['IBM_Plex_Sans']">
            {formData.departmentName || "Loading..."}
          </span>
        </div>
      </div>

      {/* Type Document */}
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Type Document
        </Label>
        <Select
          value={formData.documentTypeId}
          onValueChange={(value) => updateFormData("documentTypeId", value)}
        >
          <SelectTrigger className="h-14 border-[#E1E1E6] rounded-sm">
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

      {/* Document Code (disabled) */}
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Document Code
        </Label>
        <div className="h-14 px-4 py-2 bg-[#E1E2E3] border border-[#E1E1E6] rounded-sm flex items-center">
          <span className="text-[#8D8D99] text-base font-normal font-['IBM_Plex_Sans']">
            {formData.documentCode || "Document Code"}
          </span>
        </div>
      </div>

      {/* Document Title */}
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Document Title
        </Label>
        <Input
          value={formData.documentTitle}
          onChange={(e) => updateFormData("documentTitle", e.target.value)}
          placeholder="Document Title"
          className="h-14 border-[#E1E1E6] rounded-sm text-base font-['IBM_Plex_Sans']"
        />
      </div>

      {/* Department of Destination */}
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Department of Destination
        </Label>
        <Select
          value={formData.destinationDepartmentId}
          onValueChange={(value) => updateFormData("destinationDepartmentId", value)}
        >
          <SelectTrigger className="h-14 border-[#E1E1E6] rounded-sm">
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
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Estimated Last Date of Distribution
        </Label>
        <div className="relative">
          <Input
            type="date"
            value={formData.estimatedDistributionDate}
            onChange={(e) =>
              updateFormData("estimatedDistributionDate", e.target.value)
            }
            placeholder="Estimated Last Date of Distribution"
            className="h-14 border-[#E1E1E6] rounded-sm text-base font-['IBM_Plex_Sans'] pr-10"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#E53888] pointer-events-none" />
        </div>
      </div>
    </div>
  );

  // Step 2: Detail Document
  const renderStep2 = () => (
    <div className="flex flex-col gap-4">
      {/* Purpose */}
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Purpose
        </Label>
        <Input
          value={formData.purpose}
          onChange={(e) => updateFormData("purpose", e.target.value)}
          placeholder="Purpose "
          className="h-14 border-[#E1E1E6] rounded-sm text-base font-['IBM_Plex_Sans']"
        />
      </div>

      {/* Scope */}
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Scope
        </Label>
        <Textarea
          value={formData.scope}
          onChange={(e) => updateFormData("scope", e.target.value)}
          placeholder="Scope this document"
          className="min-h-[100px] border-[#E1E1E6] rounded-sm text-base font-['IBM_Plex_Sans'] resize-none"
        />
      </div>

      {/* Reviewer */}
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Reviewer
        </Label>
        <Select
          value={formData.reviewerId}
          onValueChange={(value) => updateFormData("reviewerId", value)}
        >
          <SelectTrigger className="h-14 border-[#E1E1E6] rounded-sm">
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
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Approver
        </Label>
        <Select
          value={formData.approverId}
          onValueChange={(value) => updateFormData("approverId", value)}
        >
          <SelectTrigger className="h-14 border-[#E1E1E6] rounded-sm">
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
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Acknowledged
        </Label>
        <Select
          value={formData.acknowledgedId}
          onValueChange={(value) => updateFormData("acknowledgedId", value)}
        >
          <SelectTrigger className="h-14 border-[#E1E1E6] rounded-sm">
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
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Responsible Document
        </Label>
        <Textarea
          value={formData.responsibleDocument}
          onChange={(e) => updateFormData("responsibleDocument", e.target.value)}
          placeholder="Responsible this document"
          className="min-h-[100px] border-[#E1E1E6] rounded-sm text-base font-['IBM_Plex_Sans'] resize-none"
        />
      </div>

      {/* List of Terms and Abbreviations */}
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          List of Terms and Abbreviations
        </Label>
        <Textarea
          value={formData.termsAndAbbreviations}
          onChange={(e) =>
            updateFormData("termsAndAbbreviations", e.target.value)
          }
          placeholder="List of Terms and Abbreviations in this document"
          className="min-h-[100px] border-[#E1E1E6] rounded-sm text-base font-['IBM_Plex_Sans'] resize-none"
        />
      </div>

      {/* Warning */}
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Warning
        </Label>
        <Textarea
          value={formData.warning}
          onChange={(e) => updateFormData("warning", e.target.value)}
          placeholder="Warning for this document"
          className="min-h-[100px] border-[#E1E1E6] rounded-sm text-base font-['IBM_Plex_Sans'] resize-none"
        />
      </div>

      {/* Related documents */}
      <div className="flex flex-col gap-1">
        <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
          Related documents
        </Label>
        <Textarea
          value={formData.relatedDocuments}
          onChange={(e) => updateFormData("relatedDocuments", e.target.value)}
          placeholder="Related document"
          className="min-h-[100px] border-[#E1E1E6] rounded-sm text-base font-['IBM_Plex_Sans'] resize-none"
        />
      </div>
    </div>
  );

  // Step 3: Procedure Document
  const renderStep3 = () => (
    <div className="flex flex-col gap-4">
      <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
        Detail Prosedure Document
      </Label>
      <RichTextEditor
        value={formData.procedureContent}
        onChange={(value) => updateFormData("procedureContent", value)}
        placeholder="Write your procedure document here..."
      />
    </div>
  );

  // Step 4: Signature Document
  const renderStep4 = () => (
    <div className="flex flex-col gap-4">
      <Label className="text-[#323238] text-base font-bold font-['IBM_Plex_Sans']">
        Signature your Document
      </Label>
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
          title="Add New Document"
          subtitle="Create a new document submission"
        />

        {/* Back Button */}
        <div className="bg-white px-4 py-3 border-b border-[#E1E2E3]">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-[#384654] hover:bg-[#E9F5FE]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Form Card */}
            <div className="bg-white rounded-lg border border-[#E1E1E6] p-8 overflow-hidden">
              {/* Step Wizard */}
              <StepWizard
                steps={formSteps}
                currentStep={currentStep}
                onStepClick={(step) => setCurrentStep(step)}
              />

              {/* Divider */}
              <div className="h-px bg-[#E1E1E6] my-8" />

              {/* Form Content */}
              {renderStepContent()}

              {/* Divider */}
              <div className="h-px bg-[#E1E1E6] my-8" />

              {/* Navigation Buttons */}
              <div className="flex items-center justify-end gap-8">
                <Button
                  variant="outline"
                  onClick={isFirstStep ? handleClose : handlePrevious}
                  className="w-[164px] h-11 border-[#F24822] text-[#F24822] hover:bg-[#FFE5E0] rounded-md font-semibold text-sm"
                >
                  {isFirstStep ? "Close" : "Previous"}
                </Button>

                <Button
                  onClick={isLastStep ? handleSubmit : handleNext}
                  disabled={isSubmitting}
                  className="w-[164px] h-11 bg-[#4DB1D4] hover:bg-[#3da0bf] text-white rounded-md font-semibold text-sm"
                >
                  {isLastStep
                    ? isSubmitting
                      ? "Generating..."
                      : "Generate"
                    : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
