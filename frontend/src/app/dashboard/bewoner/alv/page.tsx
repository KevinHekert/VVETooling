'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type {
  MeetingListItem,
  MeetingProxy,
  ProxyCreate,
  ProxyScope,
  ProxyStatusType,
  EligibleGrantee,
  ProxyListItem,
  AgendaItem,
} from '@/types';

/**
 * ALV (Algemene Ledenvergadering) Page for Bewoner - STORY-072, STORY-073
 *
 * Allows bewoner to:
 * - View upcoming ALV meetings
 * - Register RSVP for meetings
 * - STORY-073: Grant digital proxy (volmacht) to another member
 * - View and manage their proxies
 */

const PROXY_SCOPE_LABELS: Record<ProxyScope, string> = {
  full: 'Volledige volmacht (alle agendapunten)',
  specific: 'Beperkte volmacht (specifieke agendapunten)',
};

const PROXY_STATUS_LABELS: Record<ProxyStatusType, { label: string; color: string }> = {
  pending: { label: 'Wacht op bevestiging', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Bevestigd', color: 'bg-green-100 text-green-700' },
  revoked: { label: 'Ingetrokken', color: 'bg-red-100 text-red-700' },
};

export default function BewonerALVPage() {
  const { currentVveId } = useAuth();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selected meeting state
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingListItem | null>(null);

  // STORY-073: Proxy state
  const [showProxyForm, setShowProxyForm] = useState(false);
  const [eligibleGrantees, setEligibleGrantees] = useState<EligibleGrantee[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [myProxy, setMyProxy] = useState<MeetingProxy | null>(null);
  const [receivedProxies, setReceivedProxies] = useState<ProxyListItem[]>([]);
  const [isLoadingProxy, setIsLoadingProxy] = useState(false);
  const [isSubmittingProxy, setIsSubmittingProxy] = useState(false);

  // Proxy form state
  const [proxyForm, setProxyForm] = useState<ProxyCreate>({
    grantee_id: '',
    scope: 'full',
    notes: '',
  });
  const [selectedAgendaItems, setSelectedAgendaItems] = useState<string[]>([]);

  const fetchMeetings = async () => {
    if (!currentVveId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.getMeetings(currentVveId, { upcoming_only: true });
      setMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon vergaderingen niet ophalen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [currentVveId]);

  const handleSelectMeeting = async (meeting: MeetingListItem) => {
    if (!currentVveId) return;
    setSelectedMeeting(meeting);
    setIsLoadingProxy(true);
    setError(null);

    try {
      // Load proxy data for this meeting
      const [myProxyData, receivedData, granteesData, agendaData] = await Promise.all([
        api.getMyProxy(currentVveId, meeting.id).catch(() => null),
        api.getReceivedProxies(currentVveId, meeting.id),
        api.getEligibleGrantees(currentVveId, meeting.id),
        api.getAgendaItems(currentVveId, meeting.id),
      ]);

      setMyProxy(myProxyData);
      setReceivedProxies(receivedData);
      setEligibleGrantees(granteesData);
      setAgendaItems(agendaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon volmacht gegevens niet ophalen');
    } finally {
      setIsLoadingProxy(false);
    }
  };

  const handleSubmitProxy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting || !currentVveId) return;

    setIsSubmittingProxy(true);
    setError(null);

    try {
      const proxyData: ProxyCreate = {
        grantee_id: proxyForm.grantee_id,
        scope: proxyForm.scope,
        notes: proxyForm.notes,
      };

      if (proxyForm.scope === 'specific' && selectedAgendaItems.length > 0) {
        proxyData.agenda_item_ids = selectedAgendaItems;
      }

      const newProxy = await api.createProxy(currentVveId, selectedMeeting.id, proxyData);
      setMyProxy(newProxy);
      setShowProxyForm(false);
      setSuccessMessage('Volmacht succesvol afgegeven! De gevolmachtigde ontvangt een bevestigingsverzoek.');
      setTimeout(() => setSuccessMessage(null), 5000);

      // Reset form
      setProxyForm({ grantee_id: '', scope: 'full', notes: '' });
      setSelectedAgendaItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon volmacht niet afgeven');
    } finally {
      setIsSubmittingProxy(false);
    }
  };

  const handleRevokeProxy = async () => {
    if (!selectedMeeting || !myProxy || !currentVveId) return;

    if (!confirm('Weet u zeker dat u deze volmacht wilt intrekken?')) return;

    setIsLoadingProxy(true);
    try {
      const revokedProxy = await api.revokeProxy(currentVveId, selectedMeeting.id, myProxy.id);
      setMyProxy(revokedProxy);
      setSuccessMessage('Volmacht ingetrokken.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon volmacht niet intrekken');
    } finally {
      setIsLoadingProxy(false);
    }
  };

  const handleConfirmProxy = async (proxyId: string) => {
    if (!selectedMeeting || !currentVveId) return;

    setIsLoadingProxy(true);
    try {
      await api.confirmProxy(currentVveId, selectedMeeting.id, proxyId);
      // Refresh received proxies
      const receivedData = await api.getReceivedProxies(currentVveId, selectedMeeting.id);
      setReceivedProxies(receivedData);
      setSuccessMessage('Volmacht bevestigd!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon volmacht niet bevestigen');
    } finally {
      setIsLoadingProxy(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">ALV Vergaderingen</h1>

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Meetings list */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Aankomende Vergaderingen</h2>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Laden...</div>
          ) : meetings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Geen aankomende vergaderingen gepland.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {meetings.map((meeting) => (
                <li
                  key={meeting.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    selectedMeeting?.id === meeting.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelectMeeting(meeting)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(meeting.meeting_date)}
                      </p>
                    </div>
                    {meeting.days_until != null && meeting.days_until >= 0 && (
                      <span className="text-sm text-blue-600 font-medium">
                        Nog {meeting.days_until} dagen
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected meeting details & proxy management */}
        {selectedMeeting && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{selectedMeeting.title}</h2>
              <p className="text-sm text-gray-500">{formatDate(selectedMeeting.meeting_date)}</p>
            </div>

            {isLoadingProxy ? (
              <div className="p-6 text-center text-gray-500">Laden...</div>
            ) : (
              <div className="p-6 space-y-6">
                {/* STORY-073: My Proxy Section */}
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-3">
                    Mijn Volmacht (STORY-073)
                  </h3>

                  {myProxy ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Gevolmachtigde:</strong> {myProxy.grantee_name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Type:</strong> {PROXY_SCOPE_LABELS[myProxy.scope]}
                          </p>
                          {myProxy.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Toelichting:</strong> {myProxy.notes}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            PROXY_STATUS_LABELS[myProxy.status].color
                          }`}
                        >
                          {PROXY_STATUS_LABELS[myProxy.status].label}
                        </span>
                      </div>

                      {myProxy.status !== 'revoked' && (
                        <button
                          onClick={handleRevokeProxy}
                          className="mt-3 text-sm text-red-600 hover:text-red-800"
                        >
                          Volmacht intrekken
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      {!showProxyForm ? (
                        <button
                          onClick={() => setShowProxyForm(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Volmacht afgeven
                        </button>
                      ) : (
                        <form onSubmit={handleSubmitProxy} className="space-y-4">
                          {/* Grantee selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Gevolmachtigde *
                            </label>
                            <select
                              value={proxyForm.grantee_id}
                              onChange={(e) =>
                                setProxyForm({ ...proxyForm, grantee_id: e.target.value })
                              }
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Selecteer een persoon...</option>
                              {eligibleGrantees.map((grantee) => (
                                <option key={grantee.id} value={grantee.id}>
                                  {grantee.full_name}
                                  {grantee.is_board_member ? ' (Bestuurslid)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Scope selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type volmacht
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="scope"
                                  value="full"
                                  checked={proxyForm.scope === 'full'}
                                  onChange={() =>
                                    setProxyForm({ ...proxyForm, scope: 'full' })
                                  }
                                  className="mr-2"
                                />
                                <span className="text-sm">
                                  Volledige volmacht (alle agendapunten)
                                </span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="scope"
                                  value="specific"
                                  checked={proxyForm.scope === 'specific'}
                                  onChange={() =>
                                    setProxyForm({ ...proxyForm, scope: 'specific' })
                                  }
                                  className="mr-2"
                                />
                                <span className="text-sm">
                                  Beperkte volmacht (specifieke agendapunten)
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Agenda items selection (if specific scope) */}
                          {proxyForm.scope === 'specific' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Selecteer agendapunten *
                              </label>
                              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                                {agendaItems.length === 0 ? (
                                  <p className="text-sm text-gray-500">
                                    Geen agendapunten beschikbaar.
                                  </p>
                                ) : (
                                  agendaItems.map((item) => (
                                    <label
                                      key={item.id}
                                      className="flex items-center py-1"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedAgendaItems.includes(item.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedAgendaItems([
                                              ...selectedAgendaItems,
                                              item.id,
                                            ]);
                                          } else {
                                            setSelectedAgendaItems(
                                              selectedAgendaItems.filter(
                                                (id) => id !== item.id
                                              )
                                            );
                                          }
                                        }}
                                        className="mr-2"
                                      />
                                      <span className="text-sm">{item.title}</span>
                                    </label>
                                  ))
                                )}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Toelichting (optioneel)
                            </label>
                            <textarea
                              value={proxyForm.notes || ''}
                              onChange={(e) =>
                                setProxyForm({ ...proxyForm, notes: e.target.value })
                              }
                              maxLength={500}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Eventuele instructies voor de gevolmachtigde..."
                            />
                          </div>

                          {/* Submit buttons */}
                          <div className="flex gap-3">
                            <button
                              type="submit"
                              disabled={
                                isSubmittingProxy ||
                                !proxyForm.grantee_id ||
                                (proxyForm.scope === 'specific' &&
                                  selectedAgendaItems.length === 0)
                              }
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {isSubmittingProxy ? 'Bezig...' : 'Volmacht afgeven'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowProxyForm(false);
                                setProxyForm({ grantee_id: '', scope: 'full', notes: '' });
                                setSelectedAgendaItems([]);
                              }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                              Annuleren
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                {/* Received Proxies Section */}
                {receivedProxies.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-3">
                      Ontvangen Volmachten
                    </h3>
                    <div className="space-y-3">
                      {receivedProxies.map((proxy) => (
                        <div
                          key={proxy.id}
                          className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm text-gray-600">
                              <strong>Van:</strong> {proxy.grantor_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Type:</strong> {PROXY_SCOPE_LABELS[proxy.scope]}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                PROXY_STATUS_LABELS[proxy.status].color
                              }`}
                            >
                              {PROXY_STATUS_LABELS[proxy.status].label}
                            </span>
                            {proxy.status === 'pending' && (
                              <button
                                onClick={() => handleConfirmProxy(proxy.id)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                Bevestigen
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
