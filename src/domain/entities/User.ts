export interface User {
  id: string;
  employeeId?: string | null;
  name: string;
  email: string;
  password?: string | null;
  roleId?: string | null;
  role?: {
    id: string;
    code: string;
    name: string;
  } | null;
  departmentId?: string | null;
  department?: {
    id: string;
    code: string;
    name: string;
  } | null;
  positionId?: string | null;
  position?: {
    id: string;
    code: string;
    name: string;
  } | null;
  phone?: string | null;
  avatar?: string | null;
  isActive: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  employeeId?: string;
  name: string;
  email: string;
  password?: string;
  roleId?: string;
  departmentId?: string;
  positionId?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserDTO {
  employeeId?: string | null;
  name?: string;
  email?: string;
  password?: string;
  roleId?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  phone?: string | null;
  avatar?: string | null;
  isActive?: boolean;
}

export interface UserListResponse {
  data: Omit<User, 'password'>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  departmentId?: string;
  positionId?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'email' | 'employeeId' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}
