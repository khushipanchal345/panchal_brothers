import AsyncStorage from './storage';
import { supabase } from './supabase';
import { Admin } from '@/types';

const ADMIN_SESSION_KEY = '@admin_session';

export interface AdminSession {
  admin: Admin;
  loggedInAt: string;
}

export async function adminLogin(username: string, password: string): Promise<Admin> {
  const { data, error } = await supabase
    .rpc('verify_admin_password', { p_username: username, p_password: password });

  if (error) throw new Error('Login failed');
  if (!data || data.length === 0) throw new Error('Invalid username or password');

  const admin: Admin = data[0];
  const session: AdminSession = { admin, loggedInAt: new Date().toISOString() };
  await AsyncStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  return admin;
}

export async function adminLogout(): Promise<void> {
  await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
}

export async function getAdminSession(): Promise<Admin | null> {
  try {
    const raw = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    return session.admin;
  } catch {
    return null;
  }
}
