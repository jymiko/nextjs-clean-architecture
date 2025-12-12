import { createContainer, asClass, asFunction, InjectionMode } from "awilix";
import {
  InMemoryUserRepository,
  PrismaUserRepository,
  PrismaPasswordResetRepository,
  PrismaDepartmentRepository,
  PrismaDivisionRepository,
  PrismaPositionRepository,
  PrismaPermissionRepository,
  PrismaDocumentRepository,
} from "../repositories";
import {
  GetUsersUseCase,
  CreateUserUseCase,
  GetUserByIdUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  VerifyResetTokenUseCase,
} from "@/domain/usecases";
import { UserService } from "@/application/services/UserService";
import {
  IUserRepository,
  IPasswordResetRepository,
  IDepartmentRepository,
  IDivisionRepository,
  IPositionRepository,
  IPermissionRepository,
  IDocumentRepository,
} from "@/domain/repositories";
import { EmailService, IEmailService } from "../services/EmailService";

export interface Cradle {
  userRepository: IUserRepository;
  passwordResetRepository: IPasswordResetRepository;
  departmentRepository: IDepartmentRepository;
  divisionRepository: IDivisionRepository;
  positionRepository: IPositionRepository;
  permissionRepository: IPermissionRepository;
  documentRepository: IDocumentRepository;
  emailService: IEmailService;
  getUsersUseCase: GetUsersUseCase;
  createUserUseCase: CreateUserUseCase;
  getUserByIdUseCase: GetUserByIdUseCase;
  forgotPasswordUseCase: ForgotPasswordUseCase;
  resetPasswordUseCase: ResetPasswordUseCase;
  verifyResetTokenUseCase: VerifyResetTokenUseCase;
  userService: UserService;
}

const container = createContainer<Cradle>({
  injectionMode: InjectionMode.PROXY,
});

// Use PrismaUserRepository in production, InMemoryUserRepository for testing
const usePrisma = process.env.NODE_ENV !== 'test';

container.register({
  userRepository: usePrisma
    ? asClass(PrismaUserRepository).singleton()
    : asClass(InMemoryUserRepository).singleton(),

  passwordResetRepository: asClass(PrismaPasswordResetRepository).singleton(),

  departmentRepository: asClass(PrismaDepartmentRepository).singleton(),

  divisionRepository: asClass(PrismaDivisionRepository).singleton(),

  positionRepository: asClass(PrismaPositionRepository).singleton(),

  permissionRepository: asClass(PrismaPermissionRepository).singleton(),

  documentRepository: asClass(PrismaDocumentRepository).singleton(),

  emailService: asClass(EmailService).singleton(),

  getUsersUseCase: asFunction(
    ({ userRepository }: Cradle) => new GetUsersUseCase(userRepository)
  ).scoped(),

  createUserUseCase: asFunction(
    ({ userRepository }: Cradle) => new CreateUserUseCase(userRepository)
  ).scoped(),

  getUserByIdUseCase: asFunction(
    ({ userRepository }: Cradle) => new GetUserByIdUseCase(userRepository)
  ).scoped(),

  forgotPasswordUseCase: asFunction(
    ({ passwordResetRepository }: Cradle) => new ForgotPasswordUseCase(passwordResetRepository)
  ).scoped(),

  resetPasswordUseCase: asFunction(
    ({ passwordResetRepository }: Cradle) => new ResetPasswordUseCase(passwordResetRepository)
  ).scoped(),

  verifyResetTokenUseCase: asFunction(
    ({ passwordResetRepository }: Cradle) => new VerifyResetTokenUseCase(passwordResetRepository)
  ).scoped(),

  userService: asFunction(
    ({ getUsersUseCase, getUserByIdUseCase, createUserUseCase }: Cradle) =>
      new UserService(getUsersUseCase, getUserByIdUseCase, createUserUseCase)
  ).scoped(),
});

export { container };
