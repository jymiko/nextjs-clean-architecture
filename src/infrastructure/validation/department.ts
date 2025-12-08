import { z } from 'zod';

export const createDepartmentSchema = z.object({
  code: z.string()
    .min(2, 'Department code must be at least 2 characters')
    .max(20, 'Department code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Department code must contain only uppercase letters, numbers, and hyphens'),
  name: z.string()
    .min(3, 'Department name must be at least 3 characters')
    .max(100, 'Department name must not exceed 100 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  headOfDepartmentId: z.string().cuid('Invalid head of department ID').optional(),
  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = z.object({
  code: z.string()
    .min(2, 'Department code must be at least 2 characters')
    .max(20, 'Department code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Department code must contain only uppercase letters, numbers, and hyphens')
    .optional(),
  name: z.string()
    .min(3, 'Department name must be at least 3 characters')
    .max(100, 'Department name must not exceed 100 characters')
    .optional(),
  description: z.string().max(500, 'Description must not exceed 500 characters').nullable().optional(),
  headOfDepartmentId: z.string().cuid('Invalid head of department ID').nullable().optional(),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const departmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  sortBy: z.enum(['name', 'code', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type DepartmentQueryInput = z.infer<typeof departmentQuerySchema>;
