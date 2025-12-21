import { z } from 'zod';

// Schema for creating documents
export const createDocumentSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must not exceed 255 characters'),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  categoryId: z.string()
    .cuid('Invalid category ID'),
  fileUrl: z.string()
    .url('Invalid file URL')
    .min(1, 'File URL is required'),
  fileName: z.string()
    .min(1, 'File name is required')
    .max(255, 'File name must not exceed 255 characters'),
  fileSize: z.number()
    .int('File size must be an integer')
    .positive('File size must be positive')
    .max(100 * 1024 * 1024, 'File size must not exceed 100MB'), // 100MB max
  mimeType: z.string()
    .regex(/^application\/pdf$|^image\/(jpeg|png|gif|webp)$|^text\/plain$|^application\/msword|^application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)$/,
      'Unsupported file type. Only PDF, images, text, and Microsoft Office files are allowed'),
  tags: z.array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  expiryDate: z.coerce.date()
    .min(new Date(), 'Expiry date must be in the future')
    .optional(),
  effectiveDate: z.coerce.date()
    .optional(),
  ownerId: z.string()
    .cuid('Invalid owner ID'),
}).refine(data => {
  if (data.expiryDate && data.effectiveDate) {
    return data.expiryDate > data.effectiveDate;
  }
  return true;
}, {
  message: 'Expiry date must be after effective date',
  path: ['expiryDate'],
});

