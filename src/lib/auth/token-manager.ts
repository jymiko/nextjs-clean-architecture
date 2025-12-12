interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<TokenResponse | null> | null = null;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Get tokens from localStorage
  getTokens(): TokenResponse | null {
    if (typeof window === 'undefined') return null;

    try {
      const tokens = localStorage.getItem('auth_tokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error('Error parsing tokens from localStorage:', error);
      this.clearTokens();
      return null;
    }
  }

  // Save tokens to localStorage
  setTokens(tokens: TokenResponse): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Error saving tokens to localStorage:', error);
    }
  }

  // Clear tokens from localStorage
  clearTokens(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('auth_tokens');
  }

  // Get the access token
  getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.accessToken || null;
  }

  // Get the refresh token
  getRefreshToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.refreshToken || null;
  }

  // Check if the access token is expired
  isTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return true;

    // Check if we have a timestamp for when the token was set
    const tokenSetAt = localStorage.getItem('auth_token_set_at');
    if (!tokenSetAt) return true;

    const setAt = new Date(tokenSetAt).getTime();
    const now = new Date().getTime();
    const elapsedSeconds = (now - setAt) / 1000;

    // Add a 30-second buffer to ensure we refresh before it actually expires
    return elapsedSeconds >= (tokens.expiresIn - 30);
  }

  // Refresh the access token using the refresh token
  async refreshAccessToken(): Promise<TokenResponse | null> {
    // Prevent multiple refresh attempts at once
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      return null;
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const result = await this.refreshPromise;
      if (result) {
        this.setTokens(result);
        // Update the token set timestamp
        localStorage.setItem('auth_token_set_at', new Date().toISOString());
      }
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<TokenResponse | null> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': this.getDeviceId(),
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Refresh token is invalid, clear tokens
          this.clearTokens();
        }
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      this.clearTokens();
      return null;
    }
  }

  // Get or create a device ID for this browser
  getDeviceId(): string {
    if (typeof window === 'undefined') return 'server';

    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'web_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  // Get auth headers for API requests
  async getAuthHeaders(): Promise<{ Authorization: string } | Record<string, never>> {
    const accessToken = this.getAccessToken();

    if (!accessToken) {
      return {};
    }

    // Check if token is expired
    if (this.isTokenExpired()) {
      // Try to refresh the token
      const newTokens = await this.refreshAccessToken();
      if (!newTokens) {
        // Refresh failed, clear tokens and return no auth headers
        this.clearTokens();
        return {};
      }
      return { Authorization: `Bearer ${newTokens.accessToken}` };
    }

    return { Authorization: `Bearer ${accessToken}` };
  }

  // Logout function
  async logout(logoutAll: boolean = false): Promise<void> {
    const accessToken = this.getAccessToken();

    try {
      // Send logout request with token in header or rely on cookie
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers,
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({ logoutAll }),
      });
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue to clear tokens even if server request fails
    }

    this.clearTokens();
    // Note: Last accounts data is NOT cleared on logout to preserve user convenience
  }

  // Initialize tokens after login
  initializeTokens(tokens: TokenResponse): void {
    this.setTokens(tokens);
    localStorage.setItem('auth_token_set_at', new Date().toISOString());
  }
}

export const tokenManager = TokenManager.getInstance();

// Export singleton instance
export default tokenManager;