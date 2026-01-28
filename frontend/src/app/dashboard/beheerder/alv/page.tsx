'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { MeetingListItem, MeetingCreate, MeetingType, MeetingStatus, AgendaItem, AgendaItemCreate, MeetingInvitationPreview, MeetingRsvp, RsvpSummary, RsvpStatus } from '@/types';

/**
 * ALV (Algemene Ledenvergadering) Management - STORY-069, STORY-070, STORY-071, STORY-072
 * 
 * Allows beheerder/secretaris to:
 * - Plan new ALV meetings with date, time, type and location
 * - View list of upcoming and past meetings
 * - Update meeting status
 * - STORY-070: Manage agenda with items, durations, and drag & drop
 * - STORY-071: Send invitations to all members
 */

const MEETING_TYPE_LABELS: Record<MeetingType, { label: string; icon: string }> = {
  fysiek: { label: 'Fysiek', icon: '🏢' },
  online: { label: 'Online', icon: '💻' },
  hybride: { label: 'Hybride', icon: '🔄' },
};

const MEETING_STATUS_LABELS: Record<MeetingStatus, { label: string; color: string }> = {
  gepland: { label: 'Gepland', color: 'bg-blue-100 text-blue-700' },
  uitnodiging_verzonden: { label: 'Uitnodiging Verzonden', color: 'bg-purple-100 text-purple-700' },
  actief: { label: 'Actief', color: 'bg-green-100 text-green-700' },
  afgesloten: { label: 'Afgesloten', color: 'bg-gray-100 text-gray-700' },
  geannuleerd: { label: 'Geannuleerd', color: 'bg-red-100 text-red-700' },
};

