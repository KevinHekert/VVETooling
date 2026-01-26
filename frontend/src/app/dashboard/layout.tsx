'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * Dashboard Layout - Wraps all dashboard pages with auth and toast providers
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gray-100">
          {/* Navigation Header */}
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-blue-600">VVE Tooling</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="text-gray-500 hover:text-gray-700">
                    Uitloggen
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
