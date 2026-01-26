'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import type { Budget } from '@/types';

/**
 * Budget List - STORY-006: Begroting opstellen en exporteren
 * 
 * Implements:
 * - List of budgets for the VVE
 * - Navigate to create new budget or view existing
 * - Export budget to PDF (inline action)
 * - Consistent table/card layout
 */

export default function BudgetsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      // TODO: Get vveId from context
      const vveId = 'demo-vve-id';
      const data = await api.getBudgets(vveId);
      setBudgets(data);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Kon begrotingen niet laden',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (budgetId: string, budgetName: string) => {
    setExportingId(budgetId);
    try {
      // TODO: Get vveId from context
      const vveId = 'demo-vve-id';
      const blob = await api.exportBudgetPdf(vveId, budgetId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${budgetName.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      addToast('Begroting geëxporteerd', 'success');
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Export mislukt',
        'error'
      );
    } finally {
      setExportingId(null);
    }
  };

  const handleDelete = async (budgetId: string) => {
    if (!confirm('Weet je zeker dat je deze begroting wilt verwijderen?')) {
      return;
    }

    try {
      // TODO: Get vveId from context
      const vveId = 'demo-vve-id';
      await api.deleteBudget(vveId, budgetId);
      addToast('Begroting verwijderd', 'success');
      loadBudgets();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Kon begroting niet verwijderen',
        'error'
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-green-100 text-green-800',
      archived: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      draft: 'Concept',
      approved: 'Goedgekeurd',
      archived: 'Gearchiveerd',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Begrotingen laden...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Begrotingen</h1>
          <p className="text-gray-600">Beheer en bekijk VVE begrotingen</p>
        </div>
        <Link
          href="/dashboard/penningmeester/budgets/new"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          + Nieuwe Begroting
        </Link>
      </div>

      {/* Budgets list */}
      {budgets.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Nog geen begrotingen aangemaakt</p>
          <Link
            href="/dashboard/penningmeester/budgets/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Maak je eerste begroting aan →
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jaar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Naam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bijgewerkt
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {budget.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{budget.name}</div>
                    {budget.description && (
                      <div className="text-sm text-gray-500">{budget.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(budget.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {budget.items.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(budget.updated_at).toLocaleDateString('nl-NL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/dashboard/penningmeester/budgets/${budget.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Bekijken
                    </Link>
                    <button
                      onClick={() => handleExport(budget.id, budget.name)}
                      disabled={exportingId === budget.id}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      {exportingId === budget.id ? 'Exporteren...' : 'PDF'}
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Verwijderen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
