export interface Position {
  id: string;
  code: string;
  name: string;
  departmentId?: string | null;
  department?: {
    id: string;
    code: string;
    name: string;
  } | null;
  isActive: boolean;
  totalEmployees?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePositionDTO {
  code: string;
  name: string;
  departmentId?: string;
  isActive?: boolean;
}

export interface UpdatePositionDTO {
  code?: string;
  name?: string;
  departmentId?: string | null;
  isActive?: boolean;
}

export interface PositionListResponse {
  data: Position[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PositionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'code' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
