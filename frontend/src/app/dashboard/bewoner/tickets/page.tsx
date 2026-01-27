'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Ticket, TicketStatus, TicketCategory, TicketPriority } from '@/types';

/**
 * Tickets List Page - STORY-029: Bewoner ticket wizard en tijdlijn
 * 
 * Displays all tickets for the current user.
 * - Shows ticket status, priority, and category
 * - Allows filtering by status
 * - Links to ticket detail page
 */

const STATUS_LABELS: Record<TicketStatus, { label: string; color: string }> = {
  draft: { label: 'Concept', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Ingediend', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In behandeling', color: 'bg-yellow-100 text-yellow-700' },
  awaiting_info: { label: 'Wacht op info', color: 'bg-orange-100 text-orange-700' },
  resolved: { label: 'Opgelost', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Gesloten', color: 'bg-gray-100 text-gray-500' },
};

const CATEGORY_ICONS: Record<TicketCategory, string> = {
  maintenance: '🔧',
  noise: '🔊',
  safety: '⚠️',
  cleaning: '🧹',
  facilities: '🏢',
  other: '📝',
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchTickets() {
      try {
        // TODO: Get VVE ID from context/session
        const vveId = 'demo-vve-id';
        const params = statusFilter !== 'all' ? { status: statusFilter } : undefined;
        const data = await api.getTickets(vveId, params);
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kon tickets niet ophalen');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTickets();
  }, [statusFilter]);

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mijn Meldingen</h1>
          <p className="text-gray-600">Beheer uw meldingen en klachten</p>
        </div>
        <Link
          href="/dashboard/bewoner/tickets/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Nieuwe Melding
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'Alle' },
          { value: 'submitted', label: 'Ingediend' },
          { value: 'in_progress', label: 'In behandeling' },
          { value: 'resolved', label: 'Opgelost' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              ${statusFilter === filter.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Geen meldingen gevonden
          </h3>
          <p className="text-gray-600 mb-4">
            U heeft nog geen meldingen ingediend.
          </p>
          <Link
            href="/dashboard/bewoner/tickets/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Eerste melding maken
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/dashboard/bewoner/tickets/${ticket.id}`}
              className="block p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Category Icon */}
                <div className="text-2xl">
                  {CATEGORY_ICONS[ticket.category]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {ticket.title}
                    </h3>
                    <span
                      className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${STATUS_LABELS[ticket.status].color}
                      `}
                    >
                      {STATUS_LABELS[ticket.status].label}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {ticket.description}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>
                      {new Date(ticket.created_at).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {ticket.location && (
                      <span>📍 {ticket.location}</span>
                    )}
                    <span className={PRIORITY_COLORS[ticket.priority]}>
                      {ticket.priority === 'urgent' && '🔴 Urgent'}
                      {ticket.priority === 'high' && '🟠 Hoog'}
                      {ticket.priority === 'medium' && '🔵 Gemiddeld'}
                      {ticket.priority === 'low' && '⚪ Laag'}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-gray-400">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
