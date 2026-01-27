'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import type { 
  SplitsingsakteVersionListItem,
  SplitsingsakteVersion,
  SplitsingsakteVersionStatus,
  SplitsingsakteVersionCreate,
  SplitsingsakteAmendment,
  SplitsingsakteAmendmentType
} from '@/types';

/**
 * Splitsingsakte Versies Overzicht - STORY-041, STORY-032, STORY-042
 * 
 * STORY-041: Shows all splitsingsakte versions with:
 * - Status badges (draft/active/archived)
 * - Effective date
 * - Actions to activate/archive versions
 * - Create new version form
 * 
 * STORY-032: Adds amendments/aanvullingen functionality:
 * - View amendments per version
 * - Add new amendments with date and description
 * - Link amendments to documents
 * - Bewoners see only active version with amendment summary
 * 
 * STORY-042: Enhanced amendment logging:
 * - Amendment type categorization (wijziging, toevoeging, correctie, verduidelijking)
 * - Accordion/list view for amendments
 * - Inline validation and toasts
 */

// STORY-042: Amendment type labels
const AMENDMENT_TYPE_LABELS: Record<SplitsingsakteAmendmentType, { label: string; color: string }> = {
  wijziging: { label: 'Wijziging', color: 'bg-blue-100 text-blue-700' },
  toevoeging: { label: 'Toevoeging', color: 'bg-green-100 text-green-700' },
  correctie: { label: 'Correctie', color: 'bg-red-100 text-red-700' },
  verduidelijking: { label: 'Verduidelijking', color: 'bg-purple-100 text-purple-700' },
};

const STATUS_LABELS: Record<SplitsingsakteVersionStatus, { label: string; color: string }> = {
  draft: { label: 'Concept', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Actief', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Archief', color: 'bg-orange-100 text-orange-700' },
};

