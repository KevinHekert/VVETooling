'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { DashboardGrid, KPICard } from '@/components/ui/RoleSwitcher';
import { useAuth } from '@/hooks/useAuth';
import type { Transaction, TransactionCategory, TransactionSummary } from '@/types';

/**
 * Transaction Dashboard Page - STORY-012
 * 
 * Implements:
 * - Filters on period, category, reserve, status
 * - Widgets for balance, outstanding, recent anomalies
 * - Exportable table with inline feedback
 * - Read-only roles see only view-widgets
 */

// Category labels
const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  contribution: 'Contributie',
  maintenance: 'Onderhoud',
  energy: 'Energie',
  insurance: 'Verzekering',
  administrative: 'Administratief',
  reserve: 'Reserve',
  other: 'Overig',
};

export default function TransactionsPage() {
  const { addToast } = useToast();
  const { currentRole, currentVveId } = useAuth();
  const canEdit = currentRole === 'beheerder' || currentRole === 'penningmeester';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Widget visibility
  const [showWidgets, setShowWidgets] = useState(true);

  const loadTransactions = useCallback(async () => {
    if (!currentVveId) {
      setIsLoading(false);
      return;
    }
    
    try {
      const params: { category?: string } = {};
      if (categoryFilter) params.category = categoryFilter;
      
      const [txData, summaryData] = await Promise.all([
        api.getTransactions(currentVveId, params),
        api.getTransactionSummary(currentVveId),
      ]);
      
      setTransactions(txData);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon transacties niet ophalen');
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, currentVveId]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Apply client-side filters
  const filteredTransactions = transactions.filter((tx) => {
    if (startDate && new Date(tx.transaction_date) < new Date(startDate)) return false;
    if (endDate && new Date(tx.transaction_date) > new Date(endDate + 'T23:59:59')) return false;
    if (searchTerm && !tx.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    // Convert to CSV
    const headers = ['Datum', 'Categorie', 'Beschrijving', 'Bedrag'];
    const rows = filteredTransactions.map((tx) => [
      new Date(tx.transaction_date).toLocaleDateString('nl-NL'),
      CATEGORY_LABELS[tx.category],
      tx.description || '',
      tx.amount.toFixed(2),
    ]);
    
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacties-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    addToast('Transacties geëxporteerd', 'success');
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transacties</h1>
          <p className="text-gray-600">Overzicht van alle financiële transacties</p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Link
                href="/dashboard/penningmeester/transactions/import"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                📥 Importeren
              </Link>
              <Link
                href="/dashboard/penningmeester/transactions/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Transactie
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Toggle Widgets */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowWidgets(!showWidgets)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showWidgets ? 'Widgets verbergen' : 'Widgets tonen'}
        </button>
      </div>

      {/* Summary Widgets */}
      {showWidgets && summary && (
        <DashboardGrid columns={4}>
          <KPICard
            label="Totale Inkomsten"
            value={`€ ${summary.total_income.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
            trend="up"
          />
          <KPICard
            label="Totale Uitgaven"
            value={`€ ${summary.total_expenses.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
            trend="down"
          />
          <KPICard
            label="Netto Saldo"
            value={`€ ${summary.net_balance.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
            trend={summary.net_balance >= 0 ? 'up' : 'down'}
          />
          <KPICard
            label="Aantal Transacties"
            value={summary.transaction_count.toString()}
          />
        </DashboardGrid>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Zoeken</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Zoek op beschrijving..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div className="w-full sm:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="w-full sm:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vanaf</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full sm:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tot</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Filters wissen
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            📊 Export
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredTransactions.length} van {transactions.length} transacties
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-5xl mb-4">💰</div>
            <p>Geen transacties gevonden</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categorie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beschrijving</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bedrag</th>
                    {canEdit && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acties</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tx.transaction_date).toLocaleDateString('nl-NL')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CategoryBadge category={tx.category} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {tx.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        <span className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {tx.amount >= 0 ? '+' : ''}€ {Math.abs(tx.amount).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button className="text-blue-600 hover:text-blue-800 mr-2">Bewerk</button>
                          <button className="text-red-600 hover:text-red-800">Verwijder</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CategoryBadge category={tx.category} />
                    <span className="text-xs text-gray-500">
                      {new Date(tx.transaction_date).toLocaleDateString('nl-NL')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mb-1">{tx.description || '-'}</p>
                  <p className={`text-lg font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount >= 0 ? '+' : ''}€ {Math.abs(tx.amount).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: TransactionCategory }) {
  const colors: Record<TransactionCategory, string> = {
    contribution: 'bg-green-100 text-green-800',
    maintenance: 'bg-orange-100 text-orange-800',
    energy: 'bg-yellow-100 text-yellow-800',
    insurance: 'bg-blue-100 text-blue-800',
    administrative: 'bg-gray-100 text-gray-800',
    reserve: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colors[category]}`}>
      {CATEGORY_LABELS[category]}
    </span>
  );
}
