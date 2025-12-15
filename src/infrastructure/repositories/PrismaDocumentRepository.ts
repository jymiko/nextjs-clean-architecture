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
  ApprovalStatus,
  DocumentStatus,
  DistributionMethod,
  DistributionStatus,
} from '@/domain/entities/Document';
import { DocumentCategory } from '@/domain/entities/DocumentCategory';
import { IDocumentRepository } from '@/domain/repositories/IDocumentRepository';
import { prisma } from '../database';
import { NotFoundError, ConflictError } from '../errors';

export class PrismaDocumentRepository implements IDocumentRepository {
  async findAll(params: DocumentQueryParams): Promise<DocumentListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      status,
      approvalStatus,
      ownerId,
      createdById,
      tags,
      isObsolete,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (approvalStatus) {
      where.approvalStatus = approvalStatus;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (createdById) {
      where.createdById = createdById;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    if (isObsolete !== undefined) {
      where.isObsolete = isObsolete;
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: { id: true, name: true, code: true, prefix: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, employeeId: true, avatar: true },
          },
          owner: {
            select: { id: true, name: true, email: true, employeeId: true, avatar: true },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    const mappedDocuments = documents.map((doc) => ({
      ...doc,
      tags: doc.tags as string[],
      approvals: undefined,
      distributions: undefined,
      revisions: undefined,
      requests: undefined,
      comments: undefined,
      attachments: undefined,
      documentTags: undefined,
    }));

    return {
      data: mappedDocuments as Document[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Document | null> {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        category: true,
        destinationDepartment: true,
        createdBy: {
          select: { id: true, name: true, email: true, employeeId: true, avatar: true },
        },
        owner: {
          select: { id: true, name: true, email: true, employeeId: true, avatar: true },
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, email: true, employeeId: true },
            },
          },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, employeeId: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          include: {
            uploader: {
              select: { id: true, name: true, email: true, employeeId: true },
            },
          },
        },
        documentTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!document) return null;

    return {
      ...document,
      tags: document.tags as string[],
    } as Document;
  }

  async create(data: CreateDocumentDTO): Promise<Document> {
    // Generate document number
    const category = await prisma.documentCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const latestDocument = await prisma.document.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { documentNumber: 'desc' },
    });

    let sequence = 1;
    if (latestDocument) {
      const match = latestDocument.documentNumber.match(/-(\d+)$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }

    const documentNumber = `${category.code}-${sequence.toString().padStart(3, '0')}`;

    const document = await prisma.document.create({
      data: {
        documentNumber,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        version: '1.0',
        revisionNumber: 0,
        status: DocumentStatus.DRAFT,
        approvalStatus: ApprovalStatus.PENDING,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        tags: data.tags || [],
        expiryDate: data.expiryDate,
        effectiveDate: data.effectiveDate,
        createdById: data.ownerId, // For now, creator is the same as owner
        ownerId: data.ownerId,
      },
      include: {
        category: {
          select: { id: true, name: true, code: true, prefix: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, employeeId: true, avatar: true },
        },
        owner: {
          select: { id: true, name: true, email: true, employeeId: true, avatar: true },
        },
      },
    });

    return {
      ...document,
      tags: document.tags as string[],
    } as Document;
  }

