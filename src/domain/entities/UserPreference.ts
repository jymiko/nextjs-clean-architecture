// Notification frequency enum matching Prisma schema
export enum NotificationFrequency {
  IMMEDIATE = 'IMMEDIATE',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export interface UserPreference {
  id: string;
  userId: string;

  // Display settings
  language: string;
  timezone: string;
  dateFormat: string;
  theme: string;

  // Notification settings
  notifyEmail: boolean;
  notifyInApp: boolean;
  notifyPush: boolean;
  notifyApproval: boolean;
  notifyDistribution: boolean;
  notifyExpiring: boolean;
  notifyObsolete: boolean;
  notifyWeeklyDigest: boolean;
  notificationFrequency: NotificationFrequency;

  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserPreferenceDTO {
  language?: string;
  timezone?: string;
  dateFormat?: string;
  theme?: string;
  notifyEmail?: boolean;
  notifyInApp?: boolean;
  notifyPush?: boolean;
  notifyApproval?: boolean;
  notifyDistribution?: boolean;
  notifyExpiring?: boolean;
  notifyObsolete?: boolean;
  notifyWeeklyDigest?: boolean;
  notificationFrequency?: NotificationFrequency;
}

export interface FcmToken {
  id: string;
  preferenceId: string;
  token: string;
  deviceId?: string | null;
  deviceName?: string | null;
  platform?: string | null; // 'web' | 'android' | 'ios'
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterFcmTokenDTO {
  token: string;
  deviceId?: string;
  deviceName?: string;
  platform?: 'web' | 'android' | 'ios';
}
