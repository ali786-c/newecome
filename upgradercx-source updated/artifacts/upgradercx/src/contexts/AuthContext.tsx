import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/api/auth.api';
import type { User, LoginCredentials, RegisterData } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  loginWithToken: (token: string, user: User) => void;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) { setIsLoading(false); return; }
      const res = await authApi.getUser();
      setUser(res.data);
    } catch {
      localStorage.removeItem('access_token');
      if (user) setSessionExpired(true);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const res = await authApi.login(credentials);
    localStorage.setItem('access_token', res.data.access_token);
    setUser(res.data.user);
    setSessionExpired(false);
    return res.data.user;
  };

  const loginWithToken = (token: string, userData: User) => {
    localStorage.setItem('access_token', token);
    setUser(userData);
    setSessionExpired(false);
  };

  const register = async (data: RegisterData) => {
    await authApi.register(data);
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const clearSessionExpired = () => setSessionExpired(false);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      sessionExpired,
      login,
      loginWithToken,
      register,
      logout,
      clearSessionExpired
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
