import { z } from 'zod';

// Hex color regex pattern
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Update branding schema
export const updateBrandingSchema = z.object({
  systemName: z
    .string()
    .min(1, 'System name is required')
    .max(100, 'System name must be at most 100 characters')
    .optional(),
  systemDescription: z
    .string()
    .max(500, 'System description must be at most 500 characters')
    .optional(),
  primaryColor: z
    .string()
    .regex(hexColorRegex, 'Primary color must be a valid hex color (e.g., #2563eb)')
    .optional(),
  secondaryColor: z
    .string()
    .regex(hexColorRegex, 'Secondary color must be a valid hex color (e.g., #8b5cf6)')
    .optional(),
  logoUrl: z
    .string()
    .url('Logo URL must be a valid URL')
    .nullable()
    .optional(),
});

// Generic system setting schemas
export const createSystemSettingSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .max(100, 'Key must be at most 100 characters')
    .regex(/^[a-z0-9._-]+$/, 'Key must be lowercase alphanumeric with dots, underscores, or hyphens'),
  value: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'json']),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be at most 50 characters'),
  description: z.string().max(255).optional(),
  isPublic: z.boolean().default(false),
});

export const updateSystemSettingSchema = z.object({
  value: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'json']).optional(),
  description: z.string().max(255).optional(),
  isPublic: z.boolean().optional(),
});

// Type exports
export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
export type CreateSystemSettingInput = z.infer<typeof createSystemSettingSchema>;
export type UpdateSystemSettingInput = z.infer<typeof updateSystemSettingSchema>;
