import {
  UserPreference,
  UpdateUserPreferenceDTO,
  FcmToken,
  RegisterFcmTokenDTO,
} from "../entities/UserPreference";

export interface IUserPreferenceRepository {
  findByUserId(userId: string): Promise<UserPreference | null>;
  create(userId: string): Promise<UserPreference>;
  update(userId: string, data: UpdateUserPreferenceDTO): Promise<UserPreference | null>;
  getOrCreate(userId: string): Promise<UserPreference>;

  // FCM Token management
  addFcmToken(userId: string, data: RegisterFcmTokenDTO): Promise<FcmToken>;
  removeFcmToken(token: string): Promise<boolean>;
  getFcmTokensByUserId(userId: string): Promise<FcmToken[]>;
  updateFcmTokenLastUsed(token: string): Promise<void>;
  deactivateFcmToken(token: string): Promise<boolean>;
}
