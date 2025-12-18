'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ObsoleteDocumentFilters {
  search?: string;
  departmentId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ObsoleteDocumentData {
  id: string;
  code: string;
  title: string;
  type: string;
  department: string;
  createdBy: string;
  effectiveDate: string;
  obsoleteDate: string;
  remarks: string;
  pdfUrl: string;
}

export interface UseObsoleteDocumentsParams {
  page?: number;
  limit?: number;
  filters?: ObsoleteDocumentFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UseObsoleteDocumentsResult {
  documents: ObsoleteDocumentData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Format date for display
function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

export function useObsoleteDocuments(params: UseObsoleteDocumentsParams = {}): UseObsoleteDocumentsResult {
  const {
    page = 1,
    limit = 10,
    filters = {},
    sortBy = 'obsoleteDate',
    sortOrder = 'desc',
  } = params;

  const [documents, setDocuments] = useState<ObsoleteDocumentData[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', page.toString());
      queryParams.set('limit', limit.toString());
      queryParams.set('isObsolete', 'true');
      queryParams.set('sortBy', sortBy);
      queryParams.set('sortOrder', sortOrder);

      if (filters.search) {
        queryParams.set('search', filters.search);
      }
      if (filters.departmentId) {
        queryParams.set('departmentId', filters.departmentId);
      }
      if (filters.categoryId) {
        queryParams.set('categoryId', filters.categoryId);
      }
      if (filters.dateFrom) {
        queryParams.set('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        queryParams.set('dateTo', filters.dateTo);
      }

      const response = await fetch(`/api/documents?${queryParams.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch obsolete documents');
      }

      const data = await response.json();

      // Map API response to ObsoleteDocumentData interface
      const mappedDocuments: ObsoleteDocumentData[] = (data.data || []).map((doc: {
        id: string;
        documentNumber: string;
        title: string;
        category?: { name: string };
        destinationDepartment?: { name: string };
        createdBy?: { name: string };
        effectiveDate?: string;
        obsoleteDate?: string;
        obsoleteReason?: string;
        fileUrl?: string;
      }) => ({
        id: doc.id,
        code: doc.documentNumber,
        title: doc.title,
        type: doc.category?.name || '-',
        department: doc.destinationDepartment?.name || '-',
        createdBy: doc.createdBy?.name || '-',
        effectiveDate: formatDate(doc.effectiveDate),
        obsoleteDate: formatDate(doc.obsoleteDate),
        remarks: doc.obsoleteReason || '-',
        pdfUrl: doc.fileUrl || '',
      }));

      setDocuments(mappedDocuments);
      setPagination({
        page: data.pagination?.page || page,
        limit: data.pagination?.limit || limit,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch obsolete documents');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    pagination,
    isLoading,
    error,
    refetch: fetchDocuments,
  };
}
