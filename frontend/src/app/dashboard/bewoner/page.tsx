'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { BewonersStatus, ContributionStatus } from '@/types';

/**
 * Bewoner Dashboard - STORY-003: Bewoner ziet eigen betalingsstatus
 * 
 * Mobile-first design with:
 * - Current month payment status
 * - Year-to-date overview
 * - Recent payments (last 6 months for mobile)
 * - Non-blocking notifications (inline/toast)
 */
export default function BewonersPage() {
  const [status, setStatus] = useState<BewonersStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const data = await api.getBewonersStatus();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kon status niet ophalen');
      } finally {
        setIsLoading(false);
      }
    }
    fetchStatus();
  }, []);

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

  if (!status) {
    return (
      <div className="text-center text-gray-500 py-8">
        Geen gegevens beschikbaar
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mijn Status</h1>
        <p className="text-gray-600">{status.vve_name} • Eenheid {status.unit_number}</p>
      </div>

      {/* Status Cards - Mobile-first grid (max 3-4 items as per UX guidelines) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Current Month Status */}
        <StatusCard
          title="Deze Maand"
          status={status.current_month_status}
          amount={status.current_month_paid}
          total={status.current_month_due}
        />

        {/* Year-to-Date */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Dit Jaar</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            €{status.total_paid_year.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            van €{status.total_due_year.toFixed(2)}
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${Math.min(100, (status.total_paid_year / status.total_due_year) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500">Openstaand</h3>
          <p className={`text-2xl font-bold mt-1 ${
            status.outstanding_balance > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            €{status.outstanding_balance.toFixed(2)}
          </p>
          {status.has_overdue_payments && (
            <p className="text-sm text-red-500 mt-1">
              ⚠ U heeft openstaande betalingen
            </p>
          )}
          {status.is_up_to_date && (
            <p className="text-sm text-green-500 mt-1">
              ✓ Alles is betaald
            </p>
          )}
        </div>
      </div>

      {/* Next Due Date */}
      {status.next_due_date && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Volgende betaling:</strong>{' '}
            {new Date(status.next_due_date).toLocaleDateString('nl-NL', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      )}

      {/* Recent Contributions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b">
          <h2 className="text-lg font-medium text-gray-900">Recente Betalingen</h2>
        </div>
        <div className="divide-y">
          {status.recent_contributions.length === 0 ? (
            <p className="px-4 py-3 text-gray-500">Geen recente betalingen</p>
          ) : (
            status.recent_contributions.map((contribution) => (
              <div key={contribution.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">
                    {getMonthName(contribution.month)} {contribution.year}
                  </p>
                  <p className="text-sm text-gray-500">
                    €{contribution.amount_paid.toFixed(2)} van €{contribution.amount_due.toFixed(2)}
                  </p>
                </div>
                <ContributionStatusBadge status={contribution.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for status card
function StatusCard({
  title,
  status,
  amount,
  total,
}: {
  title: string;
  status: ContributionStatus;
  amount: number;
  total: number;
}) {
  const statusColors = {
    paid: 'bg-green-100 border-green-200',
    pending: 'bg-yellow-100 border-yellow-200',
    overdue: 'bg-red-100 border-red-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${statusColors[status]}`}>
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">
        €{amount.toFixed(2)}
      </p>
      <p className="text-sm text-gray-600">van €{total.toFixed(2)}</p>
      <ContributionStatusBadge status={status} className="mt-2" />
    </div>
  );
}

// Status badge component
function ContributionStatusBadge({
  status,
  className = '',
}: {
  status: ContributionStatus;
  className?: string;
}) {
  const badges = {
    paid: { text: 'Betaald', color: 'bg-green-100 text-green-800' },
    pending: { text: 'In afwachting', color: 'bg-yellow-100 text-yellow-800' },
    overdue: { text: 'Achterstallig', color: 'bg-red-100 text-red-800' },
  };

  const badge = badges[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color} ${className}`}>
      {badge.text}
    </span>
  );
}

// Helper to get Dutch month name
function getMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
  ];
  return months[month - 1] || '';
}
