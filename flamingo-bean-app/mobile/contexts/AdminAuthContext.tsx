import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { fetchCurrentAdmin, loginAdmin } from "../services/adminAuth";
import {
  clearStoredAdminToken,
  getStoredAdminToken,
  storeAdminToken,
} from "../services/adminAuthStorage";
import type { AdminUser } from "../types/auth";

interface AdminAuthContextValue {
  adminUser: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshCurrentAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function logout() {
    setAdminUser(null);
    setAccessToken(null);
    await clearStoredAdminToken();
  }

  async function refreshCurrentAdmin() {
    const token = accessToken ?? (await getStoredAdminToken());

    if (!token) {
      setAdminUser(null);
      setAccessToken(null);
      return;
    }

    try {
      const currentAdmin = await fetchCurrentAdmin(token);
      setAdminUser(currentAdmin);
      setAccessToken(token);
    } catch {
      await logout();
    }
  }

  async function login(email: string, password: string) {
    const loginResponse = await loginAdmin(email.trim().toLowerCase(), password);
    setAdminUser(loginResponse.admin);
    setAccessToken(loginResponse.access_token);
    await storeAdminToken(loginResponse.access_token);
  }

  useEffect(() => {
    async function restoreSession() {
      try {
        await refreshCurrentAdmin();
      } finally {
        setIsLoading(false);
      }
    }

    void restoreSession();
  }, []);

  const value = useMemo(
    () => ({
      adminUser,
      accessToken,
      isAuthenticated: Boolean(adminUser && accessToken),
      isLoading,
      login,
      logout,
      refreshCurrentAdmin,
    }),
    [adminUser, accessToken, isLoading],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  }

  return context;
}
