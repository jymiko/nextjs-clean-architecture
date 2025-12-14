export interface Division {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  headOfDivisionId?: string | null;
  headOfDivision?: {
    id: string;
    name: string;
    email: string;
  } | null;
  departments?: Array<{
    id: string;
    name: string;
  }>;
  isActive: boolean;
  totalDepartments?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDivisionDTO {
  code: string;
  name: string;
  description?: string;
  headOfDivisionId?: string;
  isActive?: boolean;
}

export interface UpdateDivisionDTO {
  code?: string;
  name?: string;
  description?: string | null;
  headOfDivisionId?: string | null;
  isActive?: boolean;
}

export interface DivisionListResponse {
  data: Division[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DivisionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'code' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
