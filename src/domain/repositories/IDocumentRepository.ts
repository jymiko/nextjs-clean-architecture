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
} from '@/domain/entities/Document';
import {
  DocumentCategory,
  CreateDocumentCategoryInput,
} from '@/domain/entities/DocumentCategory';

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
  getComments(documentId: string, params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }): Promise<{ data: any[]; total: number }>;
  addComment(documentId: string, commentData: DocumentCommentDTO & { authorId: string }): Promise<any>;

  // Document attachments
  getAttachments(documentId: string, params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }): Promise<{ data: any[]; total: number }>;
  addAttachment(documentId: string, attachmentData: DocumentAttachmentDTO & { uploadedBy: string }): Promise<any>;

  // Document distribution
  getDistributionHistory(documentId: string, params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }): Promise<{ data: any[]; total: number }>;
  distributeDocument(documentId: string, distributionData: DocumentDistributionDTO & { distributedBy: string }): Promise<any>;

  // Document search
  search(params: { query: string; filters?: any; page?: number; limit?: number }): Promise<{ data: DocumentSearchResult[]; total: number }>;

  // Document categories
  getCategories(params: { isActive?: boolean }): Promise<DocumentCategory[]>;
  createCategory(data: CreateDocumentCategoryInput): Promise<DocumentCategory>;
}