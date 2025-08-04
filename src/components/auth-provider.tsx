'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/types';

const adminUser: User = { id: '1', name: 'Admin Sekolah', email: 'admin@sekolah.id', role: 'admin' };
const regularUser: User = { id: '2', name: 'Guru Biasa', email: 'user@sekolah.id', role: 'user' };

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sekolah_inventory_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email: string) => {
    setLoading(true);
    let userToLogin: User | null = null;
    if (email.toLowerCase() === adminUser.email) {
      userToLogin = adminUser;
    } else if (email.toLowerCase() === regularUser.email) {
      userToLogin = regularUser;
    }

    if (userToLogin) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToLogin));
      setUser(userToLogin);
      router.push('/dashboard');
    } else {
      // Handle invalid login in the form component
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  };

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!user && !isAuthPage) {
      router.push('/login');
    }

    if (user && isAuthPage) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);


  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
