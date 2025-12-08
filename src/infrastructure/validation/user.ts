import { z } from 'zod';

// Schema for user registration (auth)
export const createUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Schema for admin user management (CRUD)
export const createUserAdminSchema = z.object({
  employeeId: z.string()
    .min(3, 'Employee ID must be at least 3 characters')
    .max(20, 'Employee ID must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Employee ID must contain only uppercase letters, numbers, and hyphens')
    .optional(),
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .optional(),
  roleId: z.string().cuid('Invalid role ID').optional(),
  departmentId: z.string().cuid('Invalid department ID').optional(),
  positionId: z.string().cuid('Invalid position ID').optional(),
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const updateUserAdminSchema = z.object({
  employeeId: z.string()
    .min(3, 'Employee ID must be at least 3 characters')
    .max(20, 'Employee ID must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Employee ID must contain only uppercase letters, numbers, and hyphens')
    .nullable()
    .optional(),
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .optional(),
  roleId: z.string().cuid('Invalid role ID').nullable().optional(),
  departmentId: z.string().cuid('Invalid department ID').nullable().optional(),
  positionId: z.string().cuid('Invalid position ID').nullable().optional(),
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number format')
    .nullable()
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  roleId: z.string().cuid('Invalid role ID').optional(),
  departmentId: z.string().cuid('Invalid department ID').optional(),
  positionId: z.string().cuid('Invalid position ID').optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  sortBy: z.enum(['name', 'email', 'employeeId', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Legacy update schema for backward compatibility
export const updateUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
}).refine(data => data.name || data.email, {
  message: 'At least one field must be provided',
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const verifyResetTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyResetTokenInput = z.infer<typeof verifyResetTokenSchema>;