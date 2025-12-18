'use client';

import { useState, useEffect } from 'react';

export interface FilterOption {
  id: string;
  name: string;
  code?: string;
}

export interface DocumentFilterOptions {
  departments: FilterOption[];
  categories: FilterOption[];
}

export interface UseDocumentFiltersResult {
  options: DocumentFilterOptions;
  isLoading: boolean;
  error: string | null;
}

export function useDocumentFilters(): UseDocumentFiltersResult {
  const [options, setOptions] = useState<DocumentFilterOptions>({
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
          departments: (departmentsData.data || []).map((d: { id: string; name: string; code?: string }) => ({
            id: d.id,
            name: d.name,
            code: d.code,
          })),
          categories: (categoriesData.data || []).map((c: { id: string; name: string; code?: string }) => ({
            id: c.id,
            name: c.name,
            code: c.code,
          })),
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
