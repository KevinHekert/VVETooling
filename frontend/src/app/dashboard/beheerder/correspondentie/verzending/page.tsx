'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Multi-channel Verzending Page - STORY-047
 * 
 * Implements:
 * - Channel selection: email, PDF export, in-app notification
 * - Bulk PDF export
 * - Email preview with subject and attachments
 * - Send status overview: sent, opened, failed
 * - Retry failed sends
 */

// Types
type SendChannel = 'email' | 'pdf' | 'inapp';
type SendStatus = 'pending' | 'sent' | 'opened' | 'failed';

interface GeneratedLetter {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  content: string;
  channel: SendChannel | null;
  status: SendStatus;
  sentAt: string | null;
  error: string | null;
}

const CHANNEL_CONFIG: Record<SendChannel, { label: string; icon: string; description: string }> = {
  email: { label: 'Email', icon: '📧', description: 'Verstuur via email naar ontvanger' },
  pdf: { label: 'PDF Download', icon: '📄', description: 'Download als PDF voor post' },
  inapp: { label: 'In-app', icon: '🔔', description: 'Stuur notificatie in de app' },
};

const STATUS_CONFIG: Record<SendStatus, { label: string; color: string }> = {
  pending: { label: 'Wachtend', color: 'bg-gray-100 text-gray-700' },
  sent: { label: 'Verstuurd', color: 'bg-blue-100 text-blue-700' },
  opened: { label: 'Geopend', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Mislukt', color: 'bg-red-100 text-red-700' },
};

// Mock data for generated letters (would come from STORY-046)
const MOCK_LETTERS: GeneratedLetter[] = [
  {
    id: 'letter-1',
    recipientId: 'rec-1',
    recipientName: 'Jan Jansen',
    recipientEmail: 'jan.jansen@email.nl',
    subject: 'Welkom bij VVE Zonnepark',
    content: 'Beste Jan Jansen,\n\nWelkom als nieuwe bewoner...',
    channel: null,
    status: 'pending',
    sentAt: null,
    error: null,
  },
  {
    id: 'letter-2',
    recipientId: 'rec-2',
    recipientName: 'Maria de Vries',
    recipientEmail: 'maria.devries@email.nl',
    subject: 'Welkom bij VVE Zonnepark',
    content: 'Beste Maria de Vries,\n\nWelkom als nieuwe bewoner...',
    channel: null,
    status: 'pending',
    sentAt: null,
    error: null,
  },
  {
    id: 'letter-3',
    recipientId: 'rec-3',
    recipientName: 'Peter Bakker',
    recipientEmail: 'peter.bakker@email.nl',
    subject: 'Welkom bij VVE Zonnepark',
    content: 'Beste Peter Bakker,\n\nWelkom als nieuwe bewoner...',
    channel: 'email',
    status: 'sent',
    sentAt: '2026-01-27T14:30:00Z',
    error: null,
  },
  {
    id: 'letter-4',
    recipientId: 'rec-4',
    recipientName: 'Anna Smit',
    recipientEmail: 'anna.smit@email.nl',
    subject: 'Herinnering: Betaling VVE-bijdrage',
    content: 'Beste Anna Smit,\n\nVolgens onze administratie...',
    channel: 'email',
    status: 'failed',
    sentAt: null,
    error: 'Email adres ongeldig',
  },
];

export default function VerzendingPage() {
  const { addToast } = useToast();
  
  const [letters, setLetters] = useState<GeneratedLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLetters, setSelectedLetters] = useState<Set<string>>(new Set());
  const [selectedChannel, setSelectedChannel] = useState<SendChannel>('email');
  const [isSending, setIsSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState<SendStatus | 'all'>('all');
  
  // Email preview state
  const [previewLetter, setPreviewLetter] = useState<GeneratedLetter | null>(null);
  const [emailSubject, setEmailSubject] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      setLetters(MOCK_LETTERS);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Filter letters
  const filteredLetters = letters.filter(letter => 
    filterStatus === 'all' || letter.status === filterStatus
  );

  // Toggle selection
  const toggleSelection = (letterId: string) => {
    setSelectedLetters(prev => {
      const next = new Set(prev);
      if (next.has(letterId)) {
        next.delete(letterId);
      } else {
        next.add(letterId);
      }
      return next;
    });
  };

  // Select all pending
  const selectAllPending = () => {
    const pendingIds = letters.filter(l => l.status === 'pending').map(l => l.id);
    setSelectedLetters(new Set(pendingIds));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedLetters(new Set());
  };

  // Handle send
  const handleSend = async () => {
    if (selectedLetters.size === 0) {
      addToast('Selecteer minimaal één brief', 'error');
      return;
    }

    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate sending
    setLetters(prev => prev.map(letter => {
      if (selectedLetters.has(letter.id)) {
        // Simulate some failures for demo
        const success = Math.random() > 0.2;
        return {
          ...letter,
          channel: selectedChannel,
          status: success ? 'sent' : 'failed',
          sentAt: success ? new Date().toISOString() : null,
          error: success ? null : 'Verzending mislukt',
        };
      }
      return letter;
    }));

    const count = selectedLetters.size;
    setSelectedLetters(new Set());
    setIsSending(false);
    addToast(`${count} brief/brieven verzonden via ${CHANNEL_CONFIG[selectedChannel].label}`, 'success');
  };

  // Handle retry
  const handleRetry = async (letterId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLetters(prev => prev.map(letter => {
      if (letter.id === letterId) {
        return {
          ...letter,
          status: 'sent',
          sentAt: new Date().toISOString(),
          error: null,
        };
      }
      return letter;
    }));

    addToast('Brief opnieuw verstuurd', 'success');
  };

  // Handle PDF export
  const handlePDFExport = () => {
    if (selectedLetters.size === 0) {
      addToast('Selecteer minimaal één brief voor PDF export', 'error');
      return;
    }

    // Generate fake PDF download
    const selectedContent = letters
      .filter(l => selectedLetters.has(l.id))
      .map(l => `---\nAan: ${l.recipientName}\nOnderwerp: ${l.subject}\n\n${l.content}\n`)
      .join('\n\n');

    const blob = new Blob([selectedContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brieven_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Update status
    setLetters(prev => prev.map(letter => {
      if (selectedLetters.has(letter.id)) {
        return {
          ...letter,
          channel: 'pdf',
          status: 'sent',
          sentAt: new Date().toISOString(),
        };
      }
      return letter;
    }));

    addToast(`${selectedLetters.size} brief/brieven geëxporteerd als PDF`, 'success');
    setSelectedLetters(new Set());
  };

  // Open email preview
  const openEmailPreview = (letter: GeneratedLetter) => {
    setPreviewLetter(letter);
    setEmailSubject(letter.subject);
  };

  // Stats
  const stats = {
    total: letters.length,
    pending: letters.filter(l => l.status === 'pending').length,
    sent: letters.filter(l => l.status === 'sent').length,
    opened: letters.filter(l => l.status === 'opened').length,
    failed: letters.filter(l => l.status === 'failed').length,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verzending</h1>
          <p className="text-gray-600">Verstuur gegenereerde brieven via email, PDF of in-app</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-lg border-2 text-center transition-all ${
            filterStatus === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Totaal</p>
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`p-4 rounded-lg border-2 text-center transition-all ${
            filterStatus === 'pending' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-gray-500">{stats.pending}</p>
          <p className="text-xs text-gray-500">Wachtend</p>
        </button>
        <button
          onClick={() => setFilterStatus('sent')}
          className={`p-4 rounded-lg border-2 text-center transition-all ${
            filterStatus === 'sent' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
          <p className="text-xs text-gray-500">Verstuurd</p>
        </button>
        <button
          onClick={() => setFilterStatus('opened')}
          className={`p-4 rounded-lg border-2 text-center transition-all ${
            filterStatus === 'opened' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-green-600">{stats.opened}</p>
          <p className="text-xs text-gray-500">Geopend</p>
        </button>
        <button
          onClick={() => setFilterStatus('failed')}
          className={`p-4 rounded-lg border-2 text-center transition-all ${
            filterStatus === 'failed' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          <p className="text-xs text-gray-500">Mislukt</p>
        </button>
      </div>

      {/* Action Bar */}
      {selectedLetters.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-blue-700 font-medium">
              {selectedLetters.size} brief/brieven geselecteerd
            </p>
            <div className="flex flex-wrap gap-2">
              {/* Channel Selection */}
              <div className="flex gap-1">
                {(Object.keys(CHANNEL_CONFIG) as SendChannel[]).map(channel => (
                  <button
                    key={channel}
                    onClick={() => setSelectedChannel(channel)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      selectedChannel === channel
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    {CHANNEL_CONFIG[channel].icon} {CHANNEL_CONFIG[channel].label}
                  </button>
                ))}
              </div>
              
              {/* Send/Export Button */}
              {selectedChannel === 'pdf' ? (
                <button
                  onClick={handlePDFExport}
                  className="px-4 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Download PDF
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSending ? 'Versturen...' : 'Versturen'}
                </button>
              )}
              
              <button
                onClick={clearSelection}
                className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded text-sm hover:bg-white"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {selectedLetters.size === 0 && stats.pending > 0 && (
        <div className="flex gap-2">
          <button
            onClick={selectAllPending}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Selecteer alle wachtende ({stats.pending})
          </button>
        </div>
      )}

      {/* Letters List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredLetters.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              Geen brieven gevonden
            </p>
          ) : (
            filteredLetters.map(letter => (
              <div key={letter.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedLetters.has(letter.id)}
                    onChange={() => toggleSelection(letter.id)}
                    disabled={letter.status !== 'pending' && letter.status !== 'failed'}
                    className="mt-1 h-5 w-5 text-blue-600 rounded"
                  />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{letter.recipientName}</p>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_CONFIG[letter.status].color}`}>
                        {STATUS_CONFIG[letter.status].label}
                      </span>
                      {letter.channel && (
                        <span className="text-xs text-gray-400">
                          via {CHANNEL_CONFIG[letter.channel].icon}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{letter.subject}</p>
                    <p className="text-xs text-gray-400">{letter.recipientEmail}</p>
                    {letter.error && (
                      <p className="text-xs text-red-500 mt-1">❌ {letter.error}</p>
                    )}
                    {letter.sentAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Verstuurd: {new Date(letter.sentAt).toLocaleString('nl-NL')}
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEmailPreview(letter)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Preview
                    </button>
                    {letter.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(letter.id)}
                        className="text-sm text-orange-600 hover:text-orange-800"
                      >
                        Opnieuw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Email Preview Modal */}
      {previewLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Email Preview</h2>
              <button
                onClick={() => setPreviewLetter(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aan</label>
                <p className="text-gray-900">{previewLetter.recipientName} &lt;{previewLetter.recipientEmail}&gt;</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Onderwerp</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inhoud</label>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg whitespace-pre-wrap text-sm">
                  {previewLetter.content}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setPreviewLetter(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900">Verzendkanalen</h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-700">
          <li>📧 <strong>Email</strong>: Verstuur direct naar het email adres van de ontvanger</li>
          <li>📄 <strong>PDF</strong>: Download als document voor print en postverzending</li>
          <li>🔔 <strong>In-app</strong>: Stuur als notificatie naar gebruikers met een account</li>
        </ul>
      </div>
    </div>
  );
}