export default function ALVPage() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state
  const [showPast, setShowPast] = useState(false);

  // Form state
  const [formData, setFormData] = useState<MeetingCreate>({
    title: '',
    meeting_date: '',
    meeting_type: 'fysiek',
  });

  // STORY-070: Agenda state
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingListItem | null>(null);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [isLoadingAgenda, setIsLoadingAgenda] = useState(false);
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [newAgendaItem, setNewAgendaItem] = useState<AgendaItemCreate>({
    title: '',
    duration_minutes: 10,
  });
  const [isSubmittingAgenda, setIsSubmittingAgenda] = useState(false);

  // STORY-071: Invitation state
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [invitationPreview, setInvitationPreview] = useState<MeetingInvitationPreview | null>(null);
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(false);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);

  // STORY-072: RSVP state
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [rsvpList, setRsvpList] = useState<MeetingRsvp[]>([]);
  const [rsvpSummary, setRsvpSummary] = useState<RsvpSummary | null>(null);
  const [isLoadingRsvp, setIsLoadingRsvp] = useState(false);

  // TODO: Get VVE ID from context/session
  const vveId = 'demo-vve-id';

  // Calculate minimum date (8 days from now)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 8);
  const minDateStr = minDate.toISOString().split('T')[0];

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMeetings(vveId, { upcoming_only: !showPast });
      setMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon vergaderingen niet ophalen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [showPast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.createMeeting(vveId, {
        ...formData,
        meeting_date: new Date(formData.meeting_date).toISOString(),
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : undefined,
      });
      
      setSuccessMessage('ALV succesvol gepland!');
      setShowAddForm(false);
      setFormData({
        title: '',
        meeting_date: '',
        meeting_type: 'fysiek',
      });
      fetchMeetings();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon ALV niet plannen');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STORY-070: Agenda functions
  const openAgendaModal = async (meeting: MeetingListItem) => {
    setSelectedMeeting(meeting);
    setIsLoadingAgenda(true);
    setError(null);
    try {
      const items = await api.getAgendaItems(vveId, meeting.id);
      setAgendaItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon agenda niet ophalen');
    } finally {
      setIsLoadingAgenda(false);
    }
  };

  const closeAgendaModal = () => {
    setSelectedMeeting(null);
    setAgendaItems([]);
    setShowAgendaForm(false);
    setNewAgendaItem({ title: '', duration_minutes: 10 });
  };

  const handleLoadTemplate = async () => {
    if (!selectedMeeting) return;
    setIsSubmittingAgenda(true);
    setError(null);
    try {
      const items = await api.createStandardAgenda(vveId, selectedMeeting.id);
      setAgendaItems(items);
      setSuccessMessage('Standaard agenda geladen');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon template niet laden');
    } finally {
      setIsSubmittingAgenda(false);
    }
  };

  const handleAddAgendaItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting || !newAgendaItem.title.trim()) return;
    
    setIsSubmittingAgenda(true);
    setError(null);
    try {
      const item = await api.createAgendaItem(vveId, selectedMeeting.id, newAgendaItem);
      setAgendaItems([...agendaItems, item]);
      setNewAgendaItem({ title: '', duration_minutes: 10 });
      setShowAgendaForm(false);
      setSuccessMessage('Agendapunt toegevoegd');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon agendapunt niet toevoegen');
    } finally {
      setIsSubmittingAgenda(false);
    }
  };

  const handleDeleteAgendaItem = async (itemId: string) => {
    if (!selectedMeeting) return;
    try {
      await api.deleteAgendaItem(vveId, selectedMeeting.id, itemId);
      setAgendaItems(agendaItems.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon agendapunt niet verwijderen');
    }
  };

  const handleMoveItem = async (itemId: string, direction: 'up' | 'down') => {
    if (!selectedMeeting) return;
    const currentIndex = agendaItems.findIndex(item => item.id === itemId);
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === agendaItems.length - 1) return;

    const newItems = [...agendaItems];
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newItems[currentIndex], newItems[swapIndex]] = [newItems[swapIndex], newItems[currentIndex]];
    
    setAgendaItems(newItems);
    
    // Persist new order
    try {
      await api.reorderAgendaItems(vveId, selectedMeeting.id, {
        item_ids: newItems.map(item => item.id),
      });
    } catch (err) {
      // Revert on error
      setAgendaItems(agendaItems);
      setError(err instanceof Error ? err.message : 'Kon volgorde niet opslaan');
    }
  };

  const getTotalDuration = () => {
    return agendaItems.reduce((sum, item) => sum + (item.duration_minutes || 0), 0);
  };

  // STORY-071: Invitation functions
  const openInvitationModal = async (meeting: MeetingListItem) => {
    setSelectedMeeting(meeting); // Ensure meeting is set for send
    setShowInvitationModal(true);
    setIsLoadingInvitation(true);
    setError(null);
    try {
      const preview = await api.previewInvitation(vveId, meeting.id);
      setInvitationPreview(preview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon uitnodiging preview niet laden');
    } finally {
      setIsLoadingInvitation(false);
    }
  };

  const closeInvitationModal = () => {
    setShowInvitationModal(false);
    setInvitationPreview(null);
  };

  const handleSendInvitation = async () => {
    if (!selectedMeeting) return;
    setIsSendingInvitation(true);
    setError(null);
    try {
      const result = await api.sendInvitation(vveId, selectedMeeting.id, {
        include_agenda: true,
        include_documents: false,
      });
      setSuccessMessage(`Uitnodiging verstuurd naar ${result.invitations_sent} leden`);
      setTimeout(() => setSuccessMessage(null), 5000);
      closeInvitationModal();
      closeAgendaModal();
      fetchMeetings(); // Refresh to show updated status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon uitnodiging niet versturen');
    } finally {
      setIsSendingInvitation(false);
    }
  };

  // STORY-072: RSVP functions
  const openRsvpModal = async (meeting: MeetingListItem) => {
    setSelectedMeeting(meeting);
    setShowRsvpModal(true);
    setIsLoadingRsvp(true);
    setError(null);
    try {
      const [rsvps, summary] = await Promise.all([
        api.listRsvps(vveId, meeting.id),
        api.getRsvpSummary(vveId, meeting.id),
      ]);
      setRsvpList(rsvps);
      setRsvpSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon RSVP overzicht niet laden');
    } finally {
      setIsLoadingRsvp(false);
    }
  };

  const closeRsvpModal = () => {
    setShowRsvpModal(false);
    setRsvpList([]);
    setRsvpSummary(null);
  };

  const RSVP_STATUS_LABELS: Record<RsvpStatus, { label: string; icon: string; color: string }> = {
    present: { label: 'Aanwezig', icon: '✅', color: 'bg-green-100 text-green-700' },
    absent: { label: 'Afwezig', icon: '❌', color: 'bg-red-100 text-red-700' },
    with_proxy: { label: 'Met volmacht', icon: '📝', color: 'bg-yellow-100 text-yellow-700' },
  };

  // Stats
  const upcomingCount = meetings.filter(m => m.is_upcoming && m.status === 'gepland').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ALV Vergaderingen</h1>
          <p className="text-gray-600">Plan en beheer Algemene Ledenvergaderingen</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Annuleren' : '+ Nieuwe ALV'}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Add ALV Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nieuwe ALV Plannen</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titel *
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={255}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Bijv. Algemene Ledenvergadering 2026"
                />
              </div>

              {/* Meeting Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type Vergadering *
                </label>
                <div className="flex gap-2">
                  {(Object.keys(MEETING_TYPE_LABELS) as MeetingType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, meeting_type: type })}
                      className={`
                        flex-1 px-3 py-2 border rounded-md text-sm font-medium transition-colors
                        ${formData.meeting_type === type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      {MEETING_TYPE_LABELS[type].icon} {MEETING_TYPE_LABELS[type].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum *
                </label>
                <input
                  type="datetime-local"
                  required
                  min={minDateStr}
                  value={formData.meeting_date}
                  onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimaal 8 dagen van tevoren plannen
                </p>
              </div>

              {/* Location Address (for fysiek/hybride) */}
              {(formData.meeting_type === 'fysiek' || formData.meeting_type === 'hybride') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locatie Adres
                  </label>
                  <input
                    type="text"
                    value={formData.location_address || ''}
                    onChange={(e) => setFormData({ ...formData, location_address: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Straat 1, 1234 AB Plaats"
                  />
                </div>
              )}

              {/* Online Link (for online/hybride) */}
              {(formData.meeting_type === 'online' || formData.meeting_type === 'hybride') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Videoconference Link
                  </label>
                  <input
                    type="url"
                    value={formData.location_online_link || ''}
                    onChange={(e) => setFormData({ ...formData, location_online_link: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Omschrijving
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value || undefined })}
                  rows={3}
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Aanvullende informatie over de vergadering..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Plannen...' : 'ALV Plannen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Aankomende ALVs</p>
          <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Totaal</p>
          <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-gray-700">Toon eerdere vergaderingen</span>
        </label>
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
      ) : meetings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Geen vergaderingen gevonden
          </h3>
          <p className="text-gray-600">
            {showPast
              ? 'Er zijn nog geen vergaderingen geregistreerd.'
              : 'Er zijn geen aankomende vergaderingen gepland.'}
          </p>
        </div>
      ) : (
        /* Meetings List */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vergadering
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📅</span>
                      <div>
                        <p className="font-medium text-gray-900">{meeting.title}</p>
                        {meeting.days_until !== null && meeting.days_until !== undefined && (
                          <p className={`text-xs ${meeting.is_upcoming ? 'text-blue-600' : 'text-gray-400'}`}>
                            {meeting.is_upcoming 
                              ? `Nog ${meeting.days_until} dagen`
                              : `${Math.abs(meeting.days_until)} dagen geleden`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(meeting.meeting_date).toLocaleDateString('nl-NL', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center gap-1">
                      {MEETING_TYPE_LABELS[meeting.meeting_type]?.icon}
                      {MEETING_TYPE_LABELS[meeting.meeting_type]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${MEETING_STATUS_LABELS[meeting.status]?.color || 'bg-gray-100 text-gray-700'}
                      `}
                    >
                      {MEETING_STATUS_LABELS[meeting.status]?.label || meeting.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* STORY-070: Agenda button */}
                      <button
                        onClick={() => openAgendaModal(meeting)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        📋 Agenda
                      </button>
                      {/* STORY-072: RSVP button */}
                      <button
                        onClick={() => openRsvpModal(meeting)}
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        📊 RSVP
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* STORY-070: Agenda Modal */}
      {selectedMeeting && !showRsvpModal && !showInvitationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Agenda - {selectedMeeting.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedMeeting.meeting_date).toLocaleDateString('nl-NL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {agendaItems.length > 0 && (
                      <span className="ml-2">• Totaal: {getTotalDuration()} minuten</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={closeAgendaModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  aria-label="Sluiten"
                >
                  ✕
                </button>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                {agendaItems.length === 0 && (
                  <button
                    onClick={handleLoadTemplate}
                    disabled={isSubmittingAgenda}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50"
                  >
                    📋 Standaard Agenda Laden
                  </button>
                )}
                <button
                  onClick={() => setShowAgendaForm(!showAgendaForm)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  + Agendapunt Toevoegen
                </button>
                {/* STORY-071: Send invitation button */}
                {agendaItems.length > 0 && selectedMeeting?.status === 'gepland' && (
                  <button
                    onClick={() => openInvitationModal(selectedMeeting)}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    ✉️ Uitnodiging Versturen
                  </button>
                )}
              </div>

              {/* Add Agenda Item Form */}
              {showAgendaForm && (
                <form onSubmit={handleAddAgendaItem} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titel *
                      </label>
                      <input
                        type="text"
                        value={newAgendaItem.title}
                        onChange={(e) => setNewAgendaItem({ ...newAgendaItem, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Bijv. Jaarrekening bespreken"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duur (min)
                      </label>
                      <input
                        type="number"
                        value={newAgendaItem.duration_minutes || ''}
                        onChange={(e) => setNewAgendaItem({ ...newAgendaItem, duration_minutes: parseInt(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        min="1"
                        max="480"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Beschrijving
                      </label>
                      <textarea
                        value={newAgendaItem.description || ''}
                        onChange={(e) => setNewAgendaItem({ ...newAgendaItem, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                        placeholder="Extra toelichting..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAgendaForm(false);
                        setNewAgendaItem({ title: '', duration_minutes: 10 });
                      }}
                      className="px-3 py-1.5 text-gray-600 hover:text-gray-800"
                    >
                      Annuleren
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAgenda || !newAgendaItem.title.trim()}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Toevoegen
                    </button>
                  </div>
                </form>
              )}

              {/* Loading */}
              {isLoadingAgenda ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : agendaItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📋</p>
                  <p>Nog geen agendapunten.</p>
                  <p className="text-sm">Laad de standaard agenda of voeg handmatig punten toe.</p>
                </div>
              ) : (
                /* Agenda Items List */
                <div className="space-y-2">
                  {agendaItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      {/* Order controls */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveItem(item.id, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="Omhoog"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveItem(item.id, 'down')}
                          disabled={index === agendaItems.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="Omlaag"
                        >
                          ▼
                        </button>
                      </div>
                      
                      {/* Order number */}
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-sm">
                        {index + 1}
                      </div>
                      
                      {/* Item content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          {item.is_standard && (
                            <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">Standaard</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                        )}
                      </div>
                      
                      {/* Duration */}
                      {item.duration_minutes && (
                        <div className="text-sm text-gray-500">
                          🕐 {item.duration_minutes} min
                        </div>
                      )}
                      
                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteAgendaItem(item.id)}
                        className="text-red-400 hover:text-red-600"
                        title="Verwijderen"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Close button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeAgendaModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STORY-071: Invitation Preview Modal */}
      {showInvitationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  ✉️ Uitnodiging Versturen
                </h2>
                <button
                  onClick={closeInvitationModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  aria-label="Sluiten"
                >
                  ✕
                </button>
              </div>

              {isLoadingInvitation ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : invitationPreview ? (
                <div className="space-y-4">
                  {/* Invitation Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-700">
                        {invitationPreview.recipient_count}
                      </p>
                      <p className="text-sm text-green-600">Ontvangers</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-700">
                        {invitationPreview.agenda_summary ? invitationPreview.agenda_summary.split('\n').length : 0}
                      </p>
                      <p className="text-sm text-blue-600">Agendapunten</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-700">
                        {invitationPreview.document_count}
                      </p>
                      <p className="text-sm text-purple-600">Documenten</p>
                    </div>
                  </div>

                  {/* Email Preview */}
                  <div className="border border-gray-200 rounded-lg">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <p className="font-medium text-gray-700">
                        Onderwerp: {invitationPreview.subject}
                      </p>
                    </div>
                    <div className="p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {invitationPreview.body_preview}
                      </pre>
                    </div>
                  </div>

                  {/* Send button */}
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={closeInvitationModal}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Annuleren
                    </button>
                    <button
                      onClick={handleSendInvitation}
                      disabled={isSendingInvitation}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {isSendingInvitation ? 'Versturen...' : `✉️ Verstuur naar ${invitationPreview.recipient_count} leden`}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Geen preview beschikbaar
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STORY-072: RSVP Modal */}
      {showRsvpModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    📊 RSVP Overzicht - {selectedMeeting.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedMeeting.meeting_date).toLocaleDateString('nl-NL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={closeRsvpModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  aria-label="Sluiten"
                >
                  ✕
                </button>
              </div>

              {isLoadingRsvp ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <>
                  {/* RSVP Summary */}
                  {rsvpSummary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-700">{rsvpSummary.present_count}</p>
                        <p className="text-sm text-green-600">Aanwezig</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-red-700">{rsvpSummary.absent_count}</p>
                        <p className="text-sm text-red-600">Afwezig</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-700">{rsvpSummary.with_proxy_count}</p>
                        <p className="text-sm text-yellow-600">Met volmacht</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-gray-700">{rsvpSummary.no_response_count}</p>
                        <p className="text-sm text-gray-600">Geen reactie</p>
                      </div>
                    </div>
                  )}

                  {/* Response rate */}
                  {rsvpSummary && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Responspercentage</span>
                        <span className="font-medium">{rsvpSummary.response_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${rsvpSummary.response_rate}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* RSVP List */}
                  <div className="space-y-2">
                    {rsvpList.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Nog geen RSVP registraties ontvangen.
                      </p>
                    ) : (
                      rsvpList.map((rsvp) => (
                        <div
                          key={rsvp.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{rsvp.user_name || 'Onbekend'}</p>
                            {rsvp.proxy_holder_name && (
                              <p className="text-sm text-gray-600">
                                Volmachthouder: {rsvp.proxy_holder_name}
                              </p>
                            )}
                            {rsvp.notes && (
                              <p className="text-sm text-gray-500 italic">{rsvp.notes}</p>
                            )}
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${RSVP_STATUS_LABELS[rsvp.status]?.color}`}>
                            {RSVP_STATUS_LABELS[rsvp.status]?.icon} {RSVP_STATUS_LABELS[rsvp.status]?.label}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* Close button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeRsvpModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
