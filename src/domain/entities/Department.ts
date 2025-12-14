export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  divisionId?: string | null;
  division?: {
    id: string;
    code: string;
    name: string;
  } | null;
  headOfDepartmentId?: string | null;
  headOfDepartment?: {
    id: string;
    name: string;
    email: string;
  } | null;
  isActive: boolean;
  totalEmployees?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDepartmentDTO {
  code: string;
  name: string;
  description?: string;
  divisionId?: string;
  headOfDepartmentId?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentDTO {
  code?: string;
  name?: string;
  description?: string | null;
  divisionId?: string | null;
  headOfDepartmentId?: string | null;
  isActive?: boolean;
}

export interface DepartmentListResponse {
  data: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'code' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
