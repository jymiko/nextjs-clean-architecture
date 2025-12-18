'use client';

import { useState, useEffect, useCallback } from 'react';

export type ManagementDocumentStatus = 'active' | 'pending_obsolete_approval' | 'expiring_soon';

export interface ManagementDocumentFilters {
  search?: string;
  departmentId?: string;
  categoryId?: string;
  status?: 'all' | ManagementDocumentStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface ManagementDocumentData {
  id: string;
  code: string;
  title: string;
  type: string;
  department?: string;
  approvedDate?: string;
  distributedDate?: string;
  expiredDate?: string;
  status: ManagementDocumentStatus;
  pdfUrl?: string;
}

export interface ManagementStatistics {
  total: number;
  active: number;
  pendingObsolete: number;
  expiringSoon: number;
}

export interface UseManagementDocumentsParams {
  page?: number;
  limit?: number;
  filters?: ManagementDocumentFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UseManagementDocumentsResult {
  documents: ManagementDocumentData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: ManagementStatistics;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useManagementDocuments(params: UseManagementDocumentsParams = {}): UseManagementDocumentsResult {
  const {
    page = 1,
    limit = 10,
    filters = {},
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const [documents, setDocuments] = useState<ManagementDocumentData[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statistics, setStatistics] = useState<ManagementStatistics>({
    total: 0,
    active: 0,
    pendingObsolete: 0,
    expiringSoon: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);
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

      const response = await fetch(`/api/documents/management?${queryParams.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch management documents');
      }

      const data = await response.json();

      setDocuments(data.data || []);
      setPagination(data.pagination || { page, limit, total: 0, totalPages: 0 });
      setStatistics(data.statistics || { total: 0, active: 0, pendingObsolete: 0, expiringSoon: 0 });
      setIsAdmin(data.isAdmin || false);
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
    isAdmin,
    isLoading,
    error,
    refetch: fetchDocuments,
  };
}
