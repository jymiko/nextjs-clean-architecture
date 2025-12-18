'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { UserPreference, UpdateUserPreferenceDTO } from '@/domain/entities/UserPreference';

interface UseUserPreferencesResult {
  preferences: UserPreference | null;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (data: UpdateUserPreferenceDTO) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useUserPreferences(): UseUserPreferencesResult {
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchPreferences = useCallback(async () => {
    if (hasFetched.current) {
      return;
    }

    hasFetched.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/preferences', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setPreferences(null);
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      setPreferences(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
      setPreferences(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(
    async (data: UpdateUserPreferenceDTO): Promise<boolean> => {
      setError(null);

      try {
        const response = await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update preferences');
        }

        const result = await response.json();
        setPreferences(result.data);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update preferences');
        return false;
      }
    },
    []
  );

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refetch: () => {
      hasFetched.current = false;
      return fetchPreferences();
    },
  };
}
