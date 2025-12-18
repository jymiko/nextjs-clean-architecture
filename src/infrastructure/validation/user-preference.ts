import { z } from 'zod';

// Notification frequency enum schema
export const notificationFrequencySchema = z.enum(['IMMEDIATE', 'HOURLY', 'DAILY', 'WEEKLY']);

// Schema for updating user preferences
export const updateUserPreferenceSchema = z.object({
  language: z.string().min(2).max(5).optional(),
  timezone: z.string().min(1).max(50).optional(),
  dateFormat: z.string().min(1).max(20).optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  notifyEmail: z.boolean().optional(),
  notifyInApp: z.boolean().optional(),
  notifyPush: z.boolean().optional(),
  notifyApproval: z.boolean().optional(),
  notifyDistribution: z.boolean().optional(),
  notifyExpiring: z.boolean().optional(),
  notifyObsolete: z.boolean().optional(),
  notifyWeeklyDigest: z.boolean().optional(),
  notificationFrequency: notificationFrequencySchema.optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Schema for registering FCM token
export const registerFcmTokenSchema = z.object({
  token: z.string().min(1, 'FCM token is required'),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
  platform: z.enum(['web', 'android', 'ios']).optional(),
});

// Type exports
export type UpdateUserPreferenceInput = z.infer<typeof updateUserPreferenceSchema>;
export type RegisterFcmTokenInput = z.infer<typeof registerFcmTokenSchema>;
