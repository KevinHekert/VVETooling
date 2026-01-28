'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import type { PrivacyStatementListItem, PrivacyStatement, PrivacyStatementCreate, PrivacyStatementStatus, PrivacyStatementTemplate } from '@/types';

/**
 * Privacy Statement Management Page - STORY-080
 * 
 * Allows secretaris/bestuurslid to:
 * - Generate privacy statements with AVG-compliant templates
 * - Edit and customize content
 * - Publish to the eigenaren-portal
 * - Maintain version history
 */

const STATUS_LABELS: Record<PrivacyStatementStatus, { label: string; color: string }> = {
  draft: { label: 'Concept', color: 'bg-gray-100 text-gray-700' },
  published: { label: 'Gepubliceerd', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Gearchiveerd', color: 'bg-blue-100 text-blue-700' },
};

const SECTION_LABELS: Record<string, string> = {
  introduction: 'Inleiding',
  data_collected: 'Welke gegevens verzamelen we',
  data_purpose: 'Doel van gegevensverwerking',
  legal_basis: 'Rechtsgrond',
  data_sharing: 'Met wie delen we gegevens',
  retention_period: 'Bewaartermijnen',
  rights: 'Rechten van betrokkenen',
  cookies: 'Cookies en tracking',
  security: 'Beveiliging',
  complaints: 'Klachten',
  changes: 'Wijzigingen',
};

export default function PrivacyPage() {
  const [statements, setStatements] = useState<PrivacyStatementListItem[]>([]);
  const [selectedStatement, setSelectedStatement] = useState<PrivacyStatement | null>(null);
  const [template, setTemplate] = useState<PrivacyStatementTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PrivacyStatementCreate>({
    title: 'Privacy Statement',
    version: '1.0',
  });

  // TODO: Get VVE ID from context/session
  const vveId = 'demo-vve-id';

  const fetchStatements = async () => {
    setIsLoading(true);
    try {
      const [data, templateData] = await Promise.all([
        api.listPrivacyStatements(vveId),
        api.getPrivacyStatementTemplate(vveId),
      ]);
      setStatements(data);
      setTemplate(templateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon privacy statements niet ophalen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, []);

  const handleCreateNew = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create with template defaults
      const statement = await api.createPrivacyStatement(vveId, formData);
      setSuccessMessage('Privacy statement aangemaakt met standaard template!');
      setShowAddForm(false);
      setFormData({ title: 'Privacy Statement', version: '1.0' });
      fetchStatements();
      setSelectedStatement(statement);
      setIsEditing(true);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon statement niet aanmaken');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (statementId: string) => {
    if (!confirm('Weet u zeker dat u dit privacy statement wilt publiceren? Eerder gepubliceerde versies worden gearchiveerd.')) return;
    try {
      await api.publishPrivacyStatement(vveId, statementId);
      setSuccessMessage('Privacy statement gepubliceerd!');
      fetchStatements();
      if (selectedStatement?.id === statementId) {
        const updated = await api.getPrivacyStatement(vveId, statementId);
        setSelectedStatement(updated);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon statement niet publiceren');
    }
  };

  const handleArchive = async (statementId: string) => {
    if (!confirm('Weet u zeker dat u dit privacy statement wilt archiveren?')) return;
    try {
      await api.archivePrivacyStatement(vveId, statementId);
      setSuccessMessage('Privacy statement gearchiveerd!');
      fetchStatements();
      if (selectedStatement?.id === statementId) {
        const updated = await api.getPrivacyStatement(vveId, statementId);
        setSelectedStatement(updated);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon statement niet archiveren');
    }
  };

  const handleDelete = async (statementId: string) => {
    if (!confirm('Weet u zeker dat u dit concept wilt verwijderen?')) return;
    try {
      await api.deletePrivacyStatement(vveId, statementId);
      setSuccessMessage('Concept verwijderd!');
      fetchStatements();
      if (selectedStatement?.id === statementId) {
        setSelectedStatement(null);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon concept niet verwijderen');
    }
  };

  const handleViewStatement = async (statementId: string) => {
    try {
      const statement = await api.getPrivacyStatement(vveId, statementId);
      setSelectedStatement(statement);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon statement niet ophalen');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedStatement) return;
    setIsSubmitting(true);
    try {
      const updated = await api.updatePrivacyStatement(vveId, selectedStatement.id, selectedStatement);
      setSelectedStatement(updated);
      setIsEditing(false);
      setSuccessMessage('Wijzigingen opgeslagen!');
      fetchStatements();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon wijzigingen niet opslaan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSectionChange = (section: string, value: string) => {
    if (!selectedStatement) return;
    setSelectedStatement({
      ...selectedStatement,
      [section]: value,
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Privacy & AVG</h1>
          <p className="text-gray-600 mt-1">Beheer uw privacy statement conform AVG</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          + Nieuw Statement
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

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Nieuw Privacy Statement</h2>
          <p className="text-gray-600 mb-4">
            Er wordt een nieuw privacy statement aangemaakt met de standaard AVG-conforme template.
            U kunt de inhoud daarna aanpassen.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Versie</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateNew} isLoading={isSubmitting}>
              Aanmaken met Template
            </Button>
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Annuleren
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statements List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Versies</h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Laden...</div>
          ) : statements.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
              Geen privacy statements. Maak uw eerste aan!
            </div>
          ) : (
            <div className="space-y-2">
              {statements.map((statement) => (
                <div
                  key={statement.id}
                  className={`p-4 bg-white border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                    selectedStatement?.id === statement.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                  onClick={() => handleViewStatement(statement.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{statement.title}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        v{statement.version}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${STATUS_LABELS[statement.status].color}`}>
                          {STATUS_LABELS[statement.status].label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(statement.created_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statement Detail/Editor */}
        <div className="lg:col-span-2">
          {selectedStatement ? (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{selectedStatement.title} v{selectedStatement.version}</h2>
                  <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs ${STATUS_LABELS[selectedStatement.status].color}`}>
                    {STATUS_LABELS[selectedStatement.status].label}
                  </span>
                </div>
                <div className="flex gap-2">
                  {selectedStatement.status === 'draft' && !isEditing && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                        ✏️ Bewerken
                      </Button>
                      <Button size="sm" onClick={() => handlePublish(selectedStatement.id)}>
                        📢 Publiceren
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedStatement.id)}>
                        🗑️
                      </Button>
                    </>
                  )}
                  {selectedStatement.status === 'draft' && isEditing && (
                    <>
                      <Button size="sm" onClick={handleSaveEdit} isLoading={isSubmitting}>
                        💾 Opslaan
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
                        Annuleren
                      </Button>
                    </>
                  )}
                  {selectedStatement.status === 'published' && (
                    <Button size="sm" variant="secondary" onClick={() => handleArchive(selectedStatement.id)}>
                      📦 Archiveren
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4 max-h-[600px] overflow-y-auto">
                {/* VVE Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">VVE Informatie</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">VVE:</span>
                      <span className="ml-2">{selectedStatement.vve_name}</span>
                    </div>
                    {selectedStatement.vve_address && (
                      <div>
                        <span className="text-gray-500">Adres:</span>
                        <span className="ml-2">{selectedStatement.vve_address}</span>
                      </div>
                    )}
                    {selectedStatement.contact_email && (
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2">{selectedStatement.contact_email}</span>
                      </div>
                    )}
                    {selectedStatement.dpo_name && (
                      <div>
                        <span className="text-gray-500">DPO:</span>
                        <span className="ml-2">{selectedStatement.dpo_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Sections */}
                {Object.entries(SECTION_LABELS).map(([key, label]) => (
                  <div key={key} className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">{label}</h3>
                    {isEditing ? (
                      <textarea
                        value={(selectedStatement as any)[key] || ''}
                        onChange={(e) => handleSectionChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                        rows={5}
                      />
                    ) : (
                      <div className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                        {(selectedStatement as any)[key] || <em className="text-gray-400">Niet ingevuld</em>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
              <div>
                <p className="text-lg mb-2">📋</p>
                <p>Selecteer een privacy statement om te bekijken of bewerken</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
