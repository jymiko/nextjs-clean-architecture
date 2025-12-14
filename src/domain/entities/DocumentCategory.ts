// Document category entity
export interface DocumentCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: DocumentCategory;
  children?: DocumentCategory[];
  _count?: {
    documents: number;
    children: number;
  };
}

// Input for creating a document category
export interface CreateDocumentCategoryInput {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
}

// Input for updating a document category
export interface UpdateDocumentCategoryInput {
  name?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

// DTO for document category with additional fields
export interface DocumentCategoryDTO extends DocumentCategory {
  documentCount?: number;
}