'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  DashboardStatsResponse,
  DashboardStats,
  DashboardCharts,
  DashboardActivity,
  DashboardAlert,
  DatePresetValue,
} from '@/domain/entities/Dashboard';

export interface UseDashboardStatsParams {
  datePreset?: DatePresetValue;
  categoryId?: string;
}

export interface UseDashboardStatsResult {
  stats: DashboardStats | null;
  charts: DashboardCharts | null;
  recentActivities: DashboardActivity[];
  alerts: DashboardAlert[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(
  params: UseDashboardStatsParams = {}
): UseDashboardStatsResult {
  const { datePreset, categoryId } = params;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [recentActivities, setRecentActivities] = useState<DashboardActivity[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const paramsRef = useRef({ datePreset, categoryId });

  const fetchDashboardStats = useCallback(async (forceRefetch = false) => {
    // Prevent multiple simultaneous fetches unless forced
    if (hasFetched.current && !forceRefetch) {
      return;
    }

    hasFetched.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      if (datePreset) {
        queryParams.set('datePreset', datePreset);
      }
      if (categoryId) {
        queryParams.set('categoryId', categoryId);
      }

      const queryString = queryParams.toString();
      const url = `/api/dashboard/stats${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch dashboard stats');
      }

      const data: DashboardStatsResponse = await response.json();

      setStats(data.stats);
      setCharts(data.charts);
      setRecentActivities(data.recentActivities);
      setAlerts(data.alerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
      // Clear data on error
      setStats(null);
      setCharts(null);
      setRecentActivities([]);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [datePreset, categoryId]);

  // Effect to fetch data on mount and when params change
  useEffect(() => {
    // Check if params changed
    const paramsChanged =
      paramsRef.current.datePreset !== datePreset ||
      paramsRef.current.categoryId !== categoryId;

    if (paramsChanged) {
      paramsRef.current = { datePreset, categoryId };
      hasFetched.current = false; // Reset to allow new fetch
    }

    fetchDashboardStats();
  }, [fetchDashboardStats, datePreset, categoryId]);

  return {
    stats,
    charts,
    recentActivities,
    alerts,
    isLoading,
    error,
    refetch: () => {
      hasFetched.current = false;
      return fetchDashboardStats(true);
    },
  };
}
