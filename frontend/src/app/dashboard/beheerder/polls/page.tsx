'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import type { PollListItem, PollCreate, Poll, PollStatus, PollResultsVisibility } from '@/types';

/**
 * Polls Management Page - STORY-116
 * 
 * Allows bestuurslid to:
 * - Create informal polls for gauging support
 * - View and manage existing polls
 * - See poll results
 */

const POLL_STATUS_LABELS: Record<PollStatus, { label: string; color: string }> = {
  draft: { label: 'Concept', color: 'bg-gray-100 text-gray-700' },
  open: { label: 'Open', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Gesloten', color: 'bg-blue-100 text-blue-700' },
};

const RESULTS_VISIBILITY_LABELS: Record<PollResultsVisibility, string> = {
  all: 'Iedereen',
  board_only: 'Alleen bestuur',
  after_vote: 'Na stemmen',
};

export default function PollsPage() {
  const [polls, setPolls] = useState<PollListItem[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PollCreate>({
    title: '',
    description: '',
    options: ['', ''],
    end_date: '',
    allow_multiple: false,
    is_anonymous: false,
    results_visibility: 'all',
  });

  // TODO: Get VVE ID from context/session
  const vveId = 'demo-vve-id';

  const fetchPolls = async () => {
    setIsLoading(true);
    try {
      const data = await api.listPolls(vveId);
      setPolls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon polls niet ophalen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleAddOption = () => {
    if (formData.options.length < 10) {
      setFormData({ ...formData, options: [...formData.options, ''] });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const validOptions = formData.options.filter(o => o.trim() !== '');
      if (validOptions.length < 2) {
        throw new Error('Minimaal 2 opties vereist');
      }

      await api.createPoll(vveId, {
        ...formData,
        options: validOptions,
        end_date: new Date(formData.end_date).toISOString(),
      });

      setSuccessMessage('Poll succesvol aangemaakt!');
      setShowAddForm(false);
      setFormData({
        title: '',
        description: '',
        options: ['', ''],
        end_date: '',
        allow_multiple: false,
        is_anonymous: false,
        results_visibility: 'all',
      });
      fetchPolls();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon poll niet aanmaken');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPoll = async (pollId: string) => {
    try {
      await api.openPoll(vveId, pollId);
      setSuccessMessage('Poll geopend!');
      fetchPolls();
      if (selectedPoll?.id === pollId) {
        const updated = await api.getPoll(vveId, pollId);
        setSelectedPoll(updated);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon poll niet openen');
    }
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      await api.closePoll(vveId, pollId);
      setSuccessMessage('Poll gesloten!');
      fetchPolls();
      if (selectedPoll?.id === pollId) {
        const updated = await api.getPoll(vveId, pollId);
        setSelectedPoll(updated);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon poll niet sluiten');
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm('Weet u zeker dat u deze poll wilt verwijderen?')) return;
    try {
      await api.deletePoll(vveId, pollId);
      setSuccessMessage('Poll verwijderd!');
      fetchPolls();
      if (selectedPoll?.id === pollId) {
        setSelectedPoll(null);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon poll niet verwijderen');
    }
  };

  const handleViewPoll = async (pollId: string) => {
    try {
      const poll = await api.getPoll(vveId, pollId);
      setSelectedPoll(poll);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon poll niet ophalen');
    }
  };

  // Calculate min date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Polls & Peilingen</h1>
          <p className="text-gray-600 mt-1">Informele polls voor draagvlakmeting</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          + Nieuwe Poll
        </Button>
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

      {/* Add Poll Form */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Nieuwe Poll Aanmaken</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vraag *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Stel uw vraag..."
                required
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Optionele toelichting..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Opties (minimaal 2)</label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Optie ${index + 1}`}
                  />
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveOption(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              {formData.options.length < 10 && (
                <Button type="button" variant="secondary" size="sm" onClick={handleAddOption}>
                  + Optie toevoegen
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Einddatum *</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={minDateStr}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resultaten zichtbaar voor</label>
                <select
                  value={formData.results_visibility}
                  onChange={(e) => setFormData({ ...formData, results_visibility: e.target.value as PollResultsVisibility })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Iedereen</option>
                  <option value="board_only">Alleen bestuur</option>
                  <option value="after_vote">Na stemmen</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.allow_multiple}
                  onChange={(e) => setFormData({ ...formData, allow_multiple: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Meerdere keuzes toegestaan</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_anonymous}
                  onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Anonieme stemming</span>
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" isLoading={isSubmitting}>
                Poll Aanmaken
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                Annuleren
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Polls List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Alle Polls</h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Laden...</div>
          ) : polls.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
              Geen polls gevonden. Maak uw eerste poll aan!
            </div>
          ) : (
            <div className="space-y-3">
              {polls.map((poll) => (
                <div
                  key={poll.id}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewPoll(poll.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{poll.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${POLL_STATUS_LABELS[poll.status].color}`}>
                          {POLL_STATUS_LABELS[poll.status].label}
                        </span>
                        {poll.is_anonymous && <span title="Anoniem">🔒</span>}
                        <span>•</span>
                        <span>{poll.total_participants} deelnemers</span>
                        {poll.days_remaining !== null && poll.days_remaining !== undefined && poll.is_active && (
                          <>
                            <span>•</span>
                            <span>{poll.days_remaining} dagen resterend</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {poll.status === 'draft' && (
                        <>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleOpenPoll(poll.id); }}>
                            Openen
                          </Button>
                          <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleDeletePoll(poll.id); }}>
                            ✕
                          </Button>
                        </>
                      )}
                      {poll.status === 'open' && (
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleClosePoll(poll.id); }}>
                          Sluiten
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Poll Details */}
        <div>
          {selectedPoll ? (
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">{selectedPoll.title}</h2>
                <button onClick={() => setSelectedPoll(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              {selectedPoll.description && (
                <p className="text-gray-600 mb-4">{selectedPoll.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${POLL_STATUS_LABELS[selectedPoll.status].color}`}>
                    {POLL_STATUS_LABELS[selectedPoll.status].label}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Einddatum:</span>
                  <span className="ml-2">{new Date(selectedPoll.end_date).toLocaleDateString('nl-NL')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Deelnemers:</span>
                  <span className="ml-2 font-medium">{selectedPoll.total_participants}</span>
                </div>
                <div>
                  <span className="text-gray-500">Resultaten:</span>
                  <span className="ml-2">{RESULTS_VISIBILITY_LABELS[selectedPoll.results_visibility]}</span>
                </div>
              </div>

              <h3 className="font-medium text-gray-900 mb-3">Resultaten</h3>
              <div className="space-y-3">
                {selectedPoll.options.map((option) => (
                  <div key={option.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{option.text}</span>
                      <span className="font-medium">{option.vote_count} ({option.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {selectedPoll.created_by_name && (
                <p className="mt-4 text-xs text-gray-400">
                  Aangemaakt door {selectedPoll.created_by_name} op {new Date(selectedPoll.created_at).toLocaleDateString('nl-NL')}
                </p>
              )}
            </div>
          ) : (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
              Selecteer een poll om de details te bekijken
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
