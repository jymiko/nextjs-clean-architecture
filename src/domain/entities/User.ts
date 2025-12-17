// User role enum matching Prisma schema
export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  employeeId?: string | null;
  name: string;
  email: string;
  password?: string | null;
  role: UserRole;
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
  avatar?: string | null;
  signature?: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  deletedAt?: Date | null;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Method for creating new user access
export type UserCreationMethod = 'generate_password' | 'invitation_link';

export interface CreateUserDTO {
  employeeId?: string;
  name: string;
  email: string;
  password?: string;
  role?: UserRole;
  departmentId?: string;
  positionId?: string;
  isActive?: boolean;
  creationMethod?: UserCreationMethod; // How to give user access
}

// Response when creating user with generated password or invitation
export interface CreateUserResponseDTO {
  user: Omit<User, 'password'>;
  generatedPassword?: string;  // Only returned when creationMethod is 'generate_password'
  invitationLink?: string;     // Only returned when creationMethod is 'invitation_link'
  invitationExpiresAt?: Date;  // Expiry time for invitation link
}

export interface UpdateUserDTO {
  employeeId?: string | null;
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  departmentId?: string | null;
  positionId?: string | null;
  avatar?: string | null;
  signature?: string | null;
  isActive?: boolean;
  mustChangePassword?: boolean;
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
  role?: UserRole;
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
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  requirePasswordChange?: boolean; // True if user must change password
}
