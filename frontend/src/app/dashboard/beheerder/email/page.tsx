'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Email Monitoring & Logging Page - STORY-054
 * 
 * Implements:
 * - Email send log with status display
 * - Filters by date, status, provider, recipient
 * - Dashboard stats widget
 * - CSV export functionality
 * - High failure rate alerts
 * - AVG-compliant (no email content logged)
 */

type EmailStatus = 'queued' | 'sending' | 'sent' | 'failed' | 'rejected' | 'bounced';
type EmailProvider = 'mailchimp' | 'amazon_ses' | 'sendgrid';

interface EmailLogEntry {
  id: string;
  message_id: string | null;
  recipient_count: number;
  recipient_preview: string;
  subject: string;
  provider: EmailProvider;
  status: EmailStatus;
  error_message: string | null;
  created_at: string;
}

interface EmailStats {
  sent_today: number;
  sent_week: number;
  sent_month: number;
  success_rate: number;
  failures_count: number;
  alert_high_failure: boolean;
}

// Mock data
const MOCK_LOGS: EmailLogEntry[] = [
  {
    id: '1',
    message_id: 'msg-abc123',
    recipient_count: 15,
    recipient_preview: 'b****@vve.nl',
    subject: 'Uitnodiging ALV 2026',
    provider: 'sendgrid',
    status: 'sent',
    error_message: null,
    created_at: '2026-01-27T14:30:00Z',
  },
  {
    id: '2',
    message_id: 'msg-def456',
    recipient_count: 1,
    recipient_preview: 'j****@example.com',
    subject: 'Welkom bij VVE Zonnepark',
    provider: 'mailchimp',
    status: 'sent',
    error_message: null,
    created_at: '2026-01-27T12:15:00Z',
  },
  {
    id: '3',
    message_id: 'msg-ghi789',
    recipient_count: 3,
    recipient_preview: 'm****@gmail.com',
    subject: 'Herinnering: contributie betaling',
    provider: 'amazon_ses',
    status: 'failed',
    error_message: 'Sender address not verified',
    created_at: '2026-01-27T10:00:00Z',
  },
  {
    id: '4',
    message_id: 'msg-jkl012',
    recipient_count: 20,
    recipient_preview: 'a****@vve.nl',
    subject: 'Nieuwsbrief januari 2026',
    provider: 'sendgrid',
    status: 'sent',
    error_message: null,
    created_at: '2026-01-26T16:45:00Z',
  },
  {
    id: '5',
    message_id: null,
    recipient_count: 1,
    recipient_preview: 'o****@test.nl',
    subject: 'Test e-mail',
    provider: 'mailchimp',
    status: 'rejected',
    error_message: 'Invalid recipient address',
    created_at: '2026-01-26T11:30:00Z',
  },
];

const MOCK_STATS: EmailStats = {
  sent_today: 16,
  sent_week: 78,
  sent_month: 245,
  success_rate: 96.8,
  failures_count: 8,
  alert_high_failure: false,
};

const STATUS_CONFIG: Record<EmailStatus, { label: string; color: string; icon: string }> = {
  queued: { label: 'Wachtrij', color: 'bg-gray-100 text-gray-800', icon: '⏳' },
  sending: { label: 'Verzenden', color: 'bg-blue-100 text-blue-800', icon: '📤' },
  sent: { label: 'Verzonden', color: 'bg-green-100 text-green-800', icon: '✓' },
  failed: { label: 'Mislukt', color: 'bg-red-100 text-red-800', icon: '✕' },
  rejected: { label: 'Geweigerd', color: 'bg-orange-100 text-orange-800', icon: '⚠' },
  bounced: { label: 'Bounce', color: 'bg-yellow-100 text-yellow-800', icon: '↩' },
};

const PROVIDER_CONFIG: Record<EmailProvider, { label: string; icon: string }> = {
  mailchimp: { label: 'Mailchimp', icon: '📧' },
  amazon_ses: { label: 'Amazon SES', icon: '☁️' },
  sendgrid: { label: 'SendGrid', icon: '✉️' },
};

