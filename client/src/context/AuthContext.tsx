import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, clearStoredAuth, getStoredToken, getStoredUser, setStoredAuth } from '../lib/api';
import { User } from '../types';

type LoginPayload = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [loading, setLoading] = useState(Boolean(getStoredToken()));

  async function refreshUser() {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const nextUser = await apiFetch<User>('/auth/me');
      setUser(nextUser);
      setStoredAuth(token, nextUser);
    } catch {
      clearStoredAuth();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function login(payload: LoginPayload) {
    const response = await apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    setToken(response.token);
    setUser(response.user);
    setStoredAuth(response.token, response.user);
  }

  function logout() {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ user, token, loading, login, logout, refreshUser }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}