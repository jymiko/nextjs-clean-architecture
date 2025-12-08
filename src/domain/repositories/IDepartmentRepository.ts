import {
  Department,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  DepartmentListResponse,
  DepartmentQueryParams,
} from '../entities/Department';

export interface IDepartmentRepository {
  findAll(params: DepartmentQueryParams): Promise<DepartmentListResponse>;
  findById(id: string): Promise<Department | null>;
  findByCode(code: string): Promise<Department | null>;
  findByName(name: string): Promise<Department | null>;
  create(data: CreateDepartmentDTO): Promise<Department>;
  update(id: string, data: UpdateDepartmentDTO): Promise<Department | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
