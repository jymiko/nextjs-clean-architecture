import { createContainer, asClass, asFunction, InjectionMode } from "awilix";
import {
  InMemoryUserRepository,
  PrismaUserRepository,
  PrismaUserPreferenceRepository,
  PrismaPasswordResetRepository,
  PrismaDepartmentRepository,
  PrismaDivisionRepository,
  PrismaPositionRepository,
  PrismaPermissionRepository,
  PrismaDocumentRepository,
  PrismaSystemSettingRepository,
} from "../repositories";
import { PrismaInvitationRepository } from "../repositories/PrismaInvitationRepository";
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
  IUserPreferenceRepository,
  IPasswordResetRepository,
  IDepartmentRepository,
  IDivisionRepository,
  IPositionRepository,
  IPermissionRepository,
  IDocumentRepository,
  ISystemSettingRepository,
} from "@/domain/repositories";
import { IInvitationRepository } from "@/domain/repositories/IInvitationRepository";
import { EmailService, IEmailService } from "../services/EmailService";
import { FirebaseFcmService, IFirebaseFcmService } from "../services/FirebaseFcmService";
import { PusherService, IPusherService } from "../services/PusherService";
import { NotificationService, INotificationService } from "../services/NotificationService";

export interface Cradle {
  userRepository: IUserRepository;
  userPreferenceRepository: IUserPreferenceRepository;
  passwordResetRepository: IPasswordResetRepository;
  invitationRepository: IInvitationRepository;
  departmentRepository: IDepartmentRepository;
  divisionRepository: IDivisionRepository;
  positionRepository: IPositionRepository;
  permissionRepository: IPermissionRepository;
  documentRepository: IDocumentRepository;
  systemSettingRepository: ISystemSettingRepository;
  emailService: IEmailService;
  fcmService: IFirebaseFcmService;
  pusherService: IPusherService;
  notificationService: INotificationService;
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

  userPreferenceRepository: asClass(PrismaUserPreferenceRepository).singleton(),

  passwordResetRepository: asClass(PrismaPasswordResetRepository).singleton(),

  invitationRepository: asClass(PrismaInvitationRepository).singleton(),

  departmentRepository: asClass(PrismaDepartmentRepository).singleton(),

  divisionRepository: asClass(PrismaDivisionRepository).singleton(),

  positionRepository: asClass(PrismaPositionRepository).singleton(),

  permissionRepository: asClass(PrismaPermissionRepository).singleton(),

  documentRepository: asClass(PrismaDocumentRepository).singleton(),

  systemSettingRepository: asClass(PrismaSystemSettingRepository).singleton(),

  emailService: asClass(EmailService).singleton(),

  fcmService: asClass(FirebaseFcmService).singleton(),

  pusherService: asClass(PusherService).singleton(),

  notificationService: asFunction(
    ({ userPreferenceRepository, fcmService, pusherService }: Cradle) =>
      new NotificationService(userPreferenceRepository, fcmService, pusherService)
  ).scoped(),

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
