'use client';

import { useState, useEffect } from 'react';
import { LastAccount } from '@/types/last-accounts';

const STORAGE_KEY = 'dcms-last-accounts';
export const REMEMBER_ME_SESSION_KEY = 'dcms-remember-me-session';

interface RememberMeSession {
  email: string;
  name: string;
  avatar?: string;
  rememberMe: boolean;
}

export function useLastAccounts() {
  const [accounts, setAccounts] = useState<LastAccount[]>([]);

  // Load accounts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedAccounts = JSON.parse(stored);
        setAccounts(parsedAccounts);
      } catch (error) {
        console.error('Error loading last accounts:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save a new account to the list
  const saveAccount = (email: string, name: string, avatar?: string) => {
    const newAccount: LastAccount = {
      email,
      name,
      lastLogin: new Date().toISOString(),
      avatar,
    };

    setAccounts(prevAccounts => {
      // Remove existing account with same email if it exists
      const filtered = prevAccounts.filter(acc => acc.email !== email);

      // Add new account at the beginning
      const updated = [newAccount, ...filtered];

      // Keep only the first 2 accounts
      const limited = updated.slice(0, 2);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));

      return limited;
    });
  };

  // Remove an account from the list
  const removeAccount = (email: string) => {
    setAccounts(prevAccounts => {
      const filtered = prevAccounts.filter(acc => acc.email !== email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return filtered;
    });
  };

  // Clear all accounts
  const clearAccounts = () => {
    setAccounts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Save account from session storage (called on logout if Remember Me was checked)
  const saveAccountFromSession = () => {
    const sessionData = sessionStorage.getItem(REMEMBER_ME_SESSION_KEY);
    if (sessionData) {
      try {
        const data: RememberMeSession = JSON.parse(sessionData);
        if (data.rememberMe) {
          saveAccount(data.email, data.name, data.avatar);
        }
      } catch (error) {
        console.error('Error parsing remember me session:', error);
      } finally {
        // Always clear the session data after logout
        sessionStorage.removeItem(REMEMBER_ME_SESSION_KEY);
      }
    }
  };

  // Clear session data without saving (for cases where we need to clear session)
  const clearSession = () => {
    sessionStorage.removeItem(REMEMBER_ME_SESSION_KEY);
  };

  return {
    accounts,
    saveAccount,
    removeAccount,
    clearAccounts,
    saveAccountFromSession,
    clearSession,
  };
}