import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setOnUnauthorized } from '../lib/api';
import { getToken, setToken, clearToken, setStoredUser, getStoredUser } from '../lib/auth';
import { queryClient } from '../lib/query';
import type { UserProfile } from '../../shared/types';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }
      const data = await api.get<{ user: UserProfile }>('/api/users/me');
      await setStoredUser(data.user);
      setState({ user: data.user, isLoading: false, isAuthenticated: true });
    } catch {
      await clearToken();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: UserProfile }>(
      '/api/auth/mobile-login',
      { email, password }
    );
    await setToken(data.token);
    await setStoredUser(data.user);
    setState({ user: data.user, isLoading: false, isAuthenticated: true });
  };

  const signup = async (name: string, email: string, username: string, password: string) => {
    await api.post('/api/auth/signup', { name, email, username, password });
    await login(email, password);
  };

  const logout = async () => {
    await clearToken();
    queryClient.clear();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  // Handle 401 responses from API (expired token)
  useEffect(() => {
    setOnUnauthorized(() => {
      queryClient.clear();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