export default function EmailMonitoringPage() {
  const { addToast } = useToast();
  
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<EmailLogEntry | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<EmailStatus | 'all'>('all');
  const [providerFilter, setProviderFilter] = useState<EmailProvider | 'all'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setLogs(MOCK_LOGS);
      setStats(MOCK_STATS);
    } catch {
      addToast('Fout bij laden gegevens', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Datum', 'Onderwerp', 'Ontvanger', 'Aantal', 'Provider', 'Status', 'Foutmelding'];
    const rows = filteredLogs.map(log => [
      new Date(log.created_at).toLocaleString('nl-NL'),
      log.subject,
      log.recipient_preview,
      log.recipient_count.toString(),
      PROVIDER_CONFIG[log.provider].label,
      STATUS_CONFIG[log.status].label,
      log.error_message || '',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addToast('Export gedownload', 'success');
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    if (providerFilter !== 'all' && log.provider !== providerFilter) return false;
    if (searchQuery && !log.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.recipient_preview.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Date filter
    const logDate = new Date(log.created_at);
    const now = new Date();
    if (dateRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (logDate < today) return false;
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (logDate < weekAgo) return false;
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (logDate < monthAgo) return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-mail Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Overzicht van verzonden e-mails en statistieken
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <span>📥</span>
          Export CSV
        </button>
      </div>

      {/* Alert for high failure rate */}
      {stats?.alert_high_failure && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium text-red-900">
                Hoog percentage mislukte e-mails gedetecteerd
              </p>
              <p className="text-sm text-red-700 mt-1">
                Meer dan 5% van de e-mails in de afgelopen 24 uur is mislukt. Controleer uw e-mail configuratie.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Vandaag"
            value={stats.sent_today}
            icon="📊"
            color="blue"
          />
          <StatCard
            title="Deze week"
            value={stats.sent_week}
            icon="📈"
            color="green"
          />
          <StatCard
            title="Deze maand"
            value={stats.sent_month}
            icon="📅"
            color="purple"
          />
          <StatCard
            title="Succespercentage"
            value={`${stats.success_rate}%`}
            icon="✓"
            color={stats.success_rate >= 95 ? 'green' : stats.success_rate >= 90 ? 'yellow' : 'red'}
          />
          <StatCard
            title="Mislukt"
            value={stats.failures_count}
            icon="✕"
            color={stats.failures_count === 0 ? 'green' : 'red'}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Periode</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'today' | 'week' | 'month' | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="today">Vandaag</option>
              <option value="week">Afgelopen week</option>
              <option value="month">Afgelopen maand</option>
              <option value="all">Alles</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EmailStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Alle statussen</option>
              {(Object.keys(STATUS_CONFIG) as EmailStatus[]).map(status => (
                <option key={status} value={status}>
                  {STATUS_CONFIG[status].icon} {STATUS_CONFIG[status].label}
                </option>
              ))}
            </select>
          </div>

          {/* Provider Filter */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Provider</label>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value as EmailProvider | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Alle providers</option>
              {(Object.keys(PROVIDER_CONFIG) as EmailProvider[]).map(provider => (
                <option key={provider} value={provider}>
                  {PROVIDER_CONFIG[provider].icon} {PROVIDER_CONFIG[provider].label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Zoeken</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek op onderwerp of ontvanger..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Email Log Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Verzendhistorie
            <span className="text-sm text-gray-500 ml-2">
              ({filteredLogs.length} resultaten)
            </span>
          </h2>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="text-4xl">📭</span>
            <p className="mt-2">Geen e-mails gevonden</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Onderwerp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ontvanger
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString('nl-NL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.subject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {log.recipient_preview}
                          {log.recipient_count > 1 && (
                            <span className="ml-1 text-xs text-gray-400">
                              +{log.recipient_count - 1} anderen
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          {PROVIDER_CONFIG[log.provider].icon}
                          {PROVIDER_CONFIG[log.provider].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[log.status].color}`}>
                          {STATUS_CONFIG[log.status].icon}
                          {STATUS_CONFIG[log.status].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900">{log.subject}</div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[log.status].color}`}>
                      {STATUS_CONFIG[log.status].icon}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {log.recipient_preview}
                    {log.recipient_count > 1 && ` +${log.recipient_count - 1}`}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{PROVIDER_CONFIG[log.provider].icon} {PROVIDER_CONFIG[log.provider].label}</span>
                    <span>{new Date(log.created_at).toLocaleString('nl-NL')}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">E-mail Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[selectedLog.status].color}`}>
                  {STATUS_CONFIG[selectedLog.status].icon}
                  {STATUS_CONFIG[selectedLog.status].label}
                </span>
                <span className="text-sm text-gray-500">
                  {PROVIDER_CONFIG[selectedLog.provider].icon} {PROVIDER_CONFIG[selectedLog.provider].label}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Onderwerp</p>
                <p className="font-medium">{selectedLog.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Ontvanger(s)</p>
                <p className="font-medium">
                  {selectedLog.recipient_preview}
                  {selectedLog.recipient_count > 1 && (
                    <span className="text-gray-500"> en {selectedLog.recipient_count - 1} anderen</span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Verzonden op</p>
                <p className="font-medium">
                  {new Date(selectedLog.created_at).toLocaleString('nl-NL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {selectedLog.message_id && (
                <div>
                  <p className="text-sm text-gray-500">Message ID</p>
                  <p className="font-mono text-sm">{selectedLog.message_id}</p>
                </div>
              )}

              {selectedLog.error_message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-medium">Foutmelding</p>
                  <p className="text-sm text-red-600 mt-1">{selectedLog.error_message}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
