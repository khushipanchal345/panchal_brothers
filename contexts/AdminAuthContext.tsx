import React, { createContext, useContext, useEffect, useState } from 'react';
import { Admin } from '@/types';
import { adminLogin, adminLogout, getAdminSession } from '@/lib/adminAuth';

interface AdminAuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminSession().then((session) => {
      setAdmin(session);
      setLoading(false);
    });
  }, []);

  const login = async (username: string, password: string) => {
    const adminData = await adminLogin(username, password);
    setAdmin(adminData);
  };

  const logout = async () => {
    await adminLogout();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
