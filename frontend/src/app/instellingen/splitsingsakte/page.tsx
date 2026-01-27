'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { 
  SplitsingsakteVersionListItem,
  SplitsingsakteVersion,
  SplitsingsakteVersionStatus,
  SplitsingsakteVersionCreate
} from '@/types';

/**
 * Splitsingsakte Versies Overzicht - STORY-041
 * 
 * Shows all splitsingsakte versions with:
 * - Status badges (draft/active/archived)
 * - Effective date
 * - Actions to activate/archive versions
 * - Create new version form
 */

const STATUS_LABELS: Record<SplitsingsakteVersionStatus, { label: string; color: string }> = {
  draft: { label: 'Concept', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Actief', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Archief', color: 'bg-orange-100 text-orange-700' },
};

export default function SplitsingsakteVersionsPage() {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon versie details niet ophalen');
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
                  onClick={() => setSelectedVersion(null)}
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

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setSelectedVersion(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Sluiten
                </button>
                {selectedVersion.status === 'draft' && (
                  <button
                    onClick={() => {
                      handleActivate(selectedVersion.id);
                      setSelectedVersion(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Activeren
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
