"use client";

import { pdf } from "@react-pdf/renderer";
import { DocumentFormData, PdfAdditionalData, PdfSignatureData } from "@/presentation/components/document-submission";
import { DocumentPdfTemplate } from "@/presentation/components/document-submission/DocumentPdfTemplate";

// Re-export types for convenience
export type { PdfAdditionalData, PdfSignatureData };

/**
 * Generate Document PDF Blob using @react-pdf/renderer
 * Returns blob for preview/upload instead of auto-downloading
 * Supports multiple document types: SOP, WI, FORM, OPL, QS
 */
export async function generateDocumentPdf(
  formData: DocumentFormData,
  additionalData: PdfAdditionalData
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
 * Generate Final Document PDF with signatures and company stamp
 * This is used during document validation/finalization
 */
export async function generateFinalDocumentPdf(
  formData: DocumentFormData,
  additionalData: PdfAdditionalData,
  signatures: {
    preparedBy?: PdfSignatureData;
    reviewers?: PdfSignatureData[];
    approvers?: PdfSignatureData[];
    acknowledgers?: PdfSignatureData[];
  },
  companyStamp: string
): Promise<Blob> {
  try {
    const finalAdditionalData: PdfAdditionalData = {
      ...additionalData,
      signatures,
      companyStamp,
      includeSignatures: true,
    };

    const blob = await pdf(
      <DocumentPdfTemplate formData={formData} additionalData={finalAdditionalData} />
    ).toBlob();

    return blob;
  } catch (error) {
    console.error("Failed to generate final PDF:", error);
    throw new Error("Failed to generate final PDF. Please try again.");
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
