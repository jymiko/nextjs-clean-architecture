import {
  Division,
  CreateDivisionDTO,
  UpdateDivisionDTO,
  DivisionListResponse,
  DivisionQueryParams,
} from '../entities/Division';

export interface IDivisionRepository {
  findAll(params: DivisionQueryParams): Promise<DivisionListResponse>;
  findById(id: string): Promise<Division | null>;
  findByCode(code: string): Promise<Division | null>;
  findByName(name: string): Promise<Division | null>;
  create(data: CreateDivisionDTO): Promise<Division>;
  update(id: string, data: UpdateDivisionDTO): Promise<Division | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
