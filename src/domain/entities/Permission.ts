export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string | null;
  category: string;
  isActive: boolean;
  createdAt: Date;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission?: Permission;
  createdAt: Date;
}

export interface CreatePermissionDTO {
  name: string;
  resource: string;
  action: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

export interface UpdatePermissionDTO {
  name?: string;
  resource?: string;
  action?: string;
  description?: string | null;
  category?: string;
  isActive?: boolean;
}

export interface PermissionListResponse {
  data: Permission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PermissionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  resource?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'resource' | 'action' | 'category' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AssignPermissionsDTO {
  permissionIds: string[];
}

export interface RoleWithPermissions {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  level: number;
  isActive: boolean;
  isSystem: boolean;
  permissions: Permission[];
  totalUsers?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Default permission categories
export const PERMISSION_CATEGORIES = {
  DOCUMENTS: 'documents',
  USERS: 'users',
  ROLES: 'roles',
  DEPARTMENTS: 'departments',
  POSITIONS: 'positions',
  APPROVALS: 'approvals',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  SYSTEM: 'system',
} as const;

// Default permission actions
export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
  IMPORT: 'import',
  MANAGE: 'manage',
} as const;

// Helper to generate permission name
export function generatePermissionName(resource: string, action: string): string {
  return `${resource}.${action}`;
}
