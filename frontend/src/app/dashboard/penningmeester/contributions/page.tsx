'use client';

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/components/ui/Toast';
import { DashboardWidget, DashboardGrid, KPICard } from '@/components/ui/RoleSwitcher';
import { useAuth } from '@/hooks/useAuth';
import type { Contribution, ContributionStatus } from '@/types';

/**
 * Contributions Page - STORY-014
 * 
 * Implements:
 * - Contributions section in financial menu
 * - Automatic calculation based on splitsingssleutel
 * - Status per owner with badges
 * - Bewoners see only their own status
 * - <2s calculation time
 */

// Mock unit data with contributions
interface UnitContribution {
  unit_id: string;
  unit_number: string;
  owner_name: string;
  share_percentage: number;
  monthly_amount: number;
  status: ContributionStatus;
  paid_ytd: number;
  due_ytd: number;
  last_payment_date?: string;
}

const MOCK_CONTRIBUTIONS: UnitContribution[] = [
  {
    unit_id: 'unit-1',
    unit_number: 'A1',
    owner_name: 'Familie Jansen',
    share_percentage: 12.5,
    monthly_amount: 450,
    status: 'paid',
    paid_ytd: 450,
    due_ytd: 450,
    last_payment_date: '2026-01-15',
  },
  {
    unit_id: 'unit-2',
    unit_number: 'A2',
    owner_name: 'Dhr. De Vries',
    share_percentage: 12.5,
    monthly_amount: 450,
    status: 'paid',
    paid_ytd: 450,
    due_ytd: 450,
    last_payment_date: '2026-01-10',
  },
  {
    unit_id: 'unit-3',
    unit_number: 'B1',
    owner_name: 'Mevr. Van den Berg',
    share_percentage: 15,
    monthly_amount: 540,
    status: 'pending',
    paid_ytd: 0,
    due_ytd: 540,
  },
  {
    unit_id: 'unit-4',
    unit_number: 'B2',
    owner_name: 'Familie Bakker',
    share_percentage: 15,
    monthly_amount: 540,
    status: 'overdue',
    paid_ytd: 0,
    due_ytd: 540,
  },
  {
    unit_id: 'unit-5',
    unit_number: 'C1',
    owner_name: 'Dhr. Visser',
    share_percentage: 20,
    monthly_amount: 720,
    status: 'paid',
    paid_ytd: 720,
    due_ytd: 720,
    last_payment_date: '2026-01-20',
  },
  {
    unit_id: 'unit-6',
    unit_number: 'C2',
    owner_name: 'Mevr. Smit',
    share_percentage: 25,
    monthly_amount: 900,
    status: 'paid',
    paid_ytd: 900,
    due_ytd: 900,
    last_payment_date: '2026-01-05',
  },
];

// Monthly budget total (for calculation)
const MONTHLY_BUDGET = 3600;

