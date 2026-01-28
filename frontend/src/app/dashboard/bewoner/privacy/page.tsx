'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import type { DataExportListItem, DataExportRequest, PrivacyStatement, DataExportFormat } from '@/types';

/**
 * Privacy Page for Owners - STORY-122, STORY-080
 * 
 * Allows eigenaar to:
 * - View the current privacy statement
 * - Request a data export (AVG right of access)
 * - Track export request status
 */

const EXPORT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'In afwachting', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Bezig met verwerken', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Gereed', color: 'bg-green-100 text-green-700' },
  expired: { label: 'Verlopen', color: 'bg-gray-100 text-gray-700' },
  failed: { label: 'Mislukt', color: 'bg-red-100 text-red-700' },
};

export default function BewonerPrivacyPage() {
  const [privacyStatement, setPrivacyStatement] = useState<PrivacyStatement | null>(null);
  const [exports, setExports] = useState<DataExportListItem[]>([]);
  const [selectedExport, setSelectedExport] = useState<DataExportRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [exportFormat, setExportFormat] = useState<DataExportFormat>('json');
  const [showPrivacyStatement, setShowPrivacyStatement] = useState(false);

  // TODO: Get VVE ID from context/session
  const vveId = 'demo-vve-id';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statement, exportsList] = await Promise.all([
        api.getCurrentPrivacyStatement(vveId),
        api.listDataExports(vveId),
      ]);
      setPrivacyStatement(statement);
      setExports(exportsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon gegevens niet ophalen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestExport = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      const result = await api.requestDataExport(vveId, { export_format: exportFormat });
      setSuccessMessage(result.message);
      fetchData();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon export niet aanvragen');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleViewExport = async (exportId: string) => {
    try {
      const exportData = await api.getDataExport(vveId, exportId);
      setSelectedExport(exportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon export niet ophalen');
    }
  };

  const handleCancelExport = async (exportId: string) => {
    if (!confirm('Weet u zeker dat u deze aanvraag wilt annuleren?')) return;
    try {
      await api.cancelDataExport(vveId, exportId);
      setSuccessMessage('Aanvraag geannuleerd');
      fetchData();
      if (selectedExport?.id === exportId) {
        setSelectedExport(null);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon aanvraag niet annuleren');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Privacy & Mijn Gegevens</h1>
        <p className="text-gray-600 mt-1">Bekijk het privacy statement en vraag uw gegevens op</p>
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

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Laden...</div>
      ) : (
        <div className="space-y-6">
          {/* Privacy Statement Section */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">📋 Privacy Statement</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Lees hoe wij omgaan met uw persoonsgegevens
                </p>
              </div>
              {privacyStatement && (
                <Button
                  variant="secondary"
                  onClick={() => setShowPrivacyStatement(!showPrivacyStatement)}
                >
                  {showPrivacyStatement ? 'Verbergen' : 'Bekijken'}
                </Button>
              )}
            </div>

            {privacyStatement ? (
              <>
                <div className="text-sm text-gray-600">
                  <strong>{privacyStatement.title}</strong> v{privacyStatement.version}
                  {privacyStatement.published_at && (
                    <span className="ml-2 text-gray-400">
                      Gepubliceerd: {new Date(privacyStatement.published_at).toLocaleDateString('nl-NL')}
                    </span>
                  )}
                </div>

                {showPrivacyStatement && (
                  <div className="mt-4 space-y-4 max-h-[500px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
                    {[
                      { key: 'introduction', title: 'Inleiding' },
                      { key: 'data_collected', title: 'Welke gegevens verzamelen we' },
                      { key: 'data_purpose', title: 'Doel van gegevensverwerking' },
                      { key: 'legal_basis', title: 'Rechtsgrond' },
                      { key: 'data_sharing', title: 'Met wie delen we gegevens' },
                      { key: 'retention_period', title: 'Bewaartermijnen' },
                      { key: 'rights', title: 'Uw rechten' },
                      { key: 'cookies', title: 'Cookies' },
                      { key: 'security', title: 'Beveiliging' },
                      { key: 'complaints', title: 'Klachten' },
                      { key: 'changes', title: 'Wijzigingen' },
                    ].map(({ key, title }) => (
                      privacyStatement[key as keyof PrivacyStatement] && (
                        <div key={key}>
                          <h4 className="font-medium text-gray-900">{title}</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1">
                            {privacyStatement[key as keyof PrivacyStatement] as string}
                          </p>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">Geen privacy statement beschikbaar</p>
            )}
          </div>

          {/* Data Export Section */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">📦 Mijn Gegevens Exporteren</h2>
              <p className="text-sm text-gray-500 mt-1">
                U kunt een export van al uw persoonsgegevens aanvragen (AVG recht op inzage)
              </p>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-blue-800">
                  Een export bevat al uw persoonlijke gegevens, transacties, documenten en activiteiten.
                  De export wordt binnen 24 uur gegenereerd en is 7 dagen beschikbaar voor download.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as DataExportFormat)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
                <Button onClick={handleRequestExport} isLoading={isRequesting}>
                  Export Aanvragen
                </Button>
              </div>
            </div>

            {/* Export History */}
            <h3 className="font-medium text-gray-900 mb-3">Mijn Aanvragen</h3>
            {exports.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Geen eerdere export aanvragen</p>
            ) : (
              <div className="space-y-2">
                {exports.map((exp) => (
                  <div
                    key={exp.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedExport?.id === exp.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleViewExport(exp.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${EXPORT_STATUS_LABELS[exp.status].color}`}>
                          {EXPORT_STATUS_LABELS[exp.status].label}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(exp.created_at).toLocaleString('nl-NL')}
                        </span>
                        <span className="text-sm text-gray-400 uppercase">{exp.export_format}</span>
                        {exp.file_size_bytes && (
                          <span className="text-sm text-gray-400">{formatFileSize(exp.file_size_bytes)}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {exp.is_ready && (
                          <Button size="sm" variant="ghost">
                            ⬇️ Download
                          </Button>
                        )}
                        {exp.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => { e.stopPropagation(); handleCancelExport(exp.id); }}
                          >
                            Annuleren
                          </Button>
                        )}
                      </div>
                    </div>
                    {exp.expires_at && !exp.is_expired && exp.status === 'completed' && (
                      <p className="text-xs text-gray-400 mt-1">
                        Verloopt: {new Date(exp.expires_at).toLocaleDateString('nl-NL')}
                      </p>
                    )}
                    {exp.is_expired && (
                      <p className="text-xs text-red-500 mt-1">Downloadlink verlopen</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Export Details */}
          {selectedExport && (
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-gray-900">Export Details</h3>
                <button onClick={() => setSelectedExport(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-500">Status</label>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${EXPORT_STATUS_LABELS[selectedExport.status].color}`}>
                    {EXPORT_STATUS_LABELS[selectedExport.status].label}
                  </span>
                </div>
                <div>
                  <label className="block text-gray-500">Formaat</label>
                  <p className="font-medium uppercase">{selectedExport.export_format}</p>
                </div>
                <div>
                  <label className="block text-gray-500">Aangevraagd</label>
                  <p>{new Date(selectedExport.created_at).toLocaleString('nl-NL')}</p>
                </div>
                {selectedExport.processing_completed_at && (
                  <div>
                    <label className="block text-gray-500">Voltooid</label>
                    <p>{new Date(selectedExport.processing_completed_at).toLocaleString('nl-NL')}</p>
                  </div>
                )}
                {selectedExport.file_size_bytes && (
                  <div>
                    <label className="block text-gray-500">Bestandsgrootte</label>
                    <p>{formatFileSize(selectedExport.file_size_bytes)}</p>
                  </div>
                )}
                <div>
                  <label className="block text-gray-500">Downloads</label>
                  <p>{selectedExport.download_count}x</p>
                </div>
              </div>
              {selectedExport.error_message && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">{selectedExport.error_message}</p>
                </div>
              )}
              {selectedExport.is_ready && selectedExport.download_url && (
                <div className="mt-4">
                  <Button fullWidth>
                    ⬇️ Download Export
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
