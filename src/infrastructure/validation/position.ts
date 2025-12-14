import { z } from 'zod';

export const createPositionSchema = z.object({
  code: z.string()
    .min(2, 'Position code must be at least 2 characters')
    .max(20, 'Position code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Position code must contain only uppercase letters, numbers, and hyphens'),
  name: z.string()
    .min(3, 'Position name must be at least 3 characters')
    .max(100, 'Position name must not exceed 100 characters'),
  departmentId: z.string().cuid('Invalid department ID').optional(),
  isActive: z.boolean().default(true),
});

export const updatePositionSchema = z.object({
  code: z.string()
    .min(2, 'Position code must be at least 2 characters')
    .max(20, 'Position code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Position code must contain only uppercase letters, numbers, and hyphens')
    .optional(),
  name: z.string()
    .min(3, 'Position name must be at least 3 characters')
    .max(100, 'Position name must not exceed 100 characters')
    .optional(),
  departmentId: z.string().cuid('Invalid department ID').nullable().optional(),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const positionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  departmentId: z.string().cuid('Invalid department ID').optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  sortBy: z.enum(['name', 'code', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
export type PositionQueryInput = z.infer<typeof positionQuerySchema>;
