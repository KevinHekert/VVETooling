'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { ContractListItem, ContractCreate, ContractType, CostsPeriod } from '@/types';

/**
 * Contracten Overzicht - STORY-055
 * 
 * Displays all contracts for the VVE with:
 * - Overview with filtering by type and status
 * - Add new contract form
 * - Contract details and costs
 */

const CONTRACT_TYPE_LABELS: Record<ContractType, { label: string; icon: string }> = {
  energie: { label: 'Energie', icon: '⚡' },
  verzekering: { label: 'Verzekering', icon: '🛡️' },
  onderhoud: { label: 'Onderhoud', icon: '🔧' },
  overig: { label: 'Overig', icon: '📋' },
};

const COSTS_PERIOD_LABELS: Record<CostsPeriod, string> = {
  monthly: 'per maand',
  yearly: 'per jaar',
  one_time: 'eenmalig',
};

export default function ContractenPage() {
  const { currentVveId } = useAuth();
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Document upload state (STORY-056)
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // Filter and search state (STORY-057)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState<ContractCreate>({
    supplier_name: '',
    contract_type: 'onderhoud',
    start_date: new Date().toISOString().split('T')[0],
  });

  const fetchContracts = async () => {
    if (!currentVveId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const params: { search?: string; contract_type?: ContractType; is_active?: boolean } = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (typeFilter !== 'all') params.contract_type = typeFilter as ContractType;
      if (activeFilter !== 'all') params.is_active = activeFilter === 'active';

      const data = await api.getContracts(currentVveId, params);
      setContracts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon contracten niet ophalen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [searchQuery, typeFilter, activeFilter, currentVveId]);

  // Debounced search handler (STORY-057)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Quick filter chips (STORY-057)
  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setActiveFilter('all');
  };

  const hasActiveFilters = searchQuery || typeFilter !== 'all' || activeFilter !== 'all';

  // Document upload handlers (STORY-056)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size <= 10 * 1024 * 1024) { // 10MB limit
        setDocumentFile(file);
      } else {
        setError('Bestand is te groot. Maximaal 10MB toegestaan.');
      }
    } else {
      setError('Alleen PDF bestanden zijn toegestaan.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        if (file.size <= 10 * 1024 * 1024) { // 10MB limit
          setDocumentFile(file);
        } else {
          setError('Bestand is te groot. Maximaal 10MB toegestaan.');
        }
      } else {
        setError('Alleen PDF bestanden zijn toegestaan.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);

    try {
      if (!currentVveId) return;
      // Create contract first
      const contract = await api.createContract(currentVveId, {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
      });
      
      setUploadProgress(50);

      // Upload document if provided (STORY-056)
      if (documentFile) {
        await api.uploadContractDocument(currentVveId, contract.id, documentFile);
        setUploadProgress(100);
      }
      
      setSuccessMessage(documentFile 
        ? 'Contract en document succesvol toegevoegd!' 
        : 'Contract succesvol toegevoegd!');
      setShowAddForm(false);
      setFormData({
        supplier_name: '',
        contract_type: 'onderhoud',
        start_date: new Date().toISOString().split('T')[0],
      });
      setDocumentFile(null);
      setUploadProgress(0);
      fetchContracts();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon contract niet toevoegen');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats for quick overview
  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.is_active).length,
    expiringSoon: contracts.filter(c => c.is_expiring_soon).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracten</h1>
          <p className="text-gray-600">Beheer alle VVE contracten en leveranciers</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Annuleren' : '+ Nieuw Contract'}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Add Contract Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nieuw Contract Toevoegen</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supplier Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leverancier *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={255}
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Naam leverancier"
                />
              </div>

              {/* Contract Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  required
                  value={formData.contract_type}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as ContractType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="energie">⚡ Energie</option>
                  <option value="verzekering">🛡️ Verzekering</option>
                  <option value="onderhoud">🔧 Onderhoud</option>
                  <option value="overig">📋 Overig</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingangsdatum *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Einddatum
                </label>
                <input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Notice Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opzegtermijn (dagen)
                </label>
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={formData.notice_period_days || ''}
                  onChange={(e) => setFormData({ ...formData, notice_period_days: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="bijv. 30"
                />
              </div>

              {/* Alert Days (STORY-058) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert vooraf (dagen)
                </label>
                <select
                  value={formData.alert_days_before ?? 30}
                  onChange={(e) => setFormData({ ...formData, alert_days_before: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={30}>30 dagen</option>
                  <option value={60}>60 dagen</option>
                  <option value={90}>90 dagen</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hoeveel dagen voor de opzegtermijn wilt u een alert ontvangen?
                </p>
              </div>

              {/* Costs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kosten (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={formData.costs || ''}
                  onChange={(e) => setFormData({ ...formData, costs: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Costs Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kosten Periode
                </label>
                <select
                  value={formData.costs_period || ''}
                  onChange={(e) => setFormData({ ...formData, costs_period: e.target.value as CostsPeriod || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecteer...</option>
                  <option value="monthly">Per maand</option>
                  <option value="yearly">Per jaar</option>
                  <option value="one_time">Eenmalig</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Omschrijving
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value || undefined })}
                rows={3}
                maxLength={2000}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Aanvullende informatie over het contract..."
              />
            </div>

            {/* Document Upload (STORY-056) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Document (PDF, max 10MB)
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : documentFile 
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                {documentFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{documentFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocumentFile(null)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-gray-600">
                      Sleep een PDF bestand hierheen of{' '}
                      <label className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                        blader
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Alleen PDF, maximaal 10MB
                    </p>
                  </>
                )}
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Uploaden... {uploadProgress}%</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setDocumentFile(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Opslaan...' : 'Contract Opslaan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Totaal</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm font-medium text-green-700">Actief</p>
          <p className="text-2xl font-bold text-green-900">{stats.active}</p>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <p className="text-sm font-medium text-orange-700">Verloopt binnenkort</p>
          <p className="text-2xl font-bold text-orange-900">{stats.expiringSoon}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          {/* Type filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Alle types</option>
              <option value="energie">⚡ Energie</option>
              <option value="verzekering">🛡️ Verzekering</option>
              <option value="onderhoud">🔧 Onderhoud</option>
              <option value="overig">📋 Overig</option>
            </select>
          </div>

          {/* Active filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Alle</option>
              <option value="active">Actief</option>
              <option value="inactive">Inactief</option>
            </select>
          </div>
        </div>

        {/* Search bar (STORY-057) */}
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Zoek op leverancier of omschrijving..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Active filter chips (STORY-057) */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Actieve filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Zoeken: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">✕</button>
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Type: {typeFilter}
                <button onClick={() => setTypeFilter('all')} className="hover:text-purple-900">✕</button>
              </span>
            )}
            {activeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Status: {activeFilter === 'active' ? 'Actief' : 'Inactief'}
                <button onClick={() => setActiveFilter('all')} className="hover:text-green-900">✕</button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Wis alle filters
            </button>
          </div>
        )}
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
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Geen contracten gevonden
          </h3>
          <p className="text-gray-600">
            {hasActiveFilters 
              ? 'Geen contracten gevonden met de huidige filters. Pas de filters aan of wis ze.'
              : 'Er zijn nog geen contracten geregistreerd. Voeg een nieuw contract toe om te beginnen.'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 underline"
            >
              Wis alle filters
            </button>
          )}
        </div>
      ) : (
        /* Contracts Table */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Looptijd
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kosten
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {CONTRACT_TYPE_LABELS[contract.contract_type]?.icon || '📋'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {contract.supplier_name}
                        </p>
                        {contract.notice_period_days && (
                          <p className="text-sm text-gray-500">
                            Opzegtermijn: {contract.notice_period_days} dagen
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {CONTRACT_TYPE_LABELS[contract.contract_type]?.label || contract.contract_type}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900">
                        {new Date(contract.start_date).toLocaleDateString('nl-NL')}
                      </p>
                      {contract.end_date && (
                        <p className="text-gray-500">
                          t/m {new Date(contract.end_date).toLocaleDateString('nl-NL')}
                        </p>
                      )}
                      {contract.days_until_end !== null && contract.days_until_end !== undefined && (
                        <p className={`text-xs ${contract.is_expiring_soon ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                          Nog {contract.days_until_end} dagen
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {contract.costs ? (
                      <span className="text-gray-900">
                        €{contract.costs.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                        {contract.costs_period && (
                          <span className="text-gray-500"> {COSTS_PERIOD_LABELS[contract.costs_period]}</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${contract.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                        }
                      `}
                    >
                      {contract.is_active ? 'Actief' : 'Inactief'}
                    </span>
                    {contract.is_expiring_soon && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                        ⚠️ Verloopt
                      </span>
                    )}
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
