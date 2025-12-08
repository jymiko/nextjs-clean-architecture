import {
  Permission,
  CreatePermissionDTO,
  UpdatePermissionDTO,
  PermissionListResponse,
  PermissionQueryParams,
  RoleWithPermissions,
} from '../entities/Permission';

export interface IPermissionRepository {
  // Permission CRUD
  findAll(params: PermissionQueryParams): Promise<PermissionListResponse>;
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findByResourceAction(resource: string, action: string): Promise<Permission | null>;
  findByIds(ids: string[]): Promise<Permission[]>;
  create(data: CreatePermissionDTO): Promise<Permission>;
  update(id: string, data: UpdatePermissionDTO): Promise<Permission | null>;
  delete(id: string): Promise<boolean>;

  // Role-Permission management
  getRolePermissions(roleId: string): Promise<Permission[]>;
  getRoleWithPermissions(roleId: string): Promise<RoleWithPermissions | null>;
  assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<RoleWithPermissions>;
  removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<RoleWithPermissions>;
  syncRolePermissions(roleId: string, permissionIds: string[]): Promise<RoleWithPermissions>;

  // Utility
  getPermissionsByResource(resource: string): Promise<Permission[]>;
  getPermissionsByCategory(category: string): Promise<Permission[]>;
  getAllCategories(): Promise<string[]>;
  getAllResources(): Promise<string[]>;
  count(): Promise<number>;
}
