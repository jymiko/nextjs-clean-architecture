"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/presentation/components/Sidebar";
import { DocumentManagementHeader } from "@/presentation/components/document-management/DocumentManagementHeader";
import { PDFViewer } from "@/presentation/components/document-management/PDFViewer";
import {
  DocumentViewerInfoPanel,
  type DocumentViewerInfo,
} from "@/presentation/components/document-submission";
import { DocumentStatus } from "@/presentation/components/reports/DocumentStatusBadge";

// Mock document data - in real app, fetch based on ID
const mockDocumentData: Record<string, { document: DocumentViewerInfo; pdfUrl: string }> = {
  "1": {
    document: {
      id: "1",
      code: "STANDART-DT-009-002",
      title: "Dokumen Operasional",
      status: "revision_by_reviewer" as DocumentStatus,
      approvedDate: undefined,
      createdBy: "Firdiyatus Sholihah",
      createdByPosition: "Digital Transformation Staff",
      departmentOfDestination: ["DC - Document Control", "FS - Food Safety"],
      reviewBy: "Fadila Darojatu S.",
      reviewByPosition: "Digital Transformation Spv",
      approvedBy: "Arifah",
      approvedByPosition: "Document Control Staff",
      acknowledgedBy: [
        { name: "Trisna Pilandy", position: "Food Safety System Jr Manager" },
        { name: "Hamdan Mursyid", position: "Food Safety System Manager" },
      ],
      lastUpdate: "20 Oct 2025, 10:10",
      notes: "Tujuan dari pembuatan dokumen lebih diperjelas lagi",
    },
    pdfUrl: "/documents/draft-bawang.pdf",
  },
  "2": {
    document: {
      id: "2",
      code: "STANDART-WH-003-002",
      title: "Dokumen Operasional Warehouse",
      status: "on_approval" as DocumentStatus,
      approvedDate: "Mon, 23 Mar 2024",
      createdBy: "Alice Johnson",
      createdByPosition: "Warehouse Coordinator",
      departmentOfDestination: ["WH - Warehouse"],
      reviewBy: "Charlie Brown",
      reviewByPosition: "Warehouse Manager",
      approvedBy: "Bob Wilson",
      approvedByPosition: "Director Operations",
      acknowledgedBy: [
        { name: "Frank Castle", position: "QA Manager" },
      ],
      lastUpdate: "28 Feb 2024, 14:30",
    },
    pdfUrl: "/documents/draft-bawang.pdf",
  },
};

// Default document for unknown IDs
const defaultDocument: { document: DocumentViewerInfo; pdfUrl: string } = {
  document: {
    id: "unknown",
    code: "DOC-XXX-001",
    title: "Document Not Found",
    status: "draft" as DocumentStatus,
    createdBy: "System",
  },
  pdfUrl: "",
};

export default function DocumentViewerPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get document data (mock)
  const documentData = mockDocumentData[documentId] || defaultDocument;
  const { document: docInfo, pdfUrl } = documentData;

  const handleEdit = () => {
    // Navigate to edit page or open edit modal
    console.log("Edit document:", docInfo.id);
    // router.push(`/document-control/submission/${docInfo.id}/edit`);
  };

  const handleClose = () => {
    router.back();
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
