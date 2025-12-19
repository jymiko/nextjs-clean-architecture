'use client';

import { useState, useEffect, useCallback } from 'react';

export type DistributedDocumentStatus = 'active' | 'obsolete_request';

export interface DistributedDocumentFilters {
  search?: string;
  departmentId?: string;
  categoryId?: string;
  status?: 'all' | DistributedDocumentStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface DistributedDocumentData {
  id: string;
  distributionId: string;
  code: string;
  title: string;
  type: string;
  originDepartment: string;
  documentBy: string;
  distributedDate?: string;
  status: DistributedDocumentStatus;
  pdfUrl?: string;
}

export interface DistributedStatistics {
  total: number;
  active: number;
  obsoleteRequest: number;
}

export interface UseDistributedDocumentsParams {
  page?: number;
  limit?: number;
  filters?: DistributedDocumentFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UseDistributedDocumentsResult {
  documents: DistributedDocumentData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: DistributedStatistics;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDistributedDocuments(params: UseDistributedDocumentsParams = {}): UseDistributedDocumentsResult {
  const {
    page = 1,
    limit = 10,
    filters = {},
    sortBy = 'distributedAt',
    sortOrder = 'desc',
  } = params;

  const [documents, setDocuments] = useState<DistributedDocumentData[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statistics, setStatistics] = useState<DistributedStatistics>({
    total: 0,
    active: 0,
    obsoleteRequest: 0,
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
      if (filters.status && filters.status !== 'all') {
        queryParams.set('status', filters.status);
      }

      const response = await fetch(`/api/documents/distributed?${queryParams.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch distributed documents');
      }

      const data = await response.json();

      setDocuments(data.data || []);
      setPagination(data.pagination || { page, limit, total: 0, totalPages: 0 });
      setStatistics(data.statistics || { total: 0, active: 0, obsoleteRequest: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
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
    statistics,
    isLoading,
    error,
    refetch: fetchDocuments,
  };
}
