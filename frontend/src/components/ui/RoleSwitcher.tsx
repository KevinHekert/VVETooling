'use client';

import { useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

/**
 * Role Switcher Component - STORY-009
 * Allows users with multiple VVE memberships or roles to switch context.
 * No page refresh required - uses React state for instant switching.
 */

interface RoleSwitcherProps {
  onRoleChange?: (role: UserRole, vveId: string) => void;
}

// Mock memberships for demo - in production from auth context
const MOCK_MEMBERSHIPS = [
  { vve_id: 'vve-1', vve_name: 'VVE Amstelplein', role: 'beheerder' as UserRole },
  { vve_id: 'vve-2', vve_name: 'VVE Keizersgracht', role: 'bestuurslid' as UserRole },
  { vve_id: 'vve-3', vve_name: 'VVE Prinsengracht 12', role: 'bewoner' as UserRole },
];

export function RoleSwitcher({ onRoleChange }: RoleSwitcherProps) {
  const { currentVveId, setCurrentVve, memberships: authMemberships } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Use mock data if no real memberships available
  const memberships = authMemberships.length > 0 ? authMemberships : MOCK_MEMBERSHIPS;
  const currentMembership = memberships.find(m => m.vve_id === currentVveId) || memberships[0];

  const handleSelect = useCallback((vveId: string, role: UserRole) => {
    setCurrentVve(vveId);
    onRoleChange?.(role, vveId);
    setIsOpen(false);
  }, [setCurrentVve, onRoleChange]);

  if (memberships.length <= 1) {
    // Single membership - show badge only, no switcher
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
        <RoleBadge role={currentMembership?.role as UserRole} />
        <span className="text-sm text-slate-700">{currentMembership?.vve_name}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <RoleBadge role={currentMembership?.role as UserRole} />
        <span className="text-sm text-slate-800 font-medium">
          {currentMembership?.vve_name}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-slate-300 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-slate-600 uppercase">
                VVE Contexten
              </p>
              <ul role="listbox">
                {memberships.map((membership) => (
                  <li key={membership.vve_id}>
                    <button
                      onClick={() => handleSelect(membership.vve_id, membership.role as UserRole)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                        transition-colors
                        ${membership.vve_id === currentVveId 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-slate-50'
                        }
                      `}
                      role="option"
                      aria-selected={membership.vve_id === currentVveId}
                    >
                      <RoleBadge role={membership.role as UserRole} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {membership.vve_name}
                        </p>
                        <p className="text-xs text-slate-600">
                          {getRoleLabel(membership.role as UserRole)}
                        </p>
                      </div>
                      {membership.vve_id === currentVveId && (
                        <span className="text-blue-600">✓</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Role Badge - Shows colored badge based on role
 */
export function RoleBadge({ role, size = 'sm' }: { role: UserRole; size?: 'sm' | 'md' }) {
  const colors: Record<UserRole, string> = {
    beheerder: 'bg-purple-500',
    bestuurslid: 'bg-blue-500',
    penningmeester: 'bg-green-500',
    bewoner: 'bg-gray-400',
  };

  const icons: Record<UserRole, string> = {
    beheerder: '🔧',
    bestuurslid: '👔',
    penningmeester: '💰',
    bewoner: '🏠',
  };

  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';

  return (
    <span
      className={`
        ${sizeClasses} ${colors[role]}
        inline-flex items-center justify-center rounded-full text-white
      `}
      title={getRoleLabel(role)}
    >
      {icons[role]}
    </span>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    beheerder: 'Beheerder',
    bestuurslid: 'Bestuurslid',
    penningmeester: 'Penningmeester',
    bewoner: 'Bewoner',
  };
  return labels[role];
}

/**
 * Dashboard Widget Container - STORY-009
 * Reusable widget/card component for dashboard content
 */
interface DashboardWidgetProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function DashboardWidget({ title, children, actions, className = '' }: DashboardWidgetProps) {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/**
 * Dashboard Grid - STORY-009
 * Responsive grid layout for dashboard widgets
 */
interface DashboardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export function DashboardGrid({ children, columns = 3 }: DashboardGridProps) {
  const colClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid gap-4 ${colClasses[columns]}`}>
      {children}
    </div>
  );
}

/**
 * KPI Card - Read-only metric display
 */
interface KPICardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}

export function KPICard({ label, value, trend, trendLabel }: KPICardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {trend && (
        <p className={`text-sm mt-1 ${trendColors[trend]}`}>
          {trendIcons[trend]} {trendLabel}
        </p>
      )}
    </div>
  );
}

export default RoleSwitcher;
