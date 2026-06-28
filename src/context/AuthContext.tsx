/**
 * AuthContext — Global authentication state management
 * Wraps the entire app with Google OAuth + JWT session
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokenStorage, UserProfile } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: (credential: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount: verify existing token and restore session
  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi.getMe()
      .then(setUser)
      .catch(() => { tokenStorage.clear(); setUser(null); })
      .finally(() => setIsLoading(false));
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.googleLogin(credential);
      tokenStorage.set(res.access_token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.login(email, password);
      tokenStorage.set(res.access_token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signupWithEmail = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.signup(name, email, password);
      tokenStorage.set(res.access_token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      loginWithGoogle,
      loginWithEmail,
      signupWithEmail,
      logout,
      error,
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
