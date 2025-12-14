/**
 * Utility functions for managing cookies on the client-side
 */

export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') {
    return; // Not in browser
  }
  
  document.cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null; // Not in browser
  }
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}

export function setCookie(name: string, value: string, days: number = 7, path: string = '/'): void {
  if (typeof document === 'undefined') {
    return; // Not in browser
  }
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=${path}`;
}

export function clearAuthCookies(): void {
  deleteCookie('auth-token');
  deleteCookie('refresh-token');
}
