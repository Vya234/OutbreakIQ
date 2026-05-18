import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/services/api';
import { clearStoredAuth, getStoredEmail, getStoredToken, setStoredAuth } from '@/lib/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [email, setEmail] = useState(() => getStoredEmail());
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    setBootstrapping(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    const nextToken = res.data.token;
    const nextEmail = res.data.email;
    setStoredAuth(nextToken, nextEmail);
    setToken(nextToken);
    setEmail(nextEmail);
    return res;
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setEmail(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      email,
      isAuthenticated: Boolean(token),
      bootstrapping,
      login,
      logout,
    }),
    [token, email, bootstrapping, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
