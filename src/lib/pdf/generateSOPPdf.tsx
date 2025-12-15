"use client";

import { pdf } from "@react-pdf/renderer";
import { DocumentFormData } from "@/presentation/components/document-submission";
import { DocumentPdfTemplate } from "@/presentation/components/document-submission/DocumentPdfTemplate";

interface AdditionalData {
  documentTypeName: string;
  destinationDepartmentName: string;
  reviewerName?: string;
  approverName?: string;
  acknowledgedName?: string;
  reviewerNames?: string[];
  approverNames?: string[];
  acknowledgedNames?: string[];
}

/**
 * Generate Document PDF Blob using @react-pdf/renderer
 * Returns blob for preview/upload instead of auto-downloading
 * Supports multiple document types: SOP, WI, FORM, OPL, QS
 */
export async function generateDocumentPdf(
  formData: DocumentFormData,
  additionalData: AdditionalData
): Promise<Blob> {
  try {
    // Create PDF document and return blob
    const blob = await pdf(
      <DocumentPdfTemplate formData={formData} additionalData={additionalData} />
    ).toBlob();

    return blob;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
}

/**
 * Helper function to download PDF blob
 */
export function downloadPdfBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename for PDF based on document code and date
 */
export function generatePdfFileName(documentCode: string): string {
  const date = new Date().toISOString().split("T")[0];
  const docCode = documentCode || "DRAFT";
  return `${docCode.replace(/\//g, "-")}-${date}.pdf`;
}

// Keep old function name for backward compatibility
export const generateSOPPdf = generateDocumentPdf;
