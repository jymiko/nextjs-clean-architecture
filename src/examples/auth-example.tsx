'use client';

import React, { useState, useEffect } from 'react';
import tokenManager from '@/lib/auth/token-manager';
import apiClient from '@/lib/api-client';

export default function AuthExample() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if we have valid tokens
      const tokens = tokenManager.getTokens();
      if (!tokens) {
        setLoading(false);
        return;
      }

      // Get user profile with automatic token refresh
      const response = await apiClient.get('/api/auth/me');
      setUser(response.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      tokenManager.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      const loginResponse = await apiClient.post('/api/auth/login', {
        email: formData.get('email'),
        password: formData.get('password'),
      }, { skipAuth: true });

      // Initialize tokens in the token manager
      tokenManager.initializeTokens(loginResponse);
      setUser(loginResponse.user);
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleLogout = async (logoutAll: boolean = false) => {
    try {
      await tokenManager.logout(logoutAll);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear tokens locally even if server logout fails
      tokenManager.clearTokens();
      setUser(null);
    }
  };

  const handleProtectedRequest = async () => {
    try {
      // The API client automatically handles auth headers and token refresh
      const response = await apiClient.get('/api/documents');
      alert(`Success! Found ${response.data.length} documents`);
    } catch (error) {
      alert('Request failed: ' + error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Example</h1>

      {!user ? (
        <form onSubmit={handleLogin} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 border rounded-md"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-3 py-2 border rounded-md"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-md">
            <h2 className="text-lg font-semibold">Welcome, {user.name}!</h2>
            <p className="text-sm text-gray-600">Email: {user.email}</p>
            <p className="text-sm text-gray-600">Role: {user.role}</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleProtectedRequest}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Test Protected API Request
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => handleLogout(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Logout Current Device
              </button>
              <button
                onClick={() => handleLogout(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Logout All Devices
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-semibold mb-2">Token Information:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(tokenManager.getTokens(), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}