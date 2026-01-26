'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Mobile-First Reserves Dashboard for Bewoners - STORY-028
 * 
 * Implements:
 * - Compact card-based reserves overview
 * - Read-only (no edit buttons for bewoners)
 * - Mobile-first design with large tap targets
 * - Fast loading with caching
 * - Extensible with additional cards
 */

// Types
interface Reserve {
  id: string;
  name: string;
  target_amount: number;
  current_balance: number;
  description?: string;
  status: 'on_track' | 'below_target' | 'above_target';
  last_updated: string;
}

// Mock data - cached in localStorage for fast loading
const MOCK_RESERVES: Reserve[] = [
  {
    id: 'res-1',
    name: 'Groot Onderhoud',
    target_amount: 50000,
    current_balance: 32500,
    description: 'Reserve voor groot onderhoud aan gebouw',
    status: 'on_track',
    last_updated: '2026-01-15',
  },
  {
    id: 'res-2',
    name: 'Lift Vervanging',
    target_amount: 25000,
    current_balance: 18750,
    description: 'Gespaard voor vervanging lift in 2028',
    status: 'on_track',
    last_updated: '2026-01-10',
  },
  {
    id: 'res-3',
    name: 'Dakbedekking',
    target_amount: 15000,
    current_balance: 8500,
    description: 'Reserve voor dakonderhoud',
    status: 'below_target',
    last_updated: '2026-01-05',
  },
  {
    id: 'res-4',
    name: 'Algemene Reserve',
    target_amount: 10000,
    current_balance: 12500,
    description: 'Algemene buffer voor onvoorziene kosten',
    status: 'above_target',
    last_updated: '2026-01-20',
  },
];

// Status badge configuration
const STATUS_CONFIG = {
  on_track: { 
    text: 'Op schema', 
    icon: '✓',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-800',
  },
  below_target: { 
    text: 'Onder doel', 
    icon: '⚠',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-800',
  },
  above_target: { 
    text: 'Boven doel', 
    icon: '★',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
};

export default function BewonerReservesPage() {
  const { addToast } = useToast();
  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  const refreshData = async () => {
    try {
      // Simulate API call - should be <2s as per requirement
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // In production: const data = await api.getReserves(vveId);
      const data = MOCK_RESERVES;
      
      // Cache the data
      const timestamp = new Date().toISOString();
      localStorage.setItem('bewoner_reserves_cache', JSON.stringify({
        data,
        timestamp,
      }));
      
      setReserves(data);
      setLastRefresh(timestamp);
      setIsLoading(false);
    } catch {
      addToast('Fout bij laden van reserves', 'error');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadReserves = async () => {
      // Try to load from cache first for fast initial render
      const cached = localStorage.getItem('bewoner_reserves_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        setReserves(data);
        setLastRefresh(timestamp);
        setIsLoading(false);
        
        // Check if cache is older than 5 minutes, if so refresh in background
        const cacheAge = Date.now() - new Date(timestamp).getTime();
        if (cacheAge > 5 * 60 * 1000) {
          refreshData();
        }
        return;
      }

      // No cache, load fresh data
      await refreshData();
    };

    loadReserves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    await refreshData();
    addToast('Gegevens bijgewerkt', 'success');
  };

  // Calculate totals
  const totalBalance = reserves.reduce((sum, r) => sum + r.current_balance, 0);
  const totalTarget = reserves.reduce((sum, r) => sum + r.target_amount, 0);
  const overallProgress = totalTarget > 0 ? (totalBalance / totalTarget) * 100 : 0;

  if (isLoading && reserves.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header - Compact for mobile */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reserves</h1>
          {lastRefresh && (
            <p className="text-xs text-gray-500">
              Bijgewerkt: {new Date(lastRefresh).toLocaleString('nl-NL', { 
                dateStyle: 'short', 
                timeStyle: 'short' 
              })}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          aria-label="Vernieuwen"
        >
          <svg 
            className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Summary Card - Always visible at top */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
        <p className="text-blue-100 text-sm mb-1">Totaal Reserves</p>
        <p className="text-3xl font-bold mb-3">
          € {totalBalance.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}
        </p>
        
        {/* Overall progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm text-blue-100 mb-1">
            <span>{overallProgress.toFixed(0)}% van doel</span>
            <span>€ {totalTarget.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}</span>
          </div>
          <div className="w-full bg-blue-400/50 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-white transition-all duration-500"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
        </div>
        
        <p className="text-xs text-blue-200">
          {reserves.length} reservefondsen
        </p>
      </div>

      {/* Reserve Cards - Mobile-first compact design */}
      <div className="space-y-3">
        {reserves.map((reserve) => {
          const progress = (reserve.current_balance / reserve.target_amount) * 100;
          const config = STATUS_CONFIG[reserve.status];
          
          return (
            <div
              key={reserve.id}
              className={`rounded-xl border p-4 ${config.bgColor} ${config.borderColor}`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {reserve.name}
                  </h3>
                  {reserve.description && (
                    <p className="text-sm text-gray-600 line-clamp-1 mt-0.5">
                      {reserve.description}
                    </p>
                  )}
                </div>
                <span className={`ml-2 shrink-0 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.badgeColor}`}>
                  {config.icon} {config.text}
                </span>
              </div>

              {/* Amount Display - Large and readable */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-gray-900">
                  € {reserve.current_balance.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}
                </span>
                <span className="text-sm text-gray-500">
                  / € {reserve.target_amount.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      progress >= 100 
                        ? 'bg-green-500' 
                        : progress >= 75 
                          ? 'bg-blue-500' 
                          : progress >= 50 
                            ? 'bg-yellow-500' 
                            : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
              </div>

              {/* Footer - Date */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{progress.toFixed(0)}% bereikt</span>
                <span>Bijgewerkt: {new Date(reserve.last_updated).toLocaleDateString('nl-NL')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card - Extensible placeholder */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Over Reserves</h4>
            <p className="text-sm text-gray-600">
              De VVE spaart voor groot onderhoud en onvoorziene kosten. 
              Uw maandelijkse bijdrage gaat deels naar deze reserves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
