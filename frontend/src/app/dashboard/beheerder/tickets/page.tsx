'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Ticket, TicketStatus, TicketCategory, TicketPriority } from '@/types';

/**
 * Bestuur/Beheerder Tickets Overview - STORY-031
 * 
 * Displays all tickets for the VVE with filters for:
 * - Status (ingediend, in behandeling, opgelost)
 * - Priority (low, medium, high, urgent)
 * - Category
 * 
 * Staff can manage and update tickets from this view.
 */

const STATUS_LABELS: Record<TicketStatus, { label: string; color: string }> = {
  draft: { label: 'Concept', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Ingediend', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In behandeling', color: 'bg-yellow-100 text-yellow-700' },
  awaiting_info: { label: 'Wacht op info', color: 'bg-orange-100 text-orange-700' },
  resolved: { label: 'Opgelost', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Gesloten', color: 'bg-gray-100 text-gray-500' },
};

const CATEGORY_LABELS: Record<TicketCategory, { label: string; icon: string }> = {
  maintenance: { label: 'Onderhoud', icon: '🔧' },
  noise: { label: 'Geluidsoverlast', icon: '🔊' },
  safety: { label: 'Veiligheid', icon: '⚠️' },
  cleaning: { label: 'Schoonmaak', icon: '🧹' },
  facilities: { label: 'Faciliteiten', icon: '🏢' },
  other: { label: 'Overig', icon: '📝' },
};

const PRIORITY_LABELS: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: 'Laag', color: 'text-gray-500' },
  medium: { label: 'Gemiddeld', color: 'text-blue-500' },
  high: { label: 'Hoog', color: 'text-orange-500' },
  urgent: { label: 'Urgent', color: 'text-red-500 font-bold' },
};

export default function BeheerderTicketsPage() {
  const { currentVveId } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchTickets() {
      if (!currentVveId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const params: { status?: string; priority?: string; category?: string } = {};
        if (statusFilter !== 'all') params.status = statusFilter;
        if (priorityFilter !== 'all') params.priority = priorityFilter;
        if (categoryFilter !== 'all') params.category = categoryFilter;
        
        const data = await api.getTickets(currentVveId, params);
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kon tickets niet ophalen');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter, currentVveId]);

  // Stats for quick overview
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => ['submitted', 'awaiting_info'].includes(t.status)).length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ticket Beheer</h1>
        <p className="text-gray-600">Beheer alle meldingen en klachten van bewoners</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Totaal</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-sm font-medium text-blue-700">Open</p>
          <p className="text-2xl font-bold text-blue-900">{stats.open}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <p className="text-sm font-medium text-yellow-700">In behandeling</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <p className="text-sm font-medium text-red-700">Urgent</p>
          <p className="text-2xl font-bold text-red-900">{stats.urgent}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Alle</option>
              <option value="submitted">Ingediend</option>
              <option value="in_progress">In behandeling</option>
              <option value="awaiting_info">Wacht op info</option>
              <option value="resolved">Opgelost</option>
              <option value="closed">Gesloten</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioriteit</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Alle</option>
              <option value="urgent">Urgent</option>
              <option value="high">Hoog</option>
              <option value="medium">Gemiddeld</option>
              <option value="low">Laag</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Alle</option>
              <option value="maintenance">Onderhoud</option>
              <option value="noise">Geluidsoverlast</option>
              <option value="safety">Veiligheid</option>
              <option value="cleaning">Schoonmaak</option>
              <option value="facilities">Faciliteiten</option>
              <option value="other">Overig</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Geen tickets gevonden
          </h3>
          <p className="text-gray-600">
            Er zijn geen tickets die voldoen aan de huidige filters.
          </p>
        </div>
      ) : (
        /* Tickets Table */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingediend door
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioriteit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actie
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {CATEGORY_LABELS[ticket.category]?.icon || '📝'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {ticket.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {CATEGORY_LABELS[ticket.category]?.label || ticket.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {ticket.submitted_by_name || 'Onbekend'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${STATUS_LABELS[ticket.status].color}
                      `}
                    >
                      {STATUS_LABELS[ticket.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${PRIORITY_LABELS[ticket.priority].color}`}>
                      {PRIORITY_LABELS[ticket.priority].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(ticket.created_at).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/beheerder/tickets/${ticket.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Bekijken →
                    </Link>
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
