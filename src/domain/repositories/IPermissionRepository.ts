import {
  Permission,
  CreatePermissionDTO,
  UpdatePermissionDTO,
  PermissionListResponse,
  PermissionQueryParams,
  UserWithPermissions,
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

  // User-Permission management
  getUserPermissions(userId: string): Promise<Permission[]>;
  getUserWithPermissions(userId: string): Promise<UserWithPermissions | null>;
  assignPermissionsToUser(userId: string, permissionIds: string[]): Promise<UserWithPermissions>;
  removePermissionsFromUser(userId: string, permissionIds: string[]): Promise<UserWithPermissions>;
  syncUserPermissions(userId: string, permissionIds: string[]): Promise<UserWithPermissions>;

  // Utility
  getPermissionsByResource(resource: string): Promise<Permission[]>;
  getPermissionsByCategory(category: string): Promise<Permission[]>;
  getAllCategories(): Promise<string[]>;
  getAllResources(): Promise<string[]>;
  count(): Promise<number>;
}
