'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/ui/Toast';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import type { UserRole } from '@/types';

/**
 * Dashboard Layout - STORY-009 Enhanced
 * Wraps all dashboard pages with:
 * - Auth and toast providers
 * - Role-specific navigation
 * - Role switcher for multi-VVE users
 * - Modular menu structure
 */

// Navigation items per role - STORY-009
interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  // Bewoner items
  { label: 'Mijn Status', href: '/dashboard/bewoner', icon: '🏠', roles: ['bewoner', 'bestuurslid', 'penningmeester', 'beheerder'] },
  { label: 'Mijn Reserves', href: '/dashboard/bewoner/reserves', icon: '🏦', roles: ['bewoner', 'bestuurslid'] },
  
  // Penningmeester/Beheerder items
  { label: 'Transacties', href: '/dashboard/penningmeester/transactions', icon: '💰', roles: ['penningmeester', 'beheerder'] },
  { label: 'Begrotingen', href: '/dashboard/penningmeester/budgets', icon: '📊', roles: ['penningmeester', 'beheerder'] },
  { label: 'Reserves', href: '/dashboard/penningmeester/reserves', icon: '🏦', roles: ['penningmeester', 'beheerder'] },
  { label: 'Contributies', href: '/dashboard/penningmeester/contributions', icon: '💵', roles: ['penningmeester', 'beheerder'] },
  { label: 'Jaarrekening', href: '/dashboard/penningmeester/jaarrekening', icon: '📈', roles: ['bestuurslid', 'penningmeester', 'beheerder'] },
  
  // All roles - Documenten
  { label: 'Documenten', href: '/dashboard/documenten', icon: '📁', roles: ['bewoner', 'bestuurslid', 'penningmeester', 'beheerder'] },
  
  // Beheerder only
  { label: 'Contracten', href: '/dashboard/beheerder/contracten', icon: '📝', roles: ['beheerder', 'bestuurslid'] },
  { label: 'ALV', href: '/dashboard/beheerder/alv', icon: '📅', roles: ['beheerder', 'bestuurslid'] },
  { label: 'Audit Log', href: '/dashboard/beheerder/audit', icon: '📋', roles: ['beheerder'] },
  { label: 'Sjablonen', href: '/dashboard/beheerder/correspondentie/sjablonen', icon: '📝', roles: ['beheerder', 'bestuurslid'] },
  { label: 'Brieven', href: '/dashboard/beheerder/correspondentie/brieven', icon: '✉️', roles: ['beheerder', 'bestuurslid'] },
  { label: 'Verzending', href: '/dashboard/beheerder/correspondentie/verzending', icon: '📤', roles: ['beheerder', 'bestuurslid'] },
  { label: 'Splitsingssleutel', href: '/instellingen/splitsingssleutel', icon: '🔑', roles: ['beheerder'] },
  { label: 'Rollen & Rechten', href: '/instellingen/rollen', icon: '👥', roles: ['beheerder'] },
  { label: 'Instellingen', href: '/instellingen/onboarding', icon: '⚙️', roles: ['beheerder'] },
];

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { currentRole, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Default to 'bewoner' if no role set (for demo)
  const activeRole = currentRole || 'bewoner';
  
  // Filter nav items based on current role
  const visibleNavItems = NAV_ITEMS.filter(item => 
    item.roles.includes(activeRole)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Desktop Nav */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                VVE Tooling
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${pathname === item.href || pathname.startsWith(item.href + '/')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side: Role Switcher + Logout */}
            <div className="flex items-center gap-4">
              {/* Role Switcher - Desktop */}
              <div className="hidden md:block">
                <RoleSwitcher />
              </div>
              
              <button 
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Uitloggen
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            {/* Mobile Role Switcher */}
            <div className="p-4 border-b border-gray-100">
              <RoleSwitcher />
            </div>
            
            {/* Mobile Nav Items */}
            <div className="py-2">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3
                    ${pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Breadcrumb / Section Label - STORY-009 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center text-sm text-gray-500">
            <span>Dashboard</span>
            {pathname !== '/dashboard' && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">
                  {visibleNavItems.find(item => 
                    pathname === item.href || pathname.startsWith(item.href + '/')
                  )?.label || 'Pagina'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </ToastProvider>
    </AuthProvider>
  );
}
