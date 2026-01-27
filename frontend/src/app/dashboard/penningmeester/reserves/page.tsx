'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { DashboardGrid, KPICard } from '@/components/ui/RoleSwitcher';
import { useAuth } from '@/hooks/useAuth';

/**
 * Reserves Overview Page - STORY-013, STORY-027
 * 
 * STORY-013 Implements:
 * - Reserves section in financial menu
 * - Balance per reserve with allocated transactions
 * - Inline actions for allocation/modification
 * - Mobile-first summary, desktop full table
 * 
 * STORY-027 Adds:
 * - Inline reclassification with toast confirmation
 * - Audit trail visible in same page
 * - Export of history
 */

// Reserve classification types
type ReserveCategory = 'onderhoud' | 'vervanging' | 'algemeen' | 'noodfonds' | 'specifiek';

const CATEGORY_CONFIG: Record<ReserveCategory, { label: string; color: string }> = {
  onderhoud: { label: 'Onderhoud', color: 'bg-blue-100 text-blue-700' },
  vervanging: { label: 'Vervanging', color: 'bg-purple-100 text-purple-700' },
  algemeen: { label: 'Algemeen', color: 'bg-gray-100 text-gray-700' },
  noodfonds: { label: 'Noodfonds', color: 'bg-red-100 text-red-700' },
  specifiek: { label: 'Specifiek', color: 'bg-green-100 text-green-700' },
};

// Mock reserve data
interface Reserve {
  id: string;
  name: string;
  target_amount: number;
  current_balance: number;
  allocated_count: number;
  description?: string;
  status: 'on_track' | 'below_target' | 'above_target';
  category: ReserveCategory;
}

// STORY-027: Audit trail entry
interface AuditEntry {
  id: string;
  reserve_id: string;
  reserve_name: string;
  action: 'reclassificatie' | 'allocatie' | 'doelwijziging' | 'naamwijziging';
  old_value: string;
  new_value: string;
  user_name: string;
  timestamp: string;
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
    category: 'onderhoud',
  },
  {
    id: 'res-2',
    name: 'Lift Vervanging',
    target_amount: 25000,
    current_balance: 18750,
    allocated_count: 12,
    description: 'Gespaard voor vervanging lift in 2028',
    status: 'on_track',
    category: 'vervanging',
  },
  {
    id: 'res-3',
    name: 'Dakbedekking',
    target_amount: 15000,
    current_balance: 8500,
    allocated_count: 8,
    description: 'Reserve voor dakonderhoud',
    status: 'below_target',
    category: 'onderhoud',
  },
  {
    id: 'res-4',
    name: 'Algemene Reserve',
    target_amount: 10000,
    current_balance: 12500,
    allocated_count: 5,
    description: 'Algemene buffer voor onvoorziene kosten',
    status: 'above_target',
    category: 'algemeen',
  },
];

