'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import type { VotingProxyListItem, VotingProxy, VotingProxyStatus } from '@/types';

/**
 * Voting Proxies Management Page - STORY-117
 * 
 * Allows bestuurslid to:
 * - View all voting proxies
 * - Confirm or revoke proxies
 * - See proxy status and history
 */

const STATUS_LABELS: Record<VotingProxyStatus, { label: string; color: string }> = {
  pending: { label: 'In afwachting', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Bevestigd', color: 'bg-green-100 text-green-700' },
  revoked: { label: 'Ingetrokken', color: 'bg-red-100 text-red-700' },
  used: { label: 'Gebruikt', color: 'bg-blue-100 text-blue-700' },
};

export default function VotingProxiesPage() {
  const [proxies, setProxies] = useState<VotingProxyListItem[]>([]);
  const [selectedProxy, setSelectedProxy] = useState<VotingProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // TODO: Get VVE ID from context/session
  const vveId = 'demo-vve-id';

  const fetchProxies = async () => {
    setIsLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : undefined;
      const data = await api.listVotingProxies(vveId, params);
      setProxies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon volmachten niet ophalen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProxies();
  }, [statusFilter]);

  const handleViewProxy = async (proxyId: string) => {
    try {
      const proxy = await api.getVotingProxy(vveId, proxyId);
      setSelectedProxy(proxy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon volmacht niet ophalen');
    }
  };

  const handleConfirm = async (proxyId: string) => {
    try {
      await api.confirmVotingProxy(vveId, proxyId);
      setSuccessMessage('Volmacht bevestigd!');
      fetchProxies();
      if (selectedProxy?.id === proxyId) {
        const updated = await api.getVotingProxy(vveId, proxyId);
        setSelectedProxy(updated);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon volmacht niet bevestigen');
    }
  };

  const handleRevoke = async (proxyId: string) => {
    if (!confirm('Weet u zeker dat u deze volmacht wilt intrekken?')) return;
    try {
      await api.revokeVotingProxy(vveId, proxyId);
      setSuccessMessage('Volmacht ingetrokken!');
      fetchProxies();
      if (selectedProxy?.id === proxyId) {
        const updated = await api.getVotingProxy(vveId, proxyId);
        setSelectedProxy(updated);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon volmacht niet intrekken');
    }
  };

  const handleDelete = async (proxyId: string) => {
    if (!confirm('Weet u zeker dat u deze volmacht wilt verwijderen?')) return;
    try {
      await api.deleteVotingProxy(vveId, proxyId);
      setSuccessMessage('Volmacht verwijderd!');
      fetchProxies();
      if (selectedProxy?.id === proxyId) {
        setSelectedProxy(null);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon volmacht niet verwijderen');
    }
  };

  // Count by status
  const statusCounts = proxies.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Digitale Volmachten</h1>
          <p className="text-gray-600 mt-1">Beheer stemvolmachten voor vergaderingen</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Sluiten</button>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {successMessage}
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{proxies.length}</div>
          <div className="text-sm text-gray-500">Totaal</div>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-2xl font-bold text-yellow-700">{statusCounts.pending || 0}</div>
          <div className="text-sm text-yellow-600">In afwachting</div>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl font-bold text-green-700">{statusCounts.confirmed || 0}</div>
          <div className="text-sm text-green-600">Bevestigd</div>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">{statusCounts.used || 0}</div>
          <div className="text-sm text-blue-600">Gebruikt</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alle statussen</option>
          <option value="pending">In afwachting</option>
          <option value="confirmed">Bevestigd</option>
          <option value="revoked">Ingetrokken</option>
          <option value="used">Gebruikt</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proxies List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Volmachten</h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Laden...</div>
          ) : proxies.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
              Geen volmachten gevonden
            </div>
          ) : (
            <div className="space-y-3">
              {proxies.map((proxy) => (
                <div
                  key={proxy.id}
                  className={`p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                    selectedProxy?.id === proxy.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                  onClick={() => handleViewProxy(proxy.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{proxy.grantor_name}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium text-gray-900">{proxy.grantee_name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_LABELS[proxy.status].color}`}>
                          {STATUS_LABELS[proxy.status].label}
                        </span>
                        <span>•</span>
                        <span>Eenheid {proxy.unit_number}</span>
                        {proxy.voting_title && (
                          <>
                            <span>•</span>
                            <span>{proxy.voting_title}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {proxy.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleConfirm(proxy.id); }}
                        >
                          ✓ Bevestigen
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proxy Details */}
        <div>
          {selectedProxy ? (
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">Volmacht Details</h2>
                <button onClick={() => setSelectedProxy(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500">Van (Volmachtgever)</label>
                    <p className="font-medium">{selectedProxy.grantor_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">Aan (Gevolmachtigde)</label>
                    <p className="font-medium">{selectedProxy.grantee_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500">Eenheid</label>
                    <p className="font-medium">{selectedProxy.unit_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">Status</label>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${STATUS_LABELS[selectedProxy.status].color}`}>
                      {STATUS_LABELS[selectedProxy.status].label}
                    </span>
                  </div>
                </div>

                {selectedProxy.voting_title && (
                  <div>
                    <label className="block text-sm text-gray-500">Specifieke Stemming</label>
                    <p className="font-medium">{selectedProxy.voting_title}</p>
                  </div>
                )}

                {selectedProxy.notes && (
                  <div>
                    <label className="block text-sm text-gray-500">Opmerkingen</label>
                    <p className="bg-gray-50 p-3 rounded-lg">{selectedProxy.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-500">Aangemaakt</label>
                    <p>{new Date(selectedProxy.created_at).toLocaleString('nl-NL')}</p>
                  </div>
                  {selectedProxy.confirmed_at && (
                    <div>
                      <label className="block text-gray-500">Bevestigd</label>
                      <p>{new Date(selectedProxy.confirmed_at).toLocaleString('nl-NL')}</p>
                    </div>
                  )}
                  {selectedProxy.revoked_at && (
                    <div>
                      <label className="block text-gray-500">Ingetrokken</label>
                      <p>{new Date(selectedProxy.revoked_at).toLocaleString('nl-NL')}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {selectedProxy.status === 'pending' && (
                    <>
                      <Button onClick={() => handleConfirm(selectedProxy.id)}>
                        ✓ Bevestigen
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(selectedProxy.id)}>
                        Verwijderen
                      </Button>
                    </>
                  )}
                  {selectedProxy.status === 'confirmed' && (
                    <Button variant="secondary" onClick={() => handleRevoke(selectedProxy.id)}>
                      Intrekken
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
              <div>
                <p className="text-lg mb-2">📝</p>
                <p>Selecteer een volmacht voor details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
