// Document status enum matching Prisma schema
export enum DocumentStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  ON_APPROVAL = 'ON_APPROVAL', // All reviewers approved, moving to approver stage
  PENDING_ACKNOWLEDGED = 'PENDING_ACKNOWLEDGED', // All approvers approved, waiting for acknowledged signatures
  ON_REVISION = 'ON_REVISION', // Revision requested, awaiting creator fix
  WAITING_VALIDATION = 'WAITING_VALIDATION', // All signed and approved, awaiting admin validation
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  REVISION_REQUIRED = 'REVISION_REQUIRED',
  OBSOLETE = 'OBSOLETE',
  ARCHIVED = 'ARCHIVED',
}

// Approval status enum matching Prisma schema
export enum ApprovalStatus {
  PENDING = 'PENDING',
  SIGNED = 'SIGNED', // User has signed but not yet clicked "Approved"
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVISION = 'NEEDS_REVISION',
}

// Distribution method enum
export enum DistributionMethod {
  EMAIL = 'EMAIL',
  PORTAL = 'PORTAL',
  PHYSICAL = 'PHYSICAL',
  SYSTEM = 'SYSTEM',
}

// Distribution status enum
export enum DistributionStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

// Priority enum
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Request type enum
export enum RequestType {
  NEW_DOCUMENT = 'NEW_DOCUMENT',
  REVISION = 'REVISION',
  ACCESS = 'ACCESS',
  INFORMATION = 'INFORMATION',
  DISTRIBUTION = 'DISTRIBUTION',
}

// Request status enum
export enum RequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export interface Document {
  id: string;
  documentNumber: string;
  title: string;
  description?: string | null;
  categoryId: string;
  category: {
    id: string;
    name: string;
    code: string;
    prefix?: string | null;
  };
  version: string;
  revisionNumber: number;
  status: DocumentStatus;
  approvalStatus: ApprovalStatus;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  tags: string[]; // DEPRECATED: Will migrate to DocumentTag table
  expiryDate?: Date | null;
  effectiveDate?: Date | null;
  isObsolete: boolean;
  obsoleteReason?: string | null;
  obsoleteDate?: Date | null;
  // Destination department
  destinationDepartmentId?: string | null;
  destinationDepartment?: {
    id: string;
    name: string;
    code?: string;
  } | null;
  estimatedDistributionDate?: Date | null;
  // Document content fields
  scope?: string | null;
  responsibleDocument?: string | null;
  termsAndAbbreviations?: string | null;
  warning?: string | null;
  relatedDocumentsText?: string | null;
  procedureContent?: string | null;
  // Signature/approval info
  reviewerName?: string | null;
  reviewerPosition?: string | null;
  approverName?: string | null;
  approverPosition?: string | null;
  acknowledgerName?: string | null;
  acknowledgerPosition?: string | null;
  // Revision tracking
  revisionCycle: number;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    employeeId?: string | null;
    avatar?: string | null;
  };
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
    employeeId?: string | null;
    avatar?: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
  // Relations
  approvals?: DocumentApproval[];
  distributions?: DocumentDistribution[];
  revisions?: DocumentRevision[];
  requests?: DocumentRequest[];
  comments?: DocumentComment[];
  attachments?: DocumentAttachment[];
  documentTags?: DocumentTag[];
  revisionRequests?: DocumentRevisionRequest[];
}

