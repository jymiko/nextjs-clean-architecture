'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ReportDocumentResponse, ReportStatistics, ReportResponse } from '@/app/api/reports/documents/route';

export interface ReportFilters {
  search?: string;
  departmentId?: string;
  categoryId?: string;
  status?: 'active' | 'obsolete' | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export interface UseReportsParams {
  page?: number;
  limit?: number;
  filters?: ReportFilters;
  sortBy?: 'createdAt' | 'title' | 'documentNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface UseReportsResult {
  documents: ReportDocumentResponse[];
  statistics: ReportStatistics;
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

export function useReports(params: UseReportsParams = {}): UseReportsResult {
  const {
    page = 1,
    limit = 10,
    filters = {},
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const [documents, setDocuments] = useState<ReportDocumentResponse[]>([]);
  const [statistics, setStatistics] = useState<ReportStatistics>({
    total: 0,
    active: 0,
    obsolete: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
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
      if (filters.dateFrom) {
        queryParams.set('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        queryParams.set('dateTo', filters.dateTo);
      }

      const response = await fetch(`/api/reports/documents?${queryParams.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data: ReportResponse = await response.json();
      setDocuments(data.data);
      setStatistics(data.statistics);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      setDocuments([]);
      setStatistics({ total: 0, active: 0, obsolete: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    documents,
    statistics,
    pagination,
    isLoading,
    error,
    refetch: fetchReports,
  };
}

// Hook for fetching filter options (departments and categories)
export interface FilterOptions {
  departments: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export interface UseReportFiltersResult {
  options: FilterOptions;
  isLoading: boolean;
  error: string | null;
}

export function useReportFilters(): UseReportFiltersResult {
  const [options, setOptions] = useState<FilterOptions>({
    departments: [],
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [departmentsRes, categoriesRes] = await Promise.all([
          fetch('/api/departments?limit=100&isActive=true', { credentials: 'include' }),
          fetch('/api/documents/categories?isActive=true', { credentials: 'include' }),
        ]);

        if (!departmentsRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch filter options');
        }

        const [departmentsData, categoriesData] = await Promise.all([
          departmentsRes.json(),
          categoriesRes.json(),
        ]);

        setOptions({
          departments: departmentsData.data?.map((d: any) => ({ id: d.id, name: d.name })) || [],
          categories: categoriesData.data?.map((c: any) => ({ id: c.id, name: c.name })) || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch filter options');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { options, isLoading, error };
}
