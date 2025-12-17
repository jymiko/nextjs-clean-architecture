// Dashboard TypeScript Interfaces
// These interfaces define the data structures for the dashboard API and components

// ============================================
// Stats for StatCard components
// ============================================

export interface DashboardStats {
  totalDocuments: number;
  totalDocumentsChange: number; // percentage change from last month
  pendingApprovals: number;
  expiringSoon: number; // documents expiring within 7 days
  newSubmissions: number; // new submissions this month
}

// ============================================
// Charts Data
// ============================================

// Line Chart - Monthly document data
export interface MonthlyDocumentData {
  month: string; // e.g., "Jan", "Feb", "Mar"
  year: number;
  count: number;
}

// Pie Chart - Document status distribution
export interface DocumentStatusDistribution {
  active: number;
  obsolete: number;
  draft: number;
  inReview: number;
}

// Category distribution for pie chart
export interface CategoryDistribution {
  categoryId: string;
  categoryName: string;
  count: number;
  percentage: number;
}

// Aggregated charts data
export interface DashboardCharts {
  documentsByMonth: MonthlyDocumentData[];
  documentsByStatus: DocumentStatusDistribution;
  documentsByCategory: CategoryDistribution[];
}

// ============================================
// Recent Activities
// ============================================

export type ActivityAction =
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_REVISION'
  | 'SUBMITTED'
  | 'DISTRIBUTED';

export type ActivityType = 'approved' | 'revision';

export interface DashboardActivity {
  id: string;
  documentNumber: string;
  documentTitle: string;
  action: ActivityAction;
  actionBy: string;
  actionByRole: string;
  timestamp: string; // ISO date string
  type: ActivityType;
}

// ============================================
// Alerts & Reminders
// ============================================

export type AlertSeverity = 'error' | 'warning';
export type AlertType = 'expiring' | 'pending_distribution' | 'obsolete';

export interface DashboardAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  count: number;
  documentIds: string[];
}

// ============================================
// API Response
// ============================================

export interface DashboardStatsResponse {
  stats: DashboardStats;
  charts: DashboardCharts;
  recentActivities: DashboardActivity[];
  alerts: DashboardAlert[];
}

// ============================================
// Date Range Presets
// ============================================

export const DATE_PRESETS = [
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 3 months', value: '3m' },
  { label: 'Last 6 months', value: '6m' },
  { label: 'This year', value: 'year' },
] as const;

export type DatePresetValue = typeof DATE_PRESETS[number]['value'];

// Helper function to calculate date range from preset
export function getDateRangeFromPreset(preset: DatePresetValue): { from: Date; to: Date } {
  const now = new Date();
  const to = now;
  let from: Date;

  switch (preset) {
    case '30d':
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3m':
      from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case '6m':
      from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      break;
    case 'year':
      from = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  }

  return { from, to };
}