export interface DocumentApproval {
  id: string;
  documentId: string;
  approverId: string;
  approver: {
    id: string;
    name: string;
    email?: string;
    employeeId?: string | null;
    position?: {
      id?: string;
      name: string;
    } | null;
  };
  level: number;
  status: ApprovalStatus;
  comments?: string | null;
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  // Signature capture fields
  signatureImage?: string | null;
  signedAt?: Date | null;
  // Approval confirmation fields (separate from signing)
  confirmedAt?: Date | null;
  revisionCycle: number;
  requestedAt: Date;
  dueDate?: Date | null;
  reminderSent: boolean;
  lastReminder?: Date | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentDistribution {
  id: string;
  documentId: string;
  distributedToId: string;
  distributedTo: {
    id: string;
    name: string;
    email: string;
    employeeId?: string | null;
  };
  distributedBy: string;
  method: DistributionMethod;
  status: DistributionStatus;
  isAcknowledged: boolean;
  acknowledgedAt?: Date | null;
  notes?: string | null;
  distributedAt: Date;
  expiresAt?: Date | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

export interface DocumentRevision {
  id: string;
  documentId: string;
  revisionNumber: number;
  version: string;
  changeLog: string;
  revisedBy: string;
  revisor: {
    id: string;
    name: string;
    email: string;
    employeeId?: string | null;
  };
  fileUrl: string;
  createdAt: Date;
}

export interface DocumentRequest {
  id: string;
  documentId?: string | null;
  document?: Document | null;
  requestedById: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
    employeeId?: string | null;
  };
  requestType: RequestType;
  title: string;
  description: string;
  priority: Priority;
  status: RequestStatus;
  dueDate?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    employeeId?: string | null;
    avatar?: string | null;
  };
  comment: string;
  isInternal: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentAttachment {
  id: string;
  documentId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string | null;
  uploadedBy: string;
  uploader: {
    id: string;
    name: string;
    email: string;
    employeeId?: string | null;
  };
  createdAt: Date;
}

export interface DocumentTag {
  id: string;
  documentId: string;
  tagId: string;
  tag: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  };
  addedBy: string;
  createdAt: Date;
}

export interface CreateDocumentDTO {
  title: string;
  description?: string;
  categoryId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  tags?: string[];
  expiryDate?: Date;
  effectiveDate?: Date;
  ownerId: string;
}

export interface UpdateDocumentDTO {
  title?: string;
  description?: string | null;
  categoryId?: string;
  version?: string;
  status?: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  tags?: string[];
  expiryDate?: Date | null;
  effectiveDate?: Date | null;
  isObsolete?: boolean;
  obsoleteReason?: string | null;
  obsoleteDate?: Date | null;
  ownerId?: string;
}

export interface DocumentListResponse {
  data: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: DocumentStatus;
  approvalStatus?: ApprovalStatus;
  ownerId?: string;
  createdById?: string;
  tags?: string[];
  isObsolete?: boolean;
  sortBy?: 'title' | 'documentNumber' | 'createdAt' | 'updatedAt' | 'effectiveDate' | 'expiryDate';
  sortOrder?: 'asc' | 'desc';
}

export interface DocumentApprovalDTO {
  status: ApprovalStatus;
  comments?: string;
}

export interface DocumentDistributionDTO {
  distributedToId: string;
  method: DistributionMethod;
  notes?: string;
  expiresAt?: Date;
}

export interface DocumentCommentDTO {
  comment: string;
  isInternal?: boolean;
}

export interface DocumentAttachmentDTO {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string;
}

export interface DocumentRequestDTO {
  documentId?: string;
  requestType: RequestType;
  title: string;
  description: string;
  priority?: Priority;
  dueDate?: Date;
}

export interface DocumentSearchResult {
  id: string;
  title: string;
  description?: string;
  documentNumber: string;
  status: DocumentStatus;
  approvalStatus: ApprovalStatus;
  category: {
    name: string;
    code: string;
  };
  owner: {
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// Document revision request tracking (when reviewer/approver requests revision)
export interface DocumentRevisionRequest {
  id: string;
  documentId: string;
  requestedById: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
    employeeId?: string | null;
    position?: {
      id: string;
      name: string;
    } | null;
  };
  reason: string;
  approvalLevel: number;
  approvalId?: string | null;
  signatureSnapshot?: Record<string, unknown> | null;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  createdAt: Date;
}

// DTO for requesting revision
export interface RequestRevisionDTO {
  approvalId: string;
  reason: string;
}

// DTO for confirming approval
export interface ConfirmApprovalDTO {
  approvalId: string;
}

// DTO for admin validation
export interface ValidateDocumentDTO {
  action: 'APPROVE' | 'REJECT';
  comments?: string;
}