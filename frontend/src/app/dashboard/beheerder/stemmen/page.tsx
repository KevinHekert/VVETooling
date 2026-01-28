'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import type { VotingProxyListItem, VotingProxy, VotingProxyStatus, VotingListItem, Voting, VotingStatus, VotingCreate, VotingResults } from '@/types';

/**
 * Digital Voting Management Page - STORY-113, STORY-114, STORY-115, STORY-117
 * 
 * Allows bestuurslid to:
 * - STORY-113: Create and manage digital votings
 * - STORY-114: View who has voted (admin view)
 * - STORY-115: View voting results
 * - STORY-117: Manage voting proxies
 */

const PROXY_STATUS_LABELS: Record<VotingProxyStatus, { label: string; color: string }> = {
  pending: { label: 'In afwachting', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Bevestigd', color: 'bg-green-100 text-green-700' },
  revoked: { label: 'Ingetrokken', color: 'bg-red-100 text-red-700' },
  used: { label: 'Gebruikt', color: 'bg-blue-100 text-blue-700' },
};

const VOTING_STATUS_LABELS: Record<VotingStatus, { label: string; color: string; icon: string }> = {
  draft: { label: 'Concept', color: 'bg-gray-100 text-gray-700', icon: '📝' },
  open: { label: 'Open', color: 'bg-green-100 text-green-700', icon: '✅' },
  closed: { label: 'Gesloten', color: 'bg-blue-100 text-blue-700', icon: '🔒' },
  cancelled: { label: 'Geannuleerd', color: 'bg-red-100 text-red-700', icon: '❌' },
};

type TabType = 'votings' | 'proxies';

export default function DigitalVotingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('votings');
  
  // Voting state (STORY-113)
  const [votings, setVotings] = useState<VotingListItem[]>([]);
  const [selectedVoting, setSelectedVoting] = useState<Voting | null>(null);
  const [votingResults, setVotingResults] = useState<VotingResults | null>(null);
  const [isLoadingVotings, setIsLoadingVotings] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVoting, setNewVoting] = useState<VotingCreate>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    quorum_percentage: 50,
  });
  const [isCreating, setIsCreating] = useState(false);
  
  // Proxy state (STORY-117)
  const [proxies, setProxies] = useState<VotingProxyListItem[]>([]);
  const [selectedProxy, setSelectedProxy] = useState<VotingProxy | null>(null);
  const [isLoadingProxies, setIsLoadingProxies] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Common state
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // TODO: Get VVE ID from context/session
  const vveId = 'demo-vve-id';

  // Fetch votings (STORY-113)
  const fetchVotings = async () => {
    setIsLoadingVotings(true);
    try {
      const data = await api.listVotings(vveId);
      setVotings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon stemmingen niet ophalen');
    } finally {
      setIsLoadingVotings(false);
    }
  };

  // Create voting (STORY-113)
  const handleCreateVoting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.createVoting(vveId, newVoting);
      setSuccessMessage('Stemming aangemaakt');
      setShowCreateForm(false);
      setNewVoting({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        quorum_percentage: 50,
      });
      fetchVotings();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon stemming niet aanmaken');
    } finally {
      setIsCreating(false);
    }
  };

  // Open voting (STORY-113)
  const handleOpenVoting = async (votingId: string) => {
    try {
      await api.openVoting(vveId, votingId);
      setSuccessMessage('Stemming geopend');
      fetchVotings();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon stemming niet openen');
    }
  };

  // Close voting (STORY-115)
  const handleCloseVoting = async (votingId: string) => {
    try {
      await api.closeVoting(vveId, votingId);
      setSuccessMessage('Stemming gesloten');
      fetchVotings();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon stemming niet sluiten');
    }
  };

  // View voting results (STORY-115)
  const handleViewResults = async (voting: VotingListItem) => {
    try {
      const [details, results] = await Promise.all([
        api.getVoting(vveId, voting.id),
        api.getVotingResults(vveId, voting.id),
      ]);
      setSelectedVoting(details);
      setVotingResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon resultaten niet ophalen');
    }
  };

  // Fetch proxies (STORY-117)
  const fetchProxies = async () => {
    setIsLoadingProxies(true);
    try {
      const params = statusFilter ? { status: statusFilter } : undefined;
      const data = await api.listVotingProxies(vveId, params);
      setProxies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon volmachten niet ophalen');
    } finally {
      setIsLoadingProxies(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'votings') {
      fetchVotings();
    } else {
      fetchProxies();
    }
  }, [activeTab, statusFilter]);

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

  // Count votings by status
  const votingStatusCounts = votings.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🗳️ Digitaal Stemmen</h1>
          <p className="text-gray-600 mt-1">Beheer stemmingen en volmachten</p>
        </div>
        {activeTab === 'votings' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Nieuwe stemming
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('votings')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'votings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🗳️ Stemmingen ({votings.length})
        </button>
        <button
          onClick={() => setActiveTab('proxies')}
          className={`pb-2 px-1 font-medium ${
            activeTab === 'proxies'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📝 Volmachten ({proxies.length})
        </button>
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

      {/* VOTINGS TAB - STORY-113, STORY-115 */}
      {activeTab === 'votings' && (
        <>
          {/* Voting Status Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{votings.length}</div>
              <div className="text-sm text-gray-500">Totaal</div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{votingStatusCounts.draft || 0}</div>
              <div className="text-sm text-gray-600">Concept</div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{votingStatusCounts.open || 0}</div>
              <div className="text-sm text-green-600">Open</div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{votingStatusCounts.closed || 0}</div>
              <div className="text-sm text-blue-600">Gesloten</div>
            </div>
          </div>

          {/* Votings List */}
          {isLoadingVotings ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : votings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Nog geen stemmingen aangemaakt</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Eerste stemming aanmaken
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stemmen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {votings.map((voting) => (
                    <tr key={voting.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${VOTING_STATUS_LABELS[voting.status].color}`}>
                          {VOTING_STATUS_LABELS[voting.status].icon} {VOTING_STATUS_LABELS[voting.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{voting.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(voting.start_date).toLocaleDateString('nl-NL')} - {new Date(voting.end_date).toLocaleDateString('nl-NL')}
                        {voting.is_active && voting.days_remaining !== undefined && (
                          <span className="ml-2 text-green-600">({voting.days_remaining} dagen)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{voting.total_votes}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {voting.status === 'draft' && (
                            <button
                              onClick={() => handleOpenVoting(voting.id)}
                              className="text-sm text-green-600 hover:text-green-800"
                            >
                              Openen
                            </button>
                          )}
                          {voting.status === 'open' && (
                            <button
                              onClick={() => handleCloseVoting(voting.id)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Sluiten
                            </button>
                          )}
                          <button
                            onClick={() => handleViewResults(voting)}
                            className="text-sm text-purple-600 hover:text-purple-800"
                          >
                            Resultaten
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Create Voting Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                <form onSubmit={handleCreateVoting} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Nieuwe stemming aanmaken</h2>
                    <button type="button" onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                      <input
                        type="text"
                        value={newVoting.title}
                        onChange={(e) => setNewVoting({ ...newVoting, title: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Voorstel: ..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
                      <textarea
                        value={newVoting.description || ''}
                        onChange={(e) => setNewVoting({ ...newVoting, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Beschrijf het voorstel..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum *</label>
                        <input
                          type="datetime-local"
                          value={newVoting.start_date}
                          onChange={(e) => setNewVoting({ ...newVoting, start_date: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Einddatum *</label>
                        <input
                          type="datetime-local"
                          value={newVoting.end_date}
                          onChange={(e) => setNewVoting({ ...newVoting, end_date: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quorum percentage</label>
                      <input
                        type="number"
                        value={newVoting.quorum_percentage || 50}
                        onChange={(e) => setNewVoting({ ...newVoting, quorum_percentage: parseInt(e.target.value) })}
                        min={1}
                        max={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimaal percentage stemgerechtigden dat moet stemmen</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Annuleren</button>
                    <button type="submit" disabled={isCreating} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300">
                      {isCreating ? 'Bezig...' : 'Aanmaken'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Results Modal - STORY-115 */}
          {selectedVoting && votingResults && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">📊 Resultaten: {selectedVoting.title}</h2>
                    <button onClick={() => { setSelectedVoting(null); setVotingResults(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Result badge */}
                    <div className={`p-4 rounded-lg text-center ${
                      votingResults.result === 'accepted' ? 'bg-green-50 text-green-700' :
                      votingResults.result === 'rejected' ? 'bg-red-50 text-red-700' :
                      votingResults.result === 'no_quorum' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      <div className="text-lg font-bold">
                        {votingResults.result === 'accepted' ? '✅ Aangenomen' :
                         votingResults.result === 'rejected' ? '❌ Verworpen' :
                         votingResults.result === 'no_quorum' ? '⚠️ Quorum niet behaald' :
                         '🗳️ Lopend'}
                      </div>
                    </div>

                    {/* Vote counts */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-700">{votingResults.votes_for}</div>
                        <div className="text-sm text-green-600">Voor</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-700">{votingResults.votes_against}</div>
                        <div className="text-sm text-red-600">Tegen</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-gray-700">{votingResults.votes_abstain}</div>
                        <div className="text-sm text-gray-600">Blanco</div>
                      </div>
                    </div>

                    {/* Participation */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Opkomst</span>
                        <span className="font-medium">{votingResults.participation_percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, votingResults.participation_percentage)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Quorum: {votingResults.quorum_percentage}% - {votingResults.quorum_reached ? 'Behaald' : 'Niet behaald'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-right">
                    <button onClick={() => { setSelectedVoting(null); setVotingResults(null); }} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                      Sluiten
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* PROXIES TAB - STORY-117 */}
      {activeTab === 'proxies' && (
        <>
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
          {isLoadingProxies ? (
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
                        <span className={`px-2 py-0.5 rounded-full text-xs ${PROXY_STATUS_LABELS[proxy.status].color}`}>
                          {PROXY_STATUS_LABELS[proxy.status].label}
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
        </>
      )}
    </div>
  );
}
