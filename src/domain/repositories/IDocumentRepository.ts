import {
  Document,
  CreateDocumentDTO,
  UpdateDocumentDTO,
  DocumentListResponse,
  DocumentQueryParams,
  DocumentApprovalDTO,
  DocumentCommentDTO,
  DocumentAttachmentDTO,
  DocumentDistributionDTO,
  DocumentSearchResult,
  DocumentComment,
  DocumentAttachment,
  DocumentDistribution,
} from '@/domain/entities/Document';
import {
  DocumentCategory,
  CreateDocumentCategoryInput,
} from '@/domain/entities/DocumentCategory';

// Status values matching Zod validation schema
export type DocumentSearchStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'ACTIVE' | 'REVISION_REQUIRED' | 'OBSOLETE' | 'ARCHIVED';

export interface DocumentSearchFilters {
  categoryId?: string;
  status?: DocumentSearchStatus;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  tags?: string[];
}

export interface IDocumentRepository {
  // Basic CRUD operations
  findAll(params: DocumentQueryParams): Promise<DocumentListResponse>;
  findById(id: string): Promise<Document | null>;
  create(data: CreateDocumentDTO): Promise<Document>;
  update(id: string, data: UpdateDocumentDTO): Promise<Document | null>;
  delete(id: string): Promise<Document | null>;

  // Document approvals
  updateApproval(documentId: string, approvalData: DocumentApprovalDTO & { approverId: string }): Promise<Document | null>;

  // Document comments
  getComments(documentId: string, params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }): Promise<{ data: DocumentComment[]; total: number }>;
  addComment(documentId: string, commentData: DocumentCommentDTO & { authorId: string }): Promise<DocumentComment>;

  // Document attachments
  getAttachments(documentId: string, params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }): Promise<{ data: DocumentAttachment[]; total: number }>;
  addAttachment(documentId: string, attachmentData: DocumentAttachmentDTO & { uploadedBy: string }): Promise<DocumentAttachment>;

  // Document distribution
  getDistributionHistory(documentId: string, params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }): Promise<{ data: DocumentDistribution[]; total: number }>;
  distributeDocument(documentId: string, distributionData: DocumentDistributionDTO & { distributedBy: string }): Promise<DocumentDistribution>;

  // Document search
  search(params: { query: string; filters?: DocumentSearchFilters; page?: number; limit?: number }): Promise<{ data: DocumentSearchResult[]; total: number }>;

  // Document categories
  getCategories(params: { isActive?: boolean }): Promise<DocumentCategory[]>;
  getCategoryById(id: string): Promise<DocumentCategory | null>;
  createCategory(data: CreateDocumentCategoryInput): Promise<DocumentCategory>;
  updateCategory(id: string, data: { name?: string; code?: string; description?: string | null; prefix?: string | null; isActive?: boolean }): Promise<DocumentCategory>;
  deleteCategory(id: string): Promise<void>;
}