'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { MeetingListItem, MeetingCreate, MeetingType, MeetingStatus } from '@/types';

/**
 * ALV (Algemene Ledenvergadering) Management - STORY-069
 * 
 * Allows beheerder/secretaris to:
 * - Plan new ALV meetings with date, time, type and location
 * - View list of upcoming and past meetings
 * - Update meeting status
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
