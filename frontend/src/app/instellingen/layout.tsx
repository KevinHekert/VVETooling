'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/ui/Toast';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';

/**
 * Settings Layout - Wraps all settings pages with auth, navigation and toast providers
 * Uses consistent sidebar navigation with improved color contrast
 */

interface SettingsNavItem {
  label: string;
  href: string;
  icon: string;
}

const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { label: 'Overzicht', href: '/instellingen', icon: '⚙️' },
  { label: 'Onboarding', href: '/instellingen/onboarding', icon: '🚀' },
  { label: 'Splitsingsakte', href: '/instellingen/splitsingsakte', icon: '📜' },
  { label: 'Splitsingssleutel', href: '/instellingen/splitsingssleutel', icon: '🔑' },
  { label: 'Rollen & Rechten', href: '/instellingen/rollen', icon: '👥' },
  { label: 'E-mail', href: '/instellingen/email', icon: '📧' },
  { label: 'Notificaties', href: '/instellingen/notificaties', icon: '🔔' },
  { label: 'Leveranciers', href: '/instellingen/leveranciers', icon: '🏢' },
  { label: 'Abonnementen', href: '/instellingen/abonnementen', icon: '💳' },
  { label: 'Export & Backup', href: '/instellingen/export-backup', icon: '💾' },
];

function InstellingenLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentItem = SETTINGS_NAV_ITEMS.find(item => 
    pathname === item.href || 
    (item.href !== '/instellingen' && pathname.startsWith(item.href))
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-md border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                VVE Tooling
              </Link>
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-slate-600 hover:text-slate-800 font-medium"
                >
                  Dashboard
                </Link>
                <span className="text-slate-400">|</span>
                <span className="text-slate-900 font-medium">Instellingen</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <RoleSwitcher />
              </div>
              <button 
                onClick={logout}
                className="text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Uitloggen
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-800"
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
      </nav>

      <div className="flex">
        {/* Left Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)]">
          <nav className="p-4">
            <h2 className="px-3 py-2 text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Instellingen
            </h2>
            <div className="mt-2 space-y-1">
              {SETTINGS_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
                    ${pathname === item.href || (item.href !== '/instellingen' && pathname.startsWith(item.href))
                      ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
              >
                <span>←</span>
                <span>Terug naar Dashboard</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <div className="relative w-72 bg-white shadow-xl">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">Instellingen</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-slate-600 hover:text-slate-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3">
                  <RoleSwitcher />
                </div>
              </div>
              
              <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
                {SETTINGS_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
                      ${pathname === item.href || (item.href !== '/instellingen' && pathname.startsWith(item.href))
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }
                    `}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg"
                >
                  <span>←</span>
                  <span>Terug naar Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-slate-200">
            <div className="px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center text-sm text-slate-500">
                <Link href="/dashboard" className="hover:text-slate-700">Dashboard</Link>
                <span className="mx-2 text-slate-400">/</span>
                <Link href="/instellingen" className="hover:text-slate-700">Instellingen</Link>
                {currentItem && currentItem.href !== '/instellingen' && (
                  <>
                    <span className="mx-2 text-slate-400">/</span>
                    <span className="text-slate-800 font-medium">{currentItem.label}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function InstellingenLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <InstellingenLayoutContent>{children}</InstellingenLayoutContent>
      </ToastProvider>
    </AuthProvider>
  );
}
