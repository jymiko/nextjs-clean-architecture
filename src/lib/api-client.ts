import tokenManager from './auth/token-manager';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  retryOnAuth?: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, retryOnAuth = true, ...fetchOptions } = options;
    const url = `${this.baseURL}${endpoint}`;

    // Get auth headers if not skipped
    let headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (!skipAuth) {
      const authHeaders = await tokenManager.getAuthHeaders();
      headers = { ...headers, ...authHeaders };
    }

    // Make the initial request
    let response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Important: include cookies for authentication
    });

    // If we get a 401 and haven't retried yet, try to refresh the token
    if (response.status === 401 && !skipAuth && retryOnAuth) {
      // Try to refresh the token
      const newTokens = await tokenManager.refreshAccessToken();

      if (newTokens) {
        // Retry the request with the new token
        const newHeaders = new Headers();

        // Copy existing headers
        if (headers instanceof Headers) {
          headers.forEach((value, key) => {
            newHeaders.append(key, value);
          });
        } else {
          // If headers is a plain object
          Object.entries(headers).forEach(([key, value]) => {
            newHeaders.append(key, value as string);
          });
        }

        newHeaders.set('Authorization', `Bearer ${newTokens.accessToken}`);
        headers = newHeaders as any;

        response = await fetch(url, {
          ...fetchOptions,
          headers,
          credentials: 'include', // Important: include cookies for authentication
        });
      }
    }

    if (!response.ok) {
      // Handle 401 unauthorized
      if (response.status === 401) {
        tokenManager.clearTokens();
        // Redirect to login if in browser and not already on login page
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }

      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));

      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T = any>(
    endpoint: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(
    endpoint: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Upload file with progress support
  async upload<T = any>(
    endpoint: string,
    file: File,
    options: Omit<RequestOptions, 'method' | 'body' | 'headers'> = {},
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const { skipAuth = false } = options;
    const url = `${this.baseURL}${endpoint}`;

    // Get auth headers if not skipped
    let headers: Record<string, string> = {};
    if (!skipAuth) {
      const authHeaders = await tokenManager.getAuthHeaders();
      headers = authHeaders;
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      // Load complete
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            resolve(xhr.responseText as any);
          }
        } else {
          if (xhr.status === 401) {
            tokenManager.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
          reject(new Error(`HTTP error! status: ${xhr.status}`));
        }
      });

      // Error handling
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      // Open and send request
      xhr.open('POST', url);

      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    });
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient();
export default apiClient;