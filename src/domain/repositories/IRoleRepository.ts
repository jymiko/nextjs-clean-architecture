import {
  Role,
  CreateRoleDTO,
  UpdateRoleDTO,
  RoleListResponse,
  RoleQueryParams,
} from '../entities/Role';

export interface IRoleRepository {
  findAll(params: RoleQueryParams): Promise<RoleListResponse>;
  findById(id: string): Promise<Role | null>;
  findByCode(code: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  create(data: CreateRoleDTO): Promise<Role>;
  update(id: string, data: UpdateRoleDTO): Promise<Role | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
