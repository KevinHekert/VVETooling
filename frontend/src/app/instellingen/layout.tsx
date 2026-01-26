'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * Settings Layout - Wraps all settings pages with auth, navigation and toast providers
 */
export default function InstellingenLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gray-100">
          {/* Navigation Header */}
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center gap-8">
                  <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                    VVE Tooling
                  </Link>
                  <div className="hidden md:flex items-center gap-4">
                    <Link
                      href="/dashboard"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Dashboard
                    </Link>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-900 font-medium">Instellingen</span>
                  </div>
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
          <main>{children}</main>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
