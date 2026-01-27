'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { DashboardGrid, KPICard } from '@/components/ui/RoleSwitcher';
import { useAuth } from '@/hooks/useAuth';

/**
 * Reserves Overview Page - STORY-013
 * 
 * Implements:
 * - Reserves section in financial menu
 * - Balance per reserve with allocated transactions
 * - Inline actions for allocation/modification
 * - Mobile-first summary, desktop full table
 */

// Mock reserve data
interface Reserve {
  id: string;
  name: string;
  target_amount: number;
  current_balance: number;
  allocated_count: number;
  description?: string;
  status: 'on_track' | 'below_target' | 'above_target';
}

const MOCK_RESERVES: Reserve[] = [
  {
    id: 'res-1',
    name: 'Groot Onderhoud',
    target_amount: 50000,
    current_balance: 32500,
    allocated_count: 24,
    description: 'Reserve voor groot onderhoud aan gebouw',
    status: 'on_track',
  },
  {
    id: 'res-2',
    name: 'Lift Vervanging',
    target_amount: 25000,
    current_balance: 18750,
    allocated_count: 12,
    description: 'Gespaard voor vervanging lift in 2028',
    status: 'on_track',
  },
  {
    id: 'res-3',
    name: 'Dakbedekking',
    target_amount: 15000,
    current_balance: 8500,
    allocated_count: 8,
    description: 'Reserve voor dakonderhoud',
    status: 'below_target',
  },
  {
    id: 'res-4',
    name: 'Algemene Reserve',
    target_amount: 10000,
    current_balance: 12500,
    allocated_count: 5,
    description: 'Algemene buffer voor onvoorziene kosten',
    status: 'above_target',
  },
];

export default function ReservesPage() {
  const { addToast } = useToast();
  const { currentRole } = useAuth();
  const canEdit = currentRole === 'beheerder' || currentRole === 'penningmeester';

  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);

  useEffect(() => {
    // Simulate API call
    const loadReserves = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setReserves(MOCK_RESERVES);
      setIsLoading(false);
    };
    loadReserves();
  }, []);

  // Calculate totals
  const totalBalance = reserves.reduce((sum, r) => sum + r.current_balance, 0);
  const totalTarget = reserves.reduce((sum, r) => sum + r.target_amount, 0);
  const percentageOfTarget = totalTarget > 0 ? (totalBalance / totalTarget) * 100 : 0;

  const handleAllocate = (reserveId: string) => {
    setEditingId(reserveId);
    setEditAmount(0);
  };

  const handleSaveAllocation = async (reserveId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setReserves(prev => prev.map(r => 
      r.id === reserveId 
        ? { ...r, current_balance: r.current_balance + editAmount }
        : r
    ));
    
    setEditingId(null);
    addToast(`€${editAmount.toFixed(2)} toegevoegd aan reserve`, 'success');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount(0);
  };

  const getStatusBadge = (status: Reserve['status']) => {
    const badges = {
      on_track: { text: 'Op schema', color: 'bg-green-100 text-green-800' },
      below_target: { text: 'Onder doel', color: 'bg-yellow-100 text-yellow-800' },
      above_target: { text: 'Boven doel', color: 'bg-blue-100 text-blue-800' },
    };
    const badge = badges[status];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.text}
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
          <h1 className="text-2xl font-bold text-gray-900">Reserves</h1>
          <p className="text-gray-600">Overzicht van alle reservefondsen</p>
        </div>
        {canEdit && (
          <button
            onClick={() => addToast('Nieuwe reserve functie komt binnenkort', 'info')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Nieuwe Reserve
          </button>
        )}
      </div>

      {/* Summary KPIs */}
      <DashboardGrid columns={3}>
        <KPICard
          label="Totaal Reserves"
          value={`€ ${totalBalance.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
        />
        <KPICard
          label="Totaal Doel"
          value={`€ ${totalTarget.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
        />
        <KPICard
          label="% van Doel"
          value={`${percentageOfTarget.toFixed(1)}%`}
          trend={percentageOfTarget >= 100 ? 'up' : percentageOfTarget >= 75 ? 'neutral' : 'down'}
        />
      </DashboardGrid>

      {/* Reserves List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserve</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saldo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Doel</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Voortgang</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Transacties</th>
                {canEdit && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acties</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reserves.map((reserve) => {
                const progress = (reserve.current_balance / reserve.target_amount) * 100;
                const isEditing = editingId === reserve.id;
                
                return (
                  <tr key={reserve.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{reserve.name}</p>
                        {reserve.description && (
                          <p className="text-sm text-gray-500">{reserve.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      € {reserve.current_balance.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      € {reserve.target_amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 mx-auto">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(reserve.status)}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {reserve.allocated_count}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                              className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Bedrag"
                            />
                            <button
                              onClick={() => handleSaveAllocation(reserve.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-red-600 hover:text-red-800"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAllocate(reserve.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Allocatie +
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-gray-200">
          {reserves.map((reserve) => {
            const progress = (reserve.current_balance / reserve.target_amount) * 100;
            
            return (
              <div key={reserve.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{reserve.name}</h3>
                  {getStatusBadge(reserve.status)}
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    € {reserve.current_balance.toLocaleString('nl-NL')}
                  </span>
                  <span className="text-sm text-gray-500">
                    / € {reserve.target_amount.toLocaleString('nl-NL')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {progress.toFixed(1)}% bereikt • {reserve.allocated_count} transacties
                </p>
                {canEdit && (
                  <button
                    onClick={() => handleAllocate(reserve.id)}
                    className="mt-2 text-blue-600 text-sm"
                  >
                    + Allocatie toevoegen
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
