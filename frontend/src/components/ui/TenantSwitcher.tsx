'use client';

import { useState, useEffect } from 'react';
import type { VVEMembership } from '@/types';

/**
 * TenantSwitcher Component - STORY-024: Multi-tenant toegang en context switcher
 * 
 * Implements:
 * - Context-switcher voor tenant-selectie in navigatie
 * - Inline melding bij tenant-scope wissel
 * - Responsive: dropdown op mobile, header op desktop
 * - Geen modals, gebruik inline/slide-over interacties
 */

// Duration for switch feedback notification (in milliseconds)
const SWITCH_FEEDBACK_DURATION_MS = 2000;

interface TenantSwitcherProps {
  memberships: VVEMembership[];
  currentVveId: string;
  onTenantChange: (vveId: string) => void;
  isLoading?: boolean;
}

export function TenantSwitcher({
  memberships,
  currentVveId,
  onTenantChange,
  isLoading = false,
}: TenantSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSwitchFeedback, setShowSwitchFeedback] = useState(false);

  const currentMembership = memberships.find((m) => m.vve_id === currentVveId);

  const handleTenantSelect = (vveId: string) => {
    if (vveId !== currentVveId) {
      onTenantChange(vveId);
      setShowSwitchFeedback(true);
      setTimeout(() => setShowSwitchFeedback(false), SWITCH_FEEDBACK_DURATION_MS);
    }
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-tenant-switcher]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  if (memberships.length === 0) {
    return (
      <div className="px-4 py-2 text-sm text-gray-500">
        Geen VVE&apos;s beschikbaar
      </div>
    );
  }

  // Single VVE - just show the name without dropdown
  if (memberships.length === 1) {
    return (
      <div className="flex items-center gap-2 px-4 py-2" data-testid="tenant-single">
        <BuildingIcon />
        <span className="text-sm font-medium text-gray-900">
          {currentMembership?.vve_name || 'VVE'}
        </span>
        <RoleBadge role={currentMembership?.role || 'bewoner'} />
      </div>
    );
  }

  return (
    <div className="relative" data-tenant-switcher>
      {/* Switch feedback notification - inline, not modal */}
      {showSwitchFeedback && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700 shadow-lg">
            ✓ Overgeschakeld naar {currentMembership?.vve_name}
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg transition-colors w-full
          ${isOpen 
            ? 'bg-blue-50 text-blue-700' 
            : 'hover:bg-gray-100 text-gray-900'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-testid="tenant-switcher-trigger"
      >
        <BuildingIcon />
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium truncate">
            {currentMembership?.vve_name || 'Selecteer VVE'}
          </p>
          <p className="text-xs text-gray-500">
            {memberships.length} VVE&apos;s
          </p>
        </div>
        <RoleBadge role={currentMembership?.role || 'bewoner'} />
        <ChevronIcon isOpen={isOpen} />
      </button>

      {/* Dropdown menu - slide-over style on mobile, dropdown on desktop */}
      {isOpen && (
        <div 
          className="
            absolute top-full left-0 right-0 mt-1 z-40
            bg-white border border-gray-200 rounded-lg shadow-lg
            max-h-64 overflow-y-auto
            md:w-80
          "
          role="listbox"
          data-testid="tenant-switcher-menu"
        >
          <div className="p-2">
            <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Uw VVE&apos;s
            </p>
          </div>
          <ul className="divide-y divide-gray-100">
            {memberships.map((membership) => (
              <li key={membership.vve_id}>
                <button
                  onClick={() => handleTenantSelect(membership.vve_id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                    ${membership.vve_id === currentVveId 
                      ? 'bg-blue-50' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                  role="option"
                  aria-selected={membership.vve_id === currentVveId}
                >
                  <div className="flex-shrink-0">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      ${membership.vve_id === currentVveId 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      <BuildingIcon />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`
                      text-sm font-medium truncate
                      ${membership.vve_id === currentVveId 
                        ? 'text-blue-900' 
                        : 'text-gray-900'
                      }
                    `}>
                      {membership.vve_name}
                    </p>
                    {membership.unit_number && (
                      <p className="text-xs text-gray-500">
                        Appartement {membership.unit_number}
                      </p>
                    )}
                  </div>
                  <RoleBadge role={membership.role} />
                  {membership.vve_id === currentVveId && (
                    <CheckIcon />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Helper components
function BuildingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    beheerder: 'bg-purple-100 text-purple-800',
    bestuurslid: 'bg-blue-100 text-blue-800',
    penningmeester: 'bg-green-100 text-green-800',
    bewoner: 'bg-gray-100 text-gray-800',
  };

  const labels: Record<string, string> = {
    beheerder: 'Beheerder',
    bestuurslid: 'Bestuur',
    penningmeester: 'Penning.',
    bewoner: 'Bewoner',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[role] || colors.bewoner}`}>
      {labels[role] || role}
    </span>
  );
}

export default TenantSwitcher;