  async update(id: string, data: UpdateDocumentDTO): Promise<Document | null> {
    const existingDocument = await this.findById(id);
    if (!existingDocument) {
      throw new NotFoundError('Document not found');
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        version: data.version,
        status: data.status,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        tags: data.tags,
        expiryDate: data.expiryDate,
        effectiveDate: data.effectiveDate,
        isObsolete: data.isObsolete,
        obsoleteReason: data.obsoleteReason,
        obsoleteDate: data.obsoleteDate,
        ownerId: data.ownerId,
      },
      include: {
        category: {
          select: { id: true, name: true, code: true, prefix: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, employeeId: true, avatar: true },
        },
        owner: {
          select: { id: true, name: true, email: true, employeeId: true, avatar: true },
        },
      },
    });

    return {
      ...document,
      tags: document.tags as string[],
    } as Document;
  }

  async delete(id: string): Promise<Document | null> {
    const existingDocument = await this.findById(id);
    if (!existingDocument) {
      throw new NotFoundError('Document not found');
    }

    const document = await prisma.document.delete({
      where: { id },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true, employeeId: true, avatar: true },
        },
        owner: {
          select: { id: true, name: true, email: true, employeeId: true, avatar: true },
        },
      },
    });

    return {
      ...document,
      tags: document.tags as string[],
    } as Document;
  }

  async updateApproval(documentId: string, approvalData: DocumentApprovalDTO & { approverId: string }): Promise<Document | null> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    // Check if user already approved this document
    const existingApproval = await prisma.documentApproval.findFirst({
      where: {
        documentId,
        approverId: approvalData.approverId,
      },
    });

    if (existingApproval) {
      // Update existing approval
      await prisma.documentApproval.update({
        where: { id: existingApproval.id },
        data: {
          status: approvalData.status,
          comments: approvalData.comments,
          approvedAt: approvalData.status === ApprovalStatus.APPROVED ? new Date() : null,
          rejectedAt: approvalData.status === ApprovalStatus.REJECTED ? new Date() : null,
        },
      });
    } else {
      // Create new approval
      const latestApproval = await prisma.documentApproval.findFirst({
        where: { documentId },
        orderBy: { level: 'desc' },
      });

      await prisma.documentApproval.create({
        data: {
          documentId,
          approverId: approvalData.approverId,
          level: latestApproval ? latestApproval.level + 1 : 1,
          status: approvalData.status,
          comments: approvalData.comments,
          approvedAt: approvalData.status === ApprovalStatus.APPROVED ? new Date() : null,
          rejectedAt: approvalData.status === ApprovalStatus.REJECTED ? new Date() : null,
        },
      });
    }

    // Update document approval status
    const allApprovals = await prisma.documentApproval.findMany({
      where: { documentId },
    });

    const allApproved = allApprovals.every(app => app.status === ApprovalStatus.APPROVED);
    const anyRejected = allApprovals.some(app => app.status === ApprovalStatus.REJECTED);

    let newApprovalStatus = ApprovalStatus.IN_PROGRESS;
    if (allApproved) {
      newApprovalStatus = ApprovalStatus.APPROVED;
    } else if (anyRejected) {
      newApprovalStatus = ApprovalStatus.REJECTED;
    }

    await prisma.document.update({
      where: { id: documentId },
      data: {
        approvalStatus: newApprovalStatus,
        status: newApprovalStatus === ApprovalStatus.APPROVED ? DocumentStatus.APPROVED : document.status,
      },
    });

    return this.findById(documentId);
  }

  async getComments(
    documentId: string,
    params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }
  ): Promise<{ data: any[]; total: number }> {
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.documentComment.findMany({
        where: { documentId, isDeleted: false },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: { id: true, name: true, email: true, employeeId: true, avatar: true },
          },
        },
      }),
      prisma.documentComment.count({
        where: { documentId, isDeleted: false },
      }),
    ]);

    return { data: comments, total };
  }

  async addComment(documentId: string, commentData: DocumentCommentDTO & { authorId: string }): Promise<any> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    return prisma.documentComment.create({
      data: {
        documentId,
        authorId: commentData.authorId,
        comment: commentData.comment,
        isInternal: commentData.isInternal || false,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, employeeId: true, avatar: true },
        },
      },
    });
  }

  async getAttachments(
    documentId: string,
    params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }
  ): Promise<{ data: any[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const [attachments, total] = await Promise.all([
      prisma.documentAttachment.findMany({
        where: { documentId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          uploader: {
            select: { id: true, name: true, email: true, employeeId: true },
          },
        },
      }),
      prisma.documentAttachment.count({
        where: { documentId },
      }),
    ]);

    return { data: attachments, total };
  }

  async addAttachment(documentId: string, attachmentData: DocumentAttachmentDTO & { uploadedBy: string }): Promise<any> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    return prisma.documentAttachment.create({
      data: {
        documentId,
        fileName: attachmentData.fileName,
        fileUrl: attachmentData.fileUrl,
        fileSize: attachmentData.fileSize,
        mimeType: attachmentData.mimeType,
        description: attachmentData.description,
        uploadedBy: attachmentData.uploadedBy,
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true, employeeId: true },
        },
      },
    });
  }

  async getDistributionHistory(
    documentId: string,
    params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }
  ): Promise<{ data: any[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'distributedAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const [distributions, total] = await Promise.all([
      prisma.documentDistribution.findMany({
        where: { documentId, isDeleted: false },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          distributedTo: {
            select: { id: true, name: true, email: true, employeeId: true },
          },
        },
      }),
      prisma.documentDistribution.count({
        where: { documentId, isDeleted: false },
      }),
    ]);

    return { data: distributions, total };
  }

  async distributeDocument(documentId: string, distributionData: DocumentDistributionDTO & { distributedBy: string }): Promise<any> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    return prisma.documentDistribution.create({
      data: {
        documentId,
        distributedToId: distributionData.distributedToId,
        distributedBy: distributionData.distributedBy,
        method: distributionData.method,
        status: DistributionStatus.SENT,
        notes: distributionData.notes,
        expiresAt: distributionData.expiresAt,
      },
      include: {
        distributedTo: {
          select: { id: true, name: true, email: true, employeeId: true },
        },
      },
    });
  }

  async search(params: { query: string; filters?: any; page?: number; limit?: number }): Promise<{ data: DocumentSearchResult[]; total: number }> {
    const { query, filters, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { documentNumber: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.dateRange) {
      where.createdAt = {};
      if (filters.dateRange.from) {
        where.createdAt.gte = new Date(filters.dateRange.from);
      }
      if (filters.dateRange.to) {
        where.createdAt.lte = new Date(filters.dateRange.to);
      }
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          documentNumber: true,
          status: true,
          approvalStatus: true,
          category: {
            select: { name: true, code: true },
          },
          owner: {
            select: { name: true },
          },
          createdAt: true,
          updatedAt: true,
          fileUrl: true,
          fileName: true,
          fileSize: true,
          mimeType: true,
        },
      }),
      prisma.document.count({ where }),
    ]);

    return { data: documents as DocumentSearchResult[], total };
  }

  async getCategories(params: { isActive?: boolean }): Promise<DocumentCategory[]> {
    const where: any = {};
    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const categories = await prisma.documentCategory.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      code: cat.code,
      description: cat.description || undefined,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));
  }

  async createCategory(data: { name: string; code: string; description?: string; prefix?: string }): Promise<DocumentCategory> {
    // Check if category code already exists
    const existingCategory = await prisma.documentCategory.findFirst({
      where: {
        OR: [
          { code: data.code },
          { name: data.name },
        ],
      },
    });

    if (existingCategory) {
      throw new ConflictError('Category with this code or name already exists');
    }

    const category = await prisma.documentCategory.create({
      data,
    });

    return {
      id: category.id,
      name: category.name,
      code: category.code,
      description: category.description || undefined,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async getCategoryById(id: string): Promise<DocumentCategory | null> {
    const category = await prisma.documentCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!category) {
      return null;
    }

    return {
      id: category.id,
      name: category.name,
      code: category.code,
      description: category.description || undefined,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      _count: {
        documents: category._count.documents,
        children: 0,
      },
    };
  }

  async updateCategory(id: string, data: { name?: string; code?: string; description?: string | null; prefix?: string | null; isActive?: boolean }): Promise<DocumentCategory> {
    // Check if category exists
    const existingCategory = await prisma.documentCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundError('Category not found');
    }

    // Check for duplicate name or code if they are being updated
    if (data.name || data.code) {
      const duplicateCheck = await prisma.documentCategory.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                data.code ? { code: data.code } : {},
                data.name ? { name: data.name } : {},
              ].filter(obj => Object.keys(obj).length > 0),
            },
          ],
        },
      });

      if (duplicateCheck) {
        throw new ConflictError('Category with this code or name already exists');
      }
    }

    const category = await prisma.documentCategory.update({
      where: { id },
      data,
    });

    return {
      id: category.id,
      name: category.name,
      code: category.code,
      description: category.description || undefined,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async deleteCategory(id: string): Promise<void> {
    // Check if category exists
    const existingCategory = await prisma.documentCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!existingCategory) {
      throw new NotFoundError('Category not found');
    }

    // Check if category has documents
    if (existingCategory._count.documents > 0) {
      throw new ConflictError('Cannot delete category with existing documents. Please move or delete the documents first.');
    }

    await prisma.documentCategory.delete({
      where: { id },
    });
  }
}