// STORY-027: Mock audit trail
const MOCK_AUDIT_TRAIL: AuditEntry[] = [
  {
    id: 'audit-1',
    reserve_id: 'res-1',
    reserve_name: 'Groot Onderhoud',
    action: 'allocatie',
    old_value: '€30.000',
    new_value: '€32.500',
    user_name: 'Jan Jansen',
    timestamp: '2026-01-20T14:30:00Z',
  },
  {
    id: 'audit-2',
    reserve_id: 'res-3',
    reserve_name: 'Dakbedekking',
    action: 'reclassificatie',
    old_value: 'Algemeen',
    new_value: 'Onderhoud',
    user_name: 'Maria de Vries',
    timestamp: '2026-01-15T09:15:00Z',
  },
  {
    id: 'audit-3',
    reserve_id: 'res-2',
    reserve_name: 'Lift Vervanging',
    action: 'doelwijziging',
    old_value: '€20.000',
    new_value: '€25.000',
    user_name: 'Jan Jansen',
    timestamp: '2026-01-10T11:00:00Z',
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
  
  // STORY-027: Reclassification and audit trail state
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [reclassifyingId, setReclassifyingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<ReserveCategory>('onderhoud');
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  useEffect(() => {
    // Simulate API call
    const loadReserves = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setReserves(MOCK_RESERVES);
      setAuditTrail(MOCK_AUDIT_TRAIL);
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

  // STORY-027: Handle reclassification
  const handleReclassify = (reserveId: string) => {
    const reserve = reserves.find(r => r.id === reserveId);
    if (reserve) {
      setReclassifyingId(reserveId);
      setNewCategory(reserve.category);
    }
  };

  const handleSaveReclassification = async (reserveId: string) => {
    const reserve = reserves.find(r => r.id === reserveId);
    if (!reserve) return;

    const oldCategory = reserve.category;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update reserve category
    setReserves(prev => prev.map(r => 
      r.id === reserveId ? { ...r, category: newCategory } : r
    ));
    
    // Add to audit trail
    const newAuditEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      reserve_id: reserveId,
      reserve_name: reserve.name,
      action: 'reclassificatie',
      old_value: CATEGORY_CONFIG[oldCategory].label,
      new_value: CATEGORY_CONFIG[newCategory].label,
      user_name: 'Huidige Gebruiker',
      timestamp: new Date().toISOString(),
    };
    setAuditTrail(prev => [newAuditEntry, ...prev]);
    
    setReclassifyingId(null);
    addToast(`${reserve.name} geherclassificeerd naar ${CATEGORY_CONFIG[newCategory].label}`, 'success');
  };

  // STORY-027: Export audit trail
  const handleExportAuditTrail = () => {
    const headers = ['Datum', 'Reserve', 'Actie', 'Van', 'Naar', 'Gebruiker'];
    const rows = auditTrail.map(entry => [
      new Date(entry.timestamp).toLocaleDateString('nl-NL'),
      entry.reserve_name,
      entry.action,
      entry.old_value,
      entry.new_value,
      entry.user_name,
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reserves_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    addToast('Audit trail geëxporteerd', 'success');
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
        <div className="flex gap-2">
          {/* STORY-027: Audit trail toggle */}
          <button
            onClick={() => setShowAuditTrail(!showAuditTrail)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            📜 Historie {auditTrail.length > 0 && `(${auditTrail.length})`}
          </button>
          {canEdit && (
            <button
              onClick={() => addToast('Nieuwe reserve functie komt binnenkort', 'info')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Nieuwe Reserve
            </button>
          )}
        </div>
      </div>

      {/* STORY-027: Audit Trail Section */}
      {showAuditTrail && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Wijzigingshistorie</h2>
            <button
              onClick={handleExportAuditTrail}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Exporteren
            </button>
          </div>
          {auditTrail.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">Geen wijzigingen gevonden</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {auditTrail.map((entry) => (
                <li key={entry.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          entry.action === 'reclassificatie' ? 'bg-purple-100 text-purple-700' :
                          entry.action === 'allocatie' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {entry.action}
                        </span>
                        <span className="font-medium text-gray-900">{entry.reserve_name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {entry.old_value} → {entry.new_value}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{new Date(entry.timestamp).toLocaleDateString('nl-NL')}</p>
                      <p>{entry.user_name}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Categorie</th>
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
                const isReclassifying = reclassifyingId === reserve.id;
                
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
                    {/* STORY-027: Category column with inline reclassification */}
                    <td className="px-6 py-4 text-center">
                      {isReclassifying ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value as ReserveCategory)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            {(Object.keys(CATEGORY_CONFIG) as ReserveCategory[]).map((cat) => (
                              <option key={cat} value={cat}>
                                {CATEGORY_CONFIG[cat].label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleSaveReclassification(reserve.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setReclassifyingId(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${CATEGORY_CONFIG[reserve.category].color}`}>
                            {CATEGORY_CONFIG[reserve.category].label}
                          </span>
                          {canEdit && (
                            <button
                              onClick={() => handleReclassify(reserve.id)}
                              className="text-gray-400 hover:text-gray-600 ml-1"
                              title="Herclassificeren"
                            >
                              ✎
                            </button>
                          )}
                        </div>
                      )}
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
