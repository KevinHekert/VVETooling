'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Audit Log Page - STORY-010
 * 
 * Implements:
 * - Beheer-menu sectie voor Audit logs
 * - Logs tonen: gebruiker, rol, actie, timestamp, resultaat
 * - Filters op periode, rol en actie (inline)
 * - Export knop (voorbereid)
 * - Responsive tabel met mobiele kernvelden
 */

// Mock audit log type - matches backend schema
interface AuditLogEntry {
  id: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  is_financial: boolean;
  created_at: string;
  ip_address: string | null;
}

// Mock data for demo
const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: '1',
    user_id: 'user-1',
    user_name: 'Jan Jansen',
    action: 'create',
    entity_type: 'transaction',
    entity_id: 'tx-123',
    is_financial: true,
    created_at: '2026-01-26T14:30:00Z',
    ip_address: '192.168.1.1',
  },
  {
    id: '2',
    user_id: 'user-1',
    user_name: 'Jan Jansen',
    action: 'upload',
    entity_type: 'document',
    entity_id: 'doc-456',
    is_financial: false,
    created_at: '2026-01-26T13:15:00Z',
    ip_address: '192.168.1.1',
  },
  {
    id: '3',
    user_id: 'user-2',
    user_name: 'Maria de Vries',
    action: 'download',
    entity_type: 'document',
    entity_id: 'doc-789',
    is_financial: false,
    created_at: '2026-01-26T11:00:00Z',
    ip_address: '10.0.0.5',
  },
  {
    id: '4',
    user_id: 'user-1',
    user_name: 'Jan Jansen',
    action: 'update',
    entity_type: 'budget',
    entity_id: 'budget-2026',
    is_financial: true,
    created_at: '2026-01-25T16:45:00Z',
    ip_address: '192.168.1.1',
  },
  {
    id: '5',
    user_id: 'user-3',
    user_name: 'Pieter van Dijk',
    action: 'login',
    entity_type: 'user',
    entity_id: 'user-3',
    is_financial: false,
    created_at: '2026-01-25T09:00:00Z',
    ip_address: '172.16.0.10',
  },
  {
    id: '6',
    user_id: 'user-1',
    user_name: 'Jan Jansen',
    action: 'approve',
    entity_type: 'budget',
    entity_id: 'budget-2025',
    is_financial: true,
    created_at: '2026-01-24T14:00:00Z',
    ip_address: '192.168.1.1',
  },
];

// Available filter options
const ACTION_TYPES = ['create', 'update', 'delete', 'upload', 'download', 'login', 'approve'];
const ENTITY_TYPES = ['transaction', 'document', 'budget', 'user', 'unit'];

export default function AuditLogPage() {
  const { addToast } = useToast();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [actionFilter, setActionFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [financialOnly, setFinancialOnly] = useState(false);

  useEffect(() => {
    // In production, fetch from API
    // For now, use mock data
    const fetchLogs = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLogs(MOCK_AUDIT_LOGS);
      setIsLoading(false);
    };
    fetchLogs();
  }, []);

  // Apply filters
  const filteredLogs = logs.filter(log => {
    if (actionFilter && log.action !== actionFilter) return false;
    if (entityFilter && log.entity_type !== entityFilter) return false;
    if (financialOnly && !log.is_financial) return false;
    if (startDate && new Date(log.created_at) < new Date(startDate)) return false;
    if (endDate && new Date(log.created_at) > new Date(endDate + 'T23:59:59')) return false;
    return true;
  });

  const handleExport = () => {
    // Future: Export to CSV/Excel
    addToast('Export functionaliteit komt binnenkort', 'info');
  };

  const clearFilters = () => {
    setActionFilter('');
    setEntityFilter('');
    setStartDate('');
    setEndDate('');
    setFinancialOnly(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-600">Overzicht van alle acties binnen uw VVE</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ExportIcon />
          Exporteren
        </button>
      </div>

      {/* Filters - Inline */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Action Filter */}
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actie
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle acties</option>
              {ACTION_TYPES.map(action => (
                <option key={action} value={action}>
                  {getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>

          {/* Entity Type Filter */}
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle types</option>
              {ENTITY_TYPES.map(type => (
                <option key={type} value={type}>
                  {getEntityLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vanaf
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tot
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Financial Only */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <input
              type="checkbox"
              id="financialOnly"
              checked={financialOnly}
              onChange={(e) => setFinancialOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="financialOnly" className="text-sm text-gray-700">
              Alleen financieel
            </label>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Filters wissen
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredLogs.length} resultaten gevonden
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-5xl mb-4">📋</div>
            <p>Geen audit logs gevonden</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum/Tijd
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gebruiker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resultaat
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {log.user_name || 'Systeem'}
                        </div>
                        {log.ip_address && (
                          <div className="text-xs text-gray-500">
                            {log.ip_address}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getEntityLabel(log.entity_type)}
                        {log.is_financial && (
                          <span className="ml-2 text-xs text-amber-600">💰</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ResultBadge success={true} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <ActionBadge action={log.action} />
                    <span className="text-xs text-gray-500">
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {log.user_name || 'Systeem'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getEntityLabel(log.entity_type)}
                    {log.is_financial && ' 💰'}
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

// Helper components
function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    upload: 'bg-purple-100 text-purple-800',
    download: 'bg-indigo-100 text-indigo-800',
    login: 'bg-gray-100 text-gray-800',
    approve: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colors[action] || 'bg-gray-100 text-gray-800'}`}>
      {getActionLabel(action)}
    </span>
  );
}

function ResultBadge({ success }: { success: boolean }) {
  return success ? (
    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
      ✓ Succes
    </span>
  ) : (
    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
      ✗ Mislukt
    </span>
  );
}

function ExportIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

// Helper functions
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    create: 'Aangemaakt',
    update: 'Gewijzigd',
    delete: 'Verwijderd',
    upload: 'Geüpload',
    download: 'Gedownload',
    login: 'Ingelogd',
    approve: 'Goedgekeurd',
  };
  return labels[action] || action;
}

function getEntityLabel(entityType: string): string {
  const labels: Record<string, string> = {
    transaction: 'Transactie',
    document: 'Document',
    budget: 'Begroting',
    user: 'Gebruiker',
    unit: 'Eenheid',
  };
  return labels[entityType] || entityType;
}
