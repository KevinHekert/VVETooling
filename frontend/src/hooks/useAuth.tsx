'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import type { User, VVEMembership, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  memberships: VVEMembership[];
  isLoading: boolean;
  isAuthenticated: boolean;
  currentVveId: string | null;
  currentRole: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentVve: (vveId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<VVEMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVveId, setCurrentVveId] = useState<string | null>(null);

  // Get current role based on selected VVE
  const currentRole = currentVveId
    ? (memberships.find((m) => m.vve_id === currentVveId)?.role as UserRole) ?? null
    : null;

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const userData = await api.getMe();
      setUser(userData);
      
      // TODO: Fetch memberships from API
      // For now, using mock data
      setMemberships([]);
    } catch {
      // Token invalid or expired
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setMemberships([]);
    setCurrentVveId(null);
  };

  const setCurrentVve = (vveId: string) => {
    setCurrentVveId(vveId);
    localStorage.setItem('current_vve_id', vveId);
  };

  // Restore current VVE from localStorage
  useEffect(() => {
    const storedVveId = localStorage.getItem('current_vve_id');
    if (storedVveId && memberships.some((m) => m.vve_id === storedVveId)) {
      setCurrentVveId(storedVveId);
    } else if (memberships.length > 0) {
      setCurrentVveId(memberships[0].vve_id);
    }
  }, [memberships]);

  return (
    <AuthContext.Provider
      value={{
        user,
        memberships,
        isLoading,
        isAuthenticated: !!user,
        currentVveId,
        currentRole,
        login,
        logout,
        setCurrentVve,
      }}
    >
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
