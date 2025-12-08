import {
  Position,
  CreatePositionDTO,
  UpdatePositionDTO,
  PositionListResponse,
  PositionQueryParams,
} from '../entities/Position';

export interface IPositionRepository {
  findAll(params: PositionQueryParams): Promise<PositionListResponse>;
  findById(id: string): Promise<Position | null>;
  findByCode(code: string): Promise<Position | null>;
  findByDepartmentId(departmentId: string): Promise<Position[]>;
  create(data: CreatePositionDTO): Promise<Position>;
  update(id: string, data: UpdatePositionDTO): Promise<Position | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