export default function SplitsingsakteVersionsPage() {
  const { addToast } = useToast();
  const [versions, setVersions] = useState<SplitsingsakteVersionListItem[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<SplitsingsakteVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [newVersionEffectiveDate, setNewVersionEffectiveDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Include archived toggle
  const [includeArchived, setIncludeArchived] = useState(false);
  
  // STORY-032, STORY-042: Amendments state
  const [amendments, setAmendments] = useState<SplitsingsakteAmendment[]>([]);
  const [showAmendmentForm, setShowAmendmentForm] = useState(false);
  const [newAmendmentTitle, setNewAmendmentTitle] = useState('');
  const [newAmendmentDescription, setNewAmendmentDescription] = useState('');
  const [newAmendmentDate, setNewAmendmentDate] = useState('');
  const [newAmendmentType, setNewAmendmentType] = useState<SplitsingsakteAmendmentType>('wijziging');
  const [isAddingAmendment, setIsAddingAmendment] = useState(false);

  // TODO: Get VVE ID from context/session
  const vveId = 'demo-vve-id';

  const fetchVersions = useCallback(async () => {
    try {
      const data = await api.getSplitsingsakteVersions(vveId, includeArchived);
      setVersions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon versies niet ophalen');
    } finally {
      setIsLoading(false);
    }
  }, [includeArchived]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleViewDetails = async (versionId: string) => {
    try {
      const version = await api.getSplitsingsakteVersion(vveId, versionId);
      setSelectedVersion(version);
      // STORY-032: Load amendments for this version
      await loadAmendments(versionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon versie details niet ophalen');
    }
  };

  // STORY-032, STORY-042: Load amendments for a version
  const loadAmendments = async (versionId: string) => {
    // Mock data for demo - in production, this would be an API call
    const mockAmendments: SplitsingsakteAmendment[] = [
      {
        id: 'amend-1',
        version_id: versionId,
        title: 'Wijziging artikel 5 - Gemeenschappelijke ruimtes',
        description: 'Toegevoegd: gebruik van gemeenschappelijke tuin wordt gereguleerd door huishoudelijk reglement.',
        amendment_type: 'toevoeging',
        effective_date: '2025-06-15',
        document_id: 'doc-123',
        document_name: 'Aanvulling_2025_06.pdf',
        created_by_id: 'user-1',
        created_by_name: 'Jan Jansen',
        created_at: '2025-06-10T10:00:00Z',
      },
      {
        id: 'amend-2',
        version_id: versionId,
        title: 'Wijziging breukdelen appartementen 4B en 4C',
        description: 'Na samenvoeging appartementen aangepaste breukdelen conform notariële akte d.d. 10-03-2025.',
        amendment_type: 'wijziging',
        effective_date: '2025-03-15',
        created_by_id: 'user-1',
        created_by_name: 'Jan Jansen',
        created_at: '2025-03-10T14:30:00Z',
      },
      {
        id: 'amend-3',
        version_id: versionId,
        title: 'Correctie kostenverdeelsleutel bijlage 2',
        description: 'Typefout gecorrigeerd in percentages parkeerplaatsen.',
        amendment_type: 'correctie',
        effective_date: '2025-01-20',
        created_by_id: 'user-2',
        created_by_name: 'Maria de Vries',
        created_at: '2025-01-18T09:15:00Z',
      },
    ];
    setAmendments(mockAmendments);
  };

  // STORY-032, STORY-042: Add new amendment
  const handleAddAmendment = async () => {
    if (!selectedVersion || !newAmendmentTitle.trim() || !newAmendmentDescription.trim() || !newAmendmentDate) {
      addToast('Vul alle verplichte velden in', 'error');
      return;
    }

    setIsAddingAmendment(true);
    try {
      // Mock API call - in production this would save to backend
      const newAmendment: SplitsingsakteAmendment = {
        id: `amend-${Date.now()}`,
        version_id: selectedVersion.id,
        title: newAmendmentTitle,
        description: newAmendmentDescription,
        amendment_type: newAmendmentType,
        effective_date: newAmendmentDate,
        created_by_id: 'current-user',
        created_by_name: 'Huidige Gebruiker',
        created_at: new Date().toISOString(),
      };

      setAmendments(prev => [newAmendment, ...prev]);
      
      // Reset form
      setNewAmendmentTitle('');
      setNewAmendmentDescription('');
      setNewAmendmentDate('');
      setNewAmendmentType('wijziging');
      setShowAmendmentForm(false);
      
      addToast('Aanvulling toegevoegd', 'success');
    } catch {
      addToast('Kon aanvulling niet toevoegen', 'error');
    } finally {
      setIsAddingAmendment(false);
    }
  };

  const handleActivate = async (versionId: string) => {
    setError(null);
    try {
      await api.activateSplitsingsakteVersion(vveId, versionId);
      await fetchVersions();
      setSuccessMessage('Versie succesvol geactiveerd');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon versie niet activeren');
    }
  };

  const handleArchive = async (versionId: string) => {
    setError(null);
    try {
      await api.archiveSplitsingsakteVersion(vveId, versionId);
      await fetchVersions();
      setSuccessMessage('Versie succesvol gearchiveerd');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon versie niet archiveren');
    }
  };

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionName.trim()) return;

    setIsCreating(true);
    setError(null);
    
    try {
      const createData: SplitsingsakteVersionCreate = {
        name: newVersionName,
        description: newVersionDescription || undefined,
        effective_date: newVersionEffectiveDate || undefined,
      };
      
      await api.createSplitsingsakteVersion(vveId, createData);
      await fetchVersions();
      
      // Reset form
      setNewVersionName('');
      setNewVersionDescription('');
      setNewVersionEffectiveDate('');
      setShowCreateForm(false);
      
      setSuccessMessage('Versie succesvol aangemaakt');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon versie niet aanmaken');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Splitsingsakte Versies</h1>
          <p className="text-gray-600 mt-1">
            Beheer de versies van de splitsingsakte
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Nieuwe Versie
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Nieuwe Versie Aanmaken</h2>
          <form onSubmit={handleCreateVersion}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam *
                </label>
                <input
                  type="text"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  placeholder="Bijv. Splitsingsakte 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingangsdatum
                </label>
                <input
                  type="date"
                  value={newVersionEffectiveDate}
                  onChange={(e) => setNewVersionEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschrijving
              </label>
              <textarea
                value={newVersionDescription}
                onChange={(e) => setNewVersionDescription(e.target.value)}
                placeholder="Optionele toelichting..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={isCreating || !newVersionName.trim()}
                className={`
                  px-4 py-2 rounded-lg font-medium
                  ${isCreating || !newVersionName.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                {isCreating ? 'Aanmaken...' : 'Versie Aanmaken'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-gray-700">Toon gearchiveerde versies</span>
        </label>
      </div>

      {/* Versions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {versions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Geen splitsingsakte versies gevonden.</p>
            <p className="mt-2 text-sm">Klik op &quot;Nieuwe Versie&quot; om te beginnen.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Versie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingangsdatum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aangemaakt
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {versions.map((version) => (
                <tr key={version.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {version.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          v{version.version_number}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${STATUS_LABELS[version.status].color}
                      `}
                    >
                      {STATUS_LABELS[version.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {version.effective_date 
                      ? new Date(version.effective_date).toLocaleDateString('nl-NL')
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(version.created_at).toLocaleDateString('nl-NL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(version.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Details
                      </button>
                      {version.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleActivate(version.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Activeren
                          </button>
                          <button
                            onClick={() => handleArchive(version.id)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Archiveren
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Panel */}
      {selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedVersion.name}</h2>
                  <p className="text-sm text-gray-500">Versie {selectedVersion.version_number}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedVersion(null);
                    setAmendments([]);
                    setShowAmendmentForm(false);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span
                    className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${STATUS_LABELS[selectedVersion.status].color}
                    `}
                  >
                    {STATUS_LABELS[selectedVersion.status].label}
                  </span>
                </div>

                {selectedVersion.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Beschrijving:</span>
                    <p className="text-sm text-gray-600 mt-1">{selectedVersion.description}</p>
                  </div>
                )}

                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Ingangsdatum</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedVersion.effective_date 
                        ? new Date(selectedVersion.effective_date).toLocaleDateString('nl-NL')
                        : '-'
                      }
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Aangemaakt door</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedVersion.created_by_name || 'Onbekend'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Aangemaakt op</dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(selectedVersion.created_at).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </dd>
                  </div>
                  {selectedVersion.activated_at && (
                    <div>
                      <dt className="text-gray-500">Geactiveerd op</dt>
                      <dd className="font-medium text-gray-900">
                        {new Date(selectedVersion.activated_at).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                        {selectedVersion.activated_by_name && ` door ${selectedVersion.activated_by_name}`}
                      </dd>
                    </div>
                  )}
                  {selectedVersion.document_name && (
                    <div className="col-span-2">
                      <dt className="text-gray-500">Gekoppeld document</dt>
                      <dd className="font-medium text-gray-900">
                        📄 {selectedVersion.document_name}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* STORY-032: Amendments Section */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Aanvullingen
                    {amendments.length > 0 && (
                      <span className="ml-2 text-sm text-gray-400">({amendments.length})</span>
                    )}
                  </h3>
                  {selectedVersion.status === 'active' && (
                    <button
                      onClick={() => setShowAmendmentForm(!showAmendmentForm)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Aanvulling toevoegen
                    </button>
                  )}
                </div>

                {/* Add Amendment Form */}
                {showAmendmentForm && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Titel *
                          </label>
                          <input
                            type="text"
                            value={newAmendmentTitle}
                            onChange={(e) => setNewAmendmentTitle(e.target.value)}
                            placeholder="Bijv. Wijziging artikel 5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type *
                          </label>
                          <select
                            value={newAmendmentType}
                            onChange={(e) => setNewAmendmentType(e.target.value as SplitsingsakteAmendmentType)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="wijziging">Wijziging</option>
                            <option value="toevoeging">Toevoeging</option>
                            <option value="correctie">Correctie</option>
                            <option value="verduidelijking">Verduidelijking</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ingangsdatum *
                        </label>
                        <input
                          type="date"
                          value={newAmendmentDate}
                          onChange={(e) => setNewAmendmentDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Beschrijving *
                        </label>
                        <textarea
                          value={newAmendmentDescription}
                          onChange={(e) => setNewAmendmentDescription(e.target.value)}
                          placeholder="Omschrijf de wijziging..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowAmendmentForm(false)}
                          className="px-3 py-1.5 text-sm text-gray-600"
                        >
                          Annuleren
                        </button>
                        <button
                          onClick={handleAddAmendment}
                          disabled={isAddingAmendment}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isAddingAmendment ? 'Toevoegen...' : 'Toevoegen'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amendments List */}
                {amendments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Geen aanvullingen geregistreerd
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {amendments.map((amendment) => (
                      <li key={amendment.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                AMENDMENT_TYPE_LABELS[amendment.amendment_type]?.color || 'bg-gray-100 text-gray-700'
                              }`}>
                                {AMENDMENT_TYPE_LABELS[amendment.amendment_type]?.label || amendment.amendment_type}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900">{amendment.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{amendment.description}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>
                                📅 {new Date(amendment.effective_date).toLocaleDateString('nl-NL')}
                              </span>
                              {amendment.created_by_name && (
                                <span>Door {amendment.created_by_name}</span>
                              )}
                              {amendment.document_name && (
                                <span className="text-blue-600">📎 {amendment.document_name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedVersion(null);
                    setAmendments([]);
                    setShowAmendmentForm(false);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Sluiten
                </button>
                {selectedVersion.status === 'draft' && (
                  <button
                    onClick={() => {
                      handleActivate(selectedVersion.id);
                      setSelectedVersion(null);
                      setAmendments([]);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Publiceren voor bewoners
                  </button>
                )}
                {/* STORY-043: Show download button for active versions */}
                {selectedVersion.status === 'active' && selectedVersion.document_name && (
                  <button
                    onClick={() => {
                      addToast('Document wordt gedownload', 'info');
                      // In production, this would trigger a real download
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <DownloadIcon />
                    Download PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// STORY-043: Download icon component
function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
