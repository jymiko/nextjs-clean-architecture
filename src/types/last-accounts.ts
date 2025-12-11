export interface LastAccount {
  email: string;
  name: string;
  lastLogin: string;
  avatar?: string;
}

export interface LastAccountsState {
  accounts: LastAccount[];
}