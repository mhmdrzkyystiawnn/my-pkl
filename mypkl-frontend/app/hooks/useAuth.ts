'use client';

import { useState, useCallback } from 'react';
import { apiClient, ApiError } from '../lib/apiClient';

export interface User {
  id: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.register(email, password);
      setUser(data);
      return data;
    } catch (err) {
      const apiErr = err as ApiError;
      const message = typeof apiErr.detail === 'string' 
        ? apiErr.detail 
        : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.login(email, password);
      const userData = await apiClient.getMe();
      setUser(userData);
      return userData;
    } catch (err) {
      const apiErr = err as ApiError;
      const message = typeof apiErr.detail === 'string'
        ? apiErr.detail
        : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.clearToken();
    setUser(null);
    setError(null);
  }, []);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await apiClient.getMe();
      setUser(userData);
      return userData;
    } catch (err) {
      setUser(null);
      apiClient.clearToken();
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading, error, register, login, logout, loadUser };
}
