import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { ApiError, fetchCurrentAdmin, loginAdmin } from "./api";
import type { AdminUser } from "./types";

const TOKEN_STORAGE_KEY = "flamingo_bean_admin_token";

interface AuthContextValue {
  adminUser: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentAdmin = await fetchCurrentAdmin(token);
        setAdminUser(currentAdmin);
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    void restoreSession();
  }, [token]);

  async function login(email: string, password: string) {
    const result = await loginAdmin(email.trim().toLowerCase(), password);
    localStorage.setItem(TOKEN_STORAGE_KEY, result.access_token);
    setToken(result.access_token);
    setAdminUser(result.admin);
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setAdminUser(null);
    window.location.hash = "#/";
  }

  const value = useMemo(
    () => ({
      adminUser,
      token,
      isAuthenticated: Boolean(adminUser && token),
      isLoading,
      login,
      logout,
    }),
    [adminUser, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
