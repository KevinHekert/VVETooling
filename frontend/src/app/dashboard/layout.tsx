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
 * - Role-specific navigation with sidebar
 * - Nested navigation groups for better organization
 * - Role switcher for multi-VVE users
 * - Improved color contrast
 */

// Navigation items per role - organized in groups
interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

interface NavGroup {
  label: string;
  icon: string;
  roles: UserRole[];
  items: NavItem[];
}

// Grouped navigation structure
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overzicht',
    icon: '🏠',
    roles: ['bewoner', 'bestuurslid', 'penningmeester', 'beheerder'],
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['bewoner', 'bestuurslid', 'penningmeester', 'beheerder'] },
      { label: 'Mijn Status', href: '/dashboard/bewoner', icon: '🏠', roles: ['bewoner', 'bestuurslid', 'penningmeester', 'beheerder'] },
      { label: 'Documenten', href: '/dashboard/documenten', icon: '📁', roles: ['bewoner', 'bestuurslid', 'penningmeester', 'beheerder'] },
    ],
  },
  {
    label: 'Financiën',
    icon: '💰',
    roles: ['penningmeester', 'beheerder', 'bestuurslid', 'bewoner'],
    items: [
      { label: 'Mijn Reserves', href: '/dashboard/bewoner/reserves', icon: '🏦', roles: ['bewoner', 'bestuurslid'] },
      { label: 'Transacties', href: '/dashboard/penningmeester/transactions', icon: '💰', roles: ['penningmeester', 'beheerder'] },
      { label: 'Begrotingen', href: '/dashboard/penningmeester/budgets', icon: '📊', roles: ['penningmeester', 'beheerder'] },
      { label: 'Reserves', href: '/dashboard/penningmeester/reserves', icon: '🏦', roles: ['penningmeester', 'beheerder'] },
      { label: 'Contributies', href: '/dashboard/penningmeester/contributions', icon: '💵', roles: ['penningmeester', 'beheerder'] },
      { label: 'Jaarrekening', href: '/dashboard/penningmeester/jaarrekening', icon: '📈', roles: ['bestuurslid', 'penningmeester', 'beheerder'] },
    ],
  },
  {
    label: 'Beheer',
    icon: '⚙️',
    roles: ['beheerder', 'bestuurslid'],
    items: [
      { label: 'Ledenadministratie', href: '/dashboard/beheerder/leden', icon: '👤', roles: ['beheerder'] },
      { label: 'Contracten', href: '/dashboard/beheerder/contracten', icon: '📝', roles: ['beheerder', 'bestuurslid'] },
      { label: 'ALV', href: '/dashboard/beheerder/alv', icon: '📅', roles: ['beheerder', 'bestuurslid'] },
      { label: 'Audit Log', href: '/dashboard/beheerder/audit', icon: '📋', roles: ['beheerder'] },
    ],
  },
  {
    label: 'Correspondentie',
    icon: '✉️',
    roles: ['beheerder', 'bestuurslid'],
    items: [
      { label: 'Sjablonen', href: '/dashboard/beheerder/correspondentie/sjablonen', icon: '📝', roles: ['beheerder', 'bestuurslid'] },
      { label: 'Brieven', href: '/dashboard/beheerder/correspondentie/brieven', icon: '✉️', roles: ['beheerder', 'bestuurslid'] },
      { label: 'Verzending', href: '/dashboard/beheerder/correspondentie/verzending', icon: '📤', roles: ['beheerder', 'bestuurslid'] },
    ],
  },
  {
    label: 'Instellingen',
    icon: '🔧',
    roles: ['beheerder'],
    items: [
      { label: 'Splitsingssleutel', href: '/instellingen/splitsingssleutel', icon: '🔑', roles: ['beheerder'] },
      { label: 'Rollen & Rechten', href: '/instellingen/rollen', icon: '👥', roles: ['beheerder'] },
      { label: 'VVE Instellingen', href: '/instellingen/onboarding', icon: '⚙️', roles: ['beheerder'] },
    ],
  },
];

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { currentRole, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Default to 'bewoner' if no role set (for demo)
  const activeRole = currentRole || 'bewoner';
  
  // Filter nav groups and items based on current role
  const visibleGroups = NAV_GROUPS.filter(group => 
    group.roles.includes(activeRole)
  ).map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(activeRole))
  })).filter(group => group.items.length > 0);

  // Find the group containing the active page and expand it by default
  const findActiveGroup = (): string[] => {
    for (const group of visibleGroups) {
      const hasActiveItem = group.items.some(item => 
        pathname === item.href || pathname.startsWith(item.href + '/')
      );
      if (hasActiveItem) {
        return [group.label];
      }
    }
    return ['Overzicht']; // Default fallback
  };

  const [expandedGroups, setExpandedGroups] = useState<string[]>(findActiveGroup);

  // Toggle group expansion
  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupLabel) 
        ? prev.filter(g => g !== groupLabel)
        : [...prev, groupLabel]
    );
  };

  // Find current page label for breadcrumb
  const findCurrentPageLabel = () => {
    for (const group of visibleGroups) {
      const item = group.items.find(item => 
        pathname === item.href || pathname.startsWith(item.href + '/')
      );
      if (item) return { group: group.label, item: item.label };
    }
    return null;
  };
  const currentPage = findCurrentPageLabel();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Navigation Header */}
      <nav className="bg-white shadow-md border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                VVE Tooling
              </Link>
            </div>

            {/* Right side: Role Switcher + Logout */}
            <div className="flex items-center gap-4">
              {/* Role Switcher - Desktop */}
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
          <nav className="p-4 space-y-2">
            {visibleGroups.map((group) => (
              <div key={group.label} className="mb-2">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>{group.icon}</span>
                    <span>{group.label}</span>
                  </span>
                  <svg 
                    className={`w-4 h-4 text-slate-500 transition-transform ${expandedGroups.includes(group.label) ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Group Items */}
                {expandedGroups.includes(group.label) && (
                  <div className="mt-1 ml-4 space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
                          ${pathname === item.href || pathname.startsWith(item.href + '/')
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
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="relative w-72 bg-white shadow-xl">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">Menu</span>
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
              
              <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
                {visibleGroups.map((group) => (
                  <div key={group.label} className="mb-2">
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <span className="flex items-center gap-2">
                        <span>{group.icon}</span>
                        <span>{group.label}</span>
                      </span>
                      <svg 
                        className={`w-4 h-4 text-slate-500 transition-transform ${expandedGroups.includes(group.label) ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedGroups.includes(group.label) && (
                      <div className="mt-1 ml-4 space-y-1">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                              flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
                              ${pathname === item.href || pathname.startsWith(item.href + '/')
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }
                            `}
                          >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
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
                {currentPage && (
                  <>
                    <span className="mx-2 text-slate-400">/</span>
                    <span className="text-slate-600">{currentPage.group}</span>
                    <span className="mx-2 text-slate-400">/</span>
                    <span className="text-slate-800 font-medium">{currentPage.item}</span>
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

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </ToastProvider>
    </AuthProvider>
  );
}
