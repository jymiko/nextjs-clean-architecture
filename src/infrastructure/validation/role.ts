import { z } from 'zod';

export const createRoleSchema = z.object({
  code: z.string()
    .min(2, 'Role code must be at least 2 characters')
    .max(20, 'Role code must not exceed 20 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Role code must contain only uppercase letters, numbers, hyphens, and underscores'),
  name: z.string()
    .min(3, 'Role name must be at least 3 characters')
    .max(50, 'Role name must not exceed 50 characters'),
  description: z.string().max(255, 'Description must not exceed 255 characters').optional(),
  level: z.number().int().min(1, 'Level must be at least 1').max(100, 'Level must not exceed 100').default(1),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const updateRoleSchema = z.object({
  code: z.string()
    .min(2, 'Role code must be at least 2 characters')
    .max(20, 'Role code must not exceed 20 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Role code must contain only uppercase letters, numbers, hyphens, and underscores')
    .optional(),
  name: z.string()
    .min(3, 'Role name must be at least 3 characters')
    .max(50, 'Role name must not exceed 50 characters')
    .optional(),
  description: z.string().max(255, 'Description must not exceed 255 characters').nullable().optional(),
  level: z.number().int().min(1, 'Level must be at least 1').max(100, 'Level must not exceed 100').optional(),
  permissions: z.array(z.string()).nullable().optional(),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const roleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  sortBy: z.enum(['name', 'code', 'level', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type RoleQueryInput = z.infer<typeof roleQuerySchema>;
