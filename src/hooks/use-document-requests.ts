'use client';

import { useState, useEffect, useCallback } from 'react';

export type RequestDocumentStatus = 'pending' | 'approved' | 'rejected';

export interface DocumentRequestFilters {
  search?: string;
  categoryId?: string;
  status?: 'all' | RequestDocumentStatus;
}

export interface DocumentRequestData {
  id: string;
  requestCode: string;
  documentCode: string;
  documentTitle: string;
  type: string;
  requestBy: string;
  requestByPosition: string;
  ownedBy: string;
  requestDate: string;
  status: RequestDocumentStatus;
  remarks: string;
}

export interface RequestStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface UseDocumentRequestsParams {
  page?: number;
  limit?: number;
  filters?: DocumentRequestFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UseDocumentRequestsResult {
  requests: DocumentRequestData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: RequestStatistics;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDocumentRequests(params: UseDocumentRequestsParams = {}): UseDocumentRequestsResult {
  const {
    page = 1,
    limit = 10,
    filters = {},
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const [requests, setRequests] = useState<DocumentRequestData[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statistics, setStatistics] = useState<RequestStatistics>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
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
      if (filters.categoryId) {
        queryParams.set('categoryId', filters.categoryId);
      }
      if (filters.status && filters.status !== 'all') {
        queryParams.set('status', filters.status);
      }

      const response = await fetch(`/api/documents/requests?${queryParams.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch document requests');
      }

      const data = await response.json();

      setRequests(data.data || []);
      setPagination(data.pagination || { page, limit, total: 0, totalPages: 0 });
      setStatistics(data.statistics || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    pagination,
    statistics,
    isLoading,
    error,
    refetch: fetchRequests,
  };
}
