export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  level: number;
  permissions?: string[] | null;
  isActive: boolean;
  isSystem: boolean;
  totalUsers?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleDTO {
  code: string;
  name: string;
  description?: string;
  level?: number;
  permissions?: string[];
  isActive?: boolean;
}

export interface UpdateRoleDTO {
  code?: string;
  name?: string;
  description?: string | null;
  level?: number;
  permissions?: string[] | null;
  isActive?: boolean;
}

export interface RoleListResponse {
  data: Role[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RoleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'code' | 'level' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
