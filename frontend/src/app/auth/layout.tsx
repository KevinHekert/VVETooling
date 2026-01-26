'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';

/**
 * Auth Layout - Wraps auth pages with providers
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
