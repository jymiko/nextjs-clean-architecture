"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/presentation/components/Sidebar";
import { DocumentManagementHeader } from "@/presentation/components/document-management/DocumentManagementHeader";
import { PDFViewer } from "@/presentation/components/document-management/PDFViewer";
import {
  DocumentViewerInfoPanel,
  type DocumentViewerInfo,
} from "@/presentation/components/document-submission";
import { DocumentStatus } from "@/presentation/components/reports/DocumentStatusBadge";
import { useDocumentDetails } from "@/hooks/use-document-details";

// Map API status to UI status
function mapDocumentStatus(status: string, approvalStatus?: string): DocumentStatus {
  const statusMap: Record<string, DocumentStatus> = {
    'DRAFT': 'draft',
    'IN_REVIEW': 'on_review',
    'ON_APPROVAL': 'on_approval',
    'PENDING_ACKNOWLEDGED': 'pending_ack',
    'ON_REVISION': 'revision_by_reviewer',
    'WAITING_VALIDATION': 'waiting_validation',
    'APPROVED': 'approved',
    'ACTIVE': 'active',
    'REVISION_REQUIRED': 'revision_by_reviewer',
    'OBSOLETE': 'obsolete',
    'ARCHIVED': 'obsolete',
  };

  // Check approval status for more specific mapping
  if (approvalStatus === 'NEEDS_REVISION') {
    return 'revision_by_reviewer';
  }

  return statusMap[status] || 'draft';
}

// Format date for display
function formatDate(date: string | Date | undefined | null): string | undefined {
  if (!date) return undefined;
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return undefined;
  }
}

// Format datetime for display
function formatDateTime(date: string | Date | undefined | null): string | undefined {
  if (!date) return undefined;
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ', ' + d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return undefined;
  }
}

export default function DocumentViewerPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch document data from API
  const { document: apiDocument, isLoading, error } = useDocumentDetails(documentId);

  // Map API data to DocumentViewerInfo format
  const docInfo: DocumentViewerInfo = useMemo(() => {
    if (!apiDocument) {
      return {
        id: documentId || "unknown",
        code: "Loading...",
        title: "Loading document...",
        status: "draft" as DocumentStatus,
        createdBy: "",
      };
    }

    // Parse destination departments from comma-separated string
    const departmentOfDestination = apiDocument.destinationDepartmentName
      ? apiDocument.destinationDepartmentName.split(', ').filter(Boolean)
      : [];

    // Get reviewer from signatureApprovals (level 1)
    const reviewerApproval = apiDocument.signatureApprovals?.find(a => a.level === 1);
    const approverApproval = apiDocument.signatureApprovals?.find(a => a.level === 2);

    return {
      id: apiDocument.id,
      code: apiDocument.documentNumber,
      title: apiDocument.title,
      status: mapDocumentStatus(apiDocument.status, apiDocument.approvalStatus),
      approvedDate: formatDate(apiDocument.approvedDate),
      createdBy: apiDocument.createdByName || apiDocument.preparedBy?.name || "",
      createdByPosition: apiDocument.createdByPosition || apiDocument.preparedBy?.position,
      departmentOfDestination,
      reviewBy: reviewerApproval?.approver?.name || apiDocument.reviewerName,
      reviewByPosition: reviewerApproval?.approver?.position || apiDocument.reviewerPosition,
      approvedBy: approverApproval?.approver?.name || apiDocument.approverName,
      approvedByPosition: approverApproval?.approver?.position || apiDocument.approverPosition,
      acknowledgedBy: apiDocument.acknowledgers || [],
      lastUpdate: formatDateTime(apiDocument.lastUpdate || apiDocument.updatedAt),
      notes: apiDocument.description,
    };
  }, [apiDocument, documentId]);

  const pdfUrl = apiDocument?.pdfUrl || apiDocument?.fileUrl || "";

  const handleEdit = () => {
    // Navigate to edit page or open edit modal
    console.log("Edit document:", docInfo.id);
    // router.push(`/document-control/submission/${docInfo.id}/edit`);
  };

  const handleClose = () => {
    router.back();
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9fbff] relative">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          defaultExpandedItems={["document-control"]}
        />
        <div className="lg:ml-[280px] flex flex-col min-h-screen">
          <DocumentManagementHeader
            onMenuClick={() => setSidebarOpen(true)}
            title="Document Viewer"
            subtitle="Loading..."
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading document...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f9fbff] relative">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          defaultExpandedItems={["document-control"]}
        />
        <div className="lg:ml-[280px] flex flex-col min-h-screen">
          <DocumentManagementHeader
            onMenuClick={() => setSidebarOpen(true)}
            title="Document Viewer"
            subtitle="Error"
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">!</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Document</h2>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          title="Document Viewer"
          subtitle={docInfo.code}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
          {/* Document Info Panel - Left Side */}
          <div className="w-full lg:w-[380px] shrink-0">
            <DocumentViewerInfoPanel
              document={docInfo}
              onEdit={handleEdit}
              onClose={handleClose}
            />
          </div>

          {/* PDF Viewer - Right Side */}
          <div className="flex-1 bg-white rounded-lg border border-[#E1E2E3] overflow-hidden">
            <PDFViewer file={pdfUrl} showDownload={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