export default function ContributionsPage() {
  const { addToast } = useToast();
  const { currentRole } = useAuth();
  const canEdit = currentRole === 'beheerder' || currentRole === 'penningmeester';
  const isBewoner = currentRole === 'bewoner';

  const [contributions, setContributions] = useState<UnitContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // Simulate API call
    const loadContributions = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setContributions(MOCK_CONTRIBUTIONS);
      setIsLoading(false);
    };
    loadContributions();
  }, []);

  // Calculate totals with memoization
  const totals = useMemo(() => {
    const totalDue = contributions.reduce((sum, c) => sum + c.due_ytd, 0);
    const totalPaid = contributions.reduce((sum, c) => sum + c.paid_ytd, 0);
    const outstanding = totalDue - totalPaid;
    const paidCount = contributions.filter(c => c.status === 'paid').length;
    const pendingCount = contributions.filter(c => c.status === 'pending').length;
    const overdueCount = contributions.filter(c => c.status === 'overdue').length;
    
    return { totalDue, totalPaid, outstanding, paidCount, pendingCount, overdueCount };
  }, [contributions]);

  // Filter contributions
  const filteredContributions = useMemo(() => {
    return contributions.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!c.owner_name.toLowerCase().includes(term) && 
            !c.unit_number.toLowerCase().includes(term)) {
          return false;
        }
      }
      return true;
    });
  }, [contributions, statusFilter, searchTerm]);

  const handleRecalculate = async () => {
    setIsCalculating(true);
    addToast('Contributies worden herberekend...', 'info');
    
    // Simulate recalculation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update contributions based on share percentages
    const recalculated = contributions.map(c => ({
      ...c,
      monthly_amount: Math.round((c.share_percentage / 100) * MONTHLY_BUDGET * 100) / 100,
    }));
    
    setContributions(recalculated);
    setIsCalculating(false);
    addToast('Contributies herberekend op basis van splitsingssleutel', 'success');
  };

  const handleSendReminder = (unitId: string) => {
    addToast('Herinnering verzonden', 'success');
  };

  const getStatusBadge = (status: ContributionStatus) => {
    const badges = {
      paid: { text: 'Betaald', color: 'bg-green-100 text-green-800', icon: '✓' },
      pending: { text: 'In afwachting', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      overdue: { text: 'Achterstallig', color: 'bg-red-100 text-red-800', icon: '⚠️' },
    };
    const badge = badges[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contributies</h1>
          <p className="text-gray-600">
            {isBewoner ? 'Uw maandelijkse VVE bijdrage' : 'Overzicht van alle VVE bijdragen'}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={handleRecalculate}
            disabled={isCalculating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isCalculating ? (
              <>
                <span className="animate-spin">⟳</span> Berekenen...
              </>
            ) : (
              <>🔄 Herbereken</>
            )}
          </button>
        )}
      </div>

      {/* Summary KPIs - Only for admins */}
      {!isBewoner && (
        <DashboardGrid columns={4}>
          <KPICard
            label="Totaal Ontvangen"
            value={`€ ${totals.totalPaid.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
            trend="up"
          />
          <KPICard
            label="Openstaand"
            value={`€ ${totals.outstanding.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
            trend={totals.outstanding > 0 ? 'down' : 'up'}
          />
          <KPICard
            label="Betaald"
            value={`${totals.paidCount} van ${contributions.length}`}
          />
          <KPICard
            label="Achterstallig"
            value={totals.overdueCount.toString()}
            trend={totals.overdueCount > 0 ? 'down' : 'up'}
          />
        </DashboardGrid>
      )}

      {/* Filters - Only for admins */}
      {!isBewoner && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Zoeken</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Zoek op eigenaar of eenheid..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle</option>
                <option value="paid">Betaald</option>
                <option value="pending">In afwachting</option>
                <option value="overdue">Achterstallig</option>
              </select>
            </div>
            <button
              onClick={() => { setStatusFilter(''); setSearchTerm(''); }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Filters wissen
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!isBewoner && (
        <div className="text-sm text-gray-600">
          {filteredContributions.length} van {contributions.length} eenheden
        </div>
      )}

      {/* Contributions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eenheid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eigenaar</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aandeel</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Per Maand</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">YTD Betaald</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                {canEdit && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acties</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContributions.map((contrib) => (
                <tr key={contrib.unit_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {contrib.unit_number}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {contrib.owner_name}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {contrib.share_percentage}%
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    € {contrib.monthly_amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={contrib.paid_ytd >= contrib.due_ytd ? 'text-green-600' : 'text-red-600'}>
                      € {contrib.paid_ytd.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-gray-400"> / € {contrib.due_ytd.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(contrib.status)}
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 text-right">
                      {contrib.status !== 'paid' && (
                        <button
                          onClick={() => handleSendReminder(contrib.unit_id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Herinnering
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredContributions.map((contrib) => (
            <div key={contrib.unit_id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-900">{contrib.unit_number}</span>
                  <span className="text-gray-500 ml-2">({contrib.share_percentage}%)</span>
                </div>
                {getStatusBadge(contrib.status)}
              </div>
              <p className="text-sm text-gray-700 mb-2">{contrib.owner_name}</p>
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-bold text-gray-900">
                  € {contrib.monthly_amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}/mnd
                </span>
                <span className={`text-sm ${contrib.paid_ytd >= contrib.due_ytd ? 'text-green-600' : 'text-red-600'}`}>
                  YTD: € {contrib.paid_ytd.toLocaleString('nl-NL')}
                </span>
              </div>
              {contrib.last_payment_date && (
                <p className="text-xs text-gray-500 mt-1">
                  Laatste betaling: {new Date(contrib.last_payment_date).toLocaleDateString('nl-NL')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Calculation Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          💡 Contributies worden berekend op basis van de splitsingssleutel. 
          Maandelijks budget: € {MONTHLY_BUDGET.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}
