'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@/domain/entities/User';

type CurrentUser = Omit<User, 'password'>;

interface UseCurrentUserResult {
  user: CurrentUser | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchCurrentUser = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (hasFetched.current) {
      return;
    }
    
    hasFetched.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return {
    user,
    isLoading,
    error,
    refetch: () => {
      hasFetched.current = false;
      return fetchCurrentUser();
    },
  };
}