// Schema for updating documents
export const updateDocumentSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must not exceed 255 characters')
    .optional(),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .nullable()
    .optional(),
  categoryId: z.string()
    .cuid('Invalid category ID')
    .optional(),
  version: z.string()
    .regex(/^\d+\.\d+(\.\d+)?$/, 'Version must be in format x.y or x.y.z')
    .optional(),
  status: z.enum([
    'DRAFT', 'IN_REVIEW', 'ON_APPROVAL', 'PENDING_ACKNOWLEDGED', 'ON_REVISION',
    'WAITING_VALIDATION', 'APPROVED', 'ACTIVE', 'REVISION_REQUIRED', 'OBSOLETE', 'ARCHIVED'
  ]).optional(),
  fileUrl: z.string()
    .url('Invalid file URL')
    .min(1, 'File URL is required')
    .optional(),
  fileName: z.string()
    .min(1, 'File name is required')
    .max(255, 'File name must not exceed 255 characters')
    .optional(),
  fileSize: z.number()
    .int('File size must be an integer')
    .positive('File size must be positive')
    .max(100 * 1024 * 1024, 'File size must not exceed 100MB')
    .optional(),
  mimeType: z.string()
    .regex(/^application\/pdf$|^image\/(jpeg|png|gif|webp)$|^text\/plain$|^application\/msword|^application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)$/,
      'Unsupported file type')
    .optional(),
  tags: z.array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  expiryDate: z.coerce.date()
    .min(new Date(), 'Expiry date must be in the future')
    .nullable()
    .optional(),
  effectiveDate: z.coerce.date()
    .nullable()
    .optional(),
  isObsolete: z.boolean().optional(),
  obsoleteReason: z.string()
    .max(500, 'Obsolete reason must not exceed 500 characters')
    .nullable()
    .optional(),
  obsoleteDate: z.coerce.date()
    .nullable()
    .optional(),
  ownerId: z.string()
    .cuid('Invalid owner ID')
    .optional(),
  preparedBySignature: z.string()
    .nullable()
    .optional(),
  scope: z.string()
    .nullable()
    .optional(),
  responsibleDocument: z.string()
    .nullable()
    .optional(),
  termsAndAbbreviations: z.string()
    .nullable()
    .optional(),
  warning: z.string()
    .nullable()
    .optional(),
  relatedDocumentsText: z.string()
    .nullable()
    .optional(),
  procedureContent: z.string()
    .nullable()
    .optional(),
  destinationDepartmentId: z.string()
    .cuid('Invalid department ID')
    .nullable()
    .optional(),
  estimatedDistributionDate: z.string()
    .nullable()
    .optional(),
  reviewerIds: z.array(z.string().cuid('Invalid reviewer ID'))
    .optional(),
  approverIds: z.array(z.string().cuid('Invalid approver ID'))
    .optional(),
  acknowledgedIds: z.array(z.string().cuid('Invalid acknowledged ID'))
    .optional(),
}).refine(data => {
  if (data.expiryDate && data.effectiveDate && data.expiryDate !== null && data.effectiveDate !== null) {
    return data.expiryDate > data.effectiveDate;
  }
  return true;
}, {
  message: 'Expiry date must be after effective date',
  path: ['expiryDate'],
}).refine(data => {
  if (data.isObsolete && !data.obsoleteReason) {
    return false;
  }
  return true;
}, {
  message: 'Obsolete reason is required when marking document as obsolete',
  path: ['obsoleteReason'],
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Schema for document query parameters
export const documentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(255, 'Search term must not exceed 255 characters').optional(),
  categoryId: z.string().cuid('Invalid category ID').optional(),
  status: z.enum([
    'DRAFT', 'IN_REVIEW', 'ON_APPROVAL', 'PENDING_ACKNOWLEDGED', 'ON_REVISION',
    'WAITING_VALIDATION', 'APPROVED', 'ACTIVE', 'REVISION_REQUIRED', 'OBSOLETE', 'ARCHIVED'
  ]).optional(),
  approvalStatus: z.enum([
    'PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'
  ]).optional(),
  ownerId: z.string().cuid('Invalid owner ID').optional(),
  createdById: z.string().cuid('Invalid creator ID').optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  isObsolete: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  sortBy: z.enum([
    'title', 'documentNumber', 'createdAt', 'updatedAt',
    'effectiveDate', 'expiryDate', 'obsoleteDate'
  ]).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Schema for document approval
export const documentApprovalSchema = z.object({
  status: z.enum([
    'PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'
  ]),
  comments: z.string()
    .max(1000, 'Comments must not exceed 1000 characters')
    .optional(),
}).refine(data => {
  if (data.status === 'REJECTED' || data.status === 'NEEDS_REVISION') {
    return !!data.comments && data.comments.trim().length > 0;
  }
  return true;
}, {
  message: 'Comments are required when rejecting or requesting revision',
  path: ['comments'],
});

// Schema for document distribution
export const documentDistributionSchema = z.object({
  distributedToId: z.string()
    .cuid('Invalid user ID'),
  method: z.enum(['EMAIL', 'PORTAL', 'PHYSICAL', 'SYSTEM']),
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
  expiresAt: z.coerce.date()
    .min(new Date(), 'Expiry date must be in the future')
    .optional(),
});

// Schema for document comments
export const documentCommentSchema = z.object({
  comment: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must not exceed 1000 characters'),
  isInternal: z.boolean().default(false),
});

// Schema for document attachments
export const documentAttachmentSchema = z.object({
  fileName: z.string()
    .min(1, 'File name is required')
    .max(255, 'File name must not exceed 255 characters'),
  fileUrl: z.string()
    .url('Invalid file URL')
    .min(1, 'File URL is required'),
  fileSize: z.number()
    .int('File size must be an integer')
    .positive('File size must be positive')
    .max(100 * 1024 * 1024, 'File size must not exceed 100MB'),
  mimeType: z.string()
    .regex(/^application\/pdf$|^image\/(jpeg|png|gif|webp)$|^text\/plain$|^application\/msword|^application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)$/,
      'Unsupported file type'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
});

// Schema for document requests
export const documentRequestSchema = z.object({
  documentId: z.string()
    .cuid('Invalid document ID')
    .optional(),
  requestType: z.enum([
    'NEW_DOCUMENT', 'REVISION', 'ACCESS', 'INFORMATION', 'DISTRIBUTION'
  ]),
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must not exceed 255 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.coerce.date()
    .min(new Date(), 'Due date must be in the future')
    .optional(),
}).refine(data => {
  if (data.requestType === 'REVISION' && !data.documentId) {
    return false;
  }
  return true;
}, {
  message: 'Document ID is required for revision requests',
  path: ['documentId'],
});

// Schema for document categories
export const documentCategorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must not exceed 100 characters'),
  code: z.string()
    .min(2, 'Category code must be at least 2 characters')
    .max(20, 'Category code must not exceed 20 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Category code must contain only uppercase letters, numbers, hyphens, and underscores'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  prefix: z.string()
    .max(20, 'Prefix must not exceed 20 characters')
    .optional(),
});

// Schema for updating document categories
export const updateDocumentCategorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must not exceed 100 characters')
    .optional(),
  code: z.string()
    .min(2, 'Category code must be at least 2 characters')
    .max(20, 'Category code must not exceed 20 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Category code must contain only uppercase letters, numbers, hyphens, and underscores')
    .optional(),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .nullable()
    .optional(),
  prefix: z.string()
    .max(20, 'Prefix must not exceed 20 characters')
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Schema for bulk document operations
export const bulkDocumentOperationSchema = z.object({
  documentIds: z.array(z.string().cuid('Invalid document ID'))
    .min(1, 'At least one document ID is required')
    .max(50, 'Cannot process more than 50 documents at once'),
  operation: z.enum(['DELETE', 'ARCHIVE', 'OBSOLETE', 'ACTIVE']),
  reason: z.string()
    .max(500, 'Reason must not exceed 500 characters')
    .optional(),
}).refine(data => {
  if (data.operation === 'OBSOLETE' && !data.reason) {
    return false;
  }
  return true;
}, {
  message: 'Reason is required when marking documents as obsolete',
  path: ['reason'],
});

// Schema for document search
export const documentSearchSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(255, 'Search query must not exceed 255 characters'),
  filters: z.object({
    categoryId: z.string().cuid('Invalid category ID').optional(),
    status: z.enum([
      'DRAFT', 'IN_REVIEW', 'ON_APPROVAL', 'PENDING_ACKNOWLEDGED', 'ON_REVISION',
      'WAITING_VALIDATION', 'APPROVED', 'ACTIVE', 'REVISION_REQUIRED', 'OBSOLETE', 'ARCHIVED'
    ]).optional(),
    dateRange: z.object({
      from: z.coerce.date().optional(),
      to: z.coerce.date().optional(),
    }).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Export types
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type DocumentQueryInput = z.infer<typeof documentQuerySchema>;
export type DocumentApprovalInput = z.infer<typeof documentApprovalSchema>;
export type DocumentDistributionInput = z.infer<typeof documentDistributionSchema>;
export type DocumentCommentInput = z.infer<typeof documentCommentSchema>;
export type DocumentAttachmentInput = z.infer<typeof documentAttachmentSchema>;
export type DocumentRequestInput = z.infer<typeof documentRequestSchema>;
export type DocumentCategoryInput = z.infer<typeof documentCategorySchema>;
export type UpdateDocumentCategoryInput = z.infer<typeof updateDocumentCategorySchema>;
export type BulkDocumentOperationInput = z.infer<typeof bulkDocumentOperationSchema>;
export type DocumentSearchInput = z.infer<typeof documentSearchSchema>;