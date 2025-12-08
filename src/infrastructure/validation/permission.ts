import { z } from 'zod';

export const createPermissionSchema = z.object({
  name: z
    .string()
    .min(3, 'Permission name must be at least 3 characters')
    .max(100, 'Permission name must not exceed 100 characters')
    .optional(),
  resource: z
    .string()
    .min(2, 'Resource must be at least 2 characters')
    .max(50, 'Resource must not exceed 50 characters')
    .regex(
      /^[a-z][a-z0-9_-]*$/,
      'Resource must start with lowercase letter and contain only lowercase letters, numbers, hyphens, and underscores'
    ),
  action: z
    .string()
    .min(2, 'Action must be at least 2 characters')
    .max(50, 'Action must not exceed 50 characters')
    .regex(
      /^[a-z][a-z0-9_-]*$/,
      'Action must start with lowercase letter and contain only lowercase letters, numbers, hyphens, and underscores'
    ),
  description: z.string().max(255, 'Description must not exceed 255 characters').optional(),
  category: z.string().max(50, 'Category must not exceed 50 characters').default('general'),
  isActive: z.boolean().default(true),
});

export const updatePermissionSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Permission name must be at least 3 characters')
      .max(100, 'Permission name must not exceed 100 characters')
      .optional(),
    resource: z
      .string()
      .min(2, 'Resource must be at least 2 characters')
      .max(50, 'Resource must not exceed 50 characters')
      .regex(
        /^[a-z][a-z0-9_-]*$/,
        'Resource must start with lowercase letter and contain only lowercase letters, numbers, hyphens, and underscores'
      )
      .optional(),
    action: z
      .string()
      .min(2, 'Action must be at least 2 characters')
      .max(50, 'Action must not exceed 50 characters')
      .regex(
        /^[a-z][a-z0-9_-]*$/,
        'Action must start with lowercase letter and contain only lowercase letters, numbers, hyphens, and underscores'
      )
      .optional(),
    description: z.string().max(255, 'Description must not exceed 255 characters').nullable().optional(),
    category: z.string().max(50, 'Category must not exceed 50 characters').optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const permissionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  resource: z.string().optional(),
  category: z.string().optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z.enum(['name', 'resource', 'action', 'category', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const assignPermissionsSchema = z.object({
  permissionIds: z
    .array(z.string().min(1, 'Permission ID cannot be empty'))
    .min(1, 'At least one permission ID is required'),
});

export const removePermissionsSchema = z.object({
  permissionIds: z
    .array(z.string().min(1, 'Permission ID cannot be empty'))
    .min(1, 'At least one permission ID is required'),
});

export const syncPermissionsSchema = z.object({
  permissionIds: z.array(z.string().min(1, 'Permission ID cannot be empty')),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type PermissionQueryInput = z.infer<typeof permissionQuerySchema>;
export type AssignPermissionsInput = z.infer<typeof assignPermissionsSchema>;
export type RemovePermissionsInput = z.infer<typeof removePermissionsSchema>;
export type SyncPermissionsInput = z.infer<typeof syncPermissionsSchema>;
