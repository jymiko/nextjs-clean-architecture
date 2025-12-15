import { z } from 'zod';

export const createDivisionSchema = z.object({
  code: z.string()
    .min(2, 'Division code must be at least 2 characters')
    .max(20, 'Division code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Division code must contain only uppercase letters, numbers, and hyphens'),
  name: z.string()
    .min(3, 'Division name must be at least 3 characters')
    .max(100, 'Division name must not exceed 100 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  headOfDivisionId: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().cuid('Invalid head of division ID').optional()
  ),
  isActive: z.boolean().default(true),
});

export const updateDivisionSchema = z.object({
  code: z.string()
    .min(2, 'Division code must be at least 2 characters')
    .max(20, 'Division code must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Division code must contain only uppercase letters, numbers, and hyphens')
    .optional(),
  name: z.string()
    .min(3, 'Division name must be at least 3 characters')
    .max(100, 'Division name must not exceed 100 characters')
    .optional(),
  description: z.string().max(500, 'Description must not exceed 500 characters').nullable().optional(),
  headOfDivisionId: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().cuid('Invalid head of division ID').nullable().optional()
  ),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const divisionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  sortBy: z.enum(['name', 'code', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateDivisionInput = z.infer<typeof createDivisionSchema>;
export type UpdateDivisionInput = z.infer<typeof updateDivisionSchema>;
export type DivisionQueryInput = z.infer<typeof divisionQuerySchema>;
