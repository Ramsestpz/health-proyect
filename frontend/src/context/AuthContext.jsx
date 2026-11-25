import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from '../api/client';

// Guarda la sesión (usuario + token JWT) y la comparte con toda la app.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Si la API responde 401 (token vencido), se cierra la sesión automáticamente
  useEffect(() => setUnauthorizedHandler(logout), [logout]);

  // Al abrir la app con un token guardado, se valida contra /auth/me
  useEffect(() => {
    if (!tokenStore.get()) return;
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, [logout]);

  const saveSession = ({ user: sessionUser, token }) => {
    tokenStore.set(token);
    setUser(sessionUser);
  };

  const login = async (credentials) => saveSession((await api.post('/auth/login', credentials)).data);
  const register = async (payload) => saveSession((await api.post('/auth/register', payload)).data);

  const value = useMemo(() => ({ user, checking, login, register, logout }), [user, checking, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
