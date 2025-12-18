'use client';

import { useState, useEffect, useCallback } from 'react';

export interface DocumentAcknowledger {
  name: string;
  position: string;
}

export interface DocumentPreparedBy {
  id?: string;
  name: string;
  position: string;
  signature?: string | null;
  signedAt?: string | null;
}

export interface SignatureApproval {
  id: string;
  level: number;
  approver: {
    id?: string;
    name: string;
    position: string;
  };
  signatureImage?: string | null;
  signedAt?: string | null;
  status: string;
}

export interface DocumentDetails {
  id: string;
  documentNumber: string;
  title: string;
  description?: string;
  status: string;
  approvalStatus?: string;
  fileUrl?: string;
  pdfUrl?: string;
  categoryName?: string;
  departmentName?: string;
  destinationDepartmentName?: string;
  createdByName?: string;
  createdByPosition?: string;
  preparedBy?: DocumentPreparedBy;
  signatureApprovals?: SignatureApproval[];
  reviewerName?: string;
  reviewerPosition?: string;
  approverName?: string;
  approverPosition?: string;
  acknowledgers?: DocumentAcknowledger[];
  approvedDate?: string;
  lastUpdate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  obsoleteDate?: string;
  obsoleteReason?: string;
  scope?: string;
  procedureContent?: string;
  warning?: string;
  termsAndAbbreviations?: string;
  responsibleDocument?: string;
  relatedDocumentsText?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UseDocumentDetailsResult {
  document: DocumentDetails | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDocumentDetails(documentId: string | null): UseDocumentDetailsResult {
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!documentId) {
      setDocument(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Document not found');
        }
        throw new Error('Failed to fetch document details');
      }

      const data = await response.json();

      // Map API response to DocumentDetails interface
      const mappedDocument: DocumentDetails = {
        id: data.id,
        documentNumber: data.documentNumber,
        title: data.title,
        description: data.description,
        status: data.status,
        approvalStatus: data.approvalStatus,
        fileUrl: data.fileUrl,
        pdfUrl: data.pdfUrl || data.fileUrl,
        categoryName: data.categoryName || data.category?.name,
        departmentName: data.departmentName,
        destinationDepartmentName: data.destinationDepartmentName,
        createdByName: data.createdByName || data.createdBy?.name,
        createdByPosition: data.createdByPosition,
        preparedBy: data.preparedBy,
        signatureApprovals: data.signatureApprovals,
        reviewerName: data.reviewerName,
        reviewerPosition: data.reviewerPosition,
        approverName: data.approverName,
        approverPosition: data.approverPosition,
        acknowledgers: data.acknowledgers,
        approvedDate: data.approvedDate,
        lastUpdate: data.lastUpdate || data.updatedAt,
        effectiveDate: data.effectiveDate,
        expiryDate: data.expiryDate,
        obsoleteDate: data.obsoleteDate,
        obsoleteReason: data.obsoleteReason,
        scope: data.scope,
        procedureContent: data.procedureContent,
        warning: data.warning,
        termsAndAbbreviations: data.termsAndAbbreviations,
        responsibleDocument: data.responsibleDocument,
        relatedDocumentsText: data.relatedDocumentsText,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      setDocument(mappedDocument);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch document');
      setDocument(null);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  return {
    document,
    isLoading,
    error,
    refetch: fetchDocument,
  };
}
