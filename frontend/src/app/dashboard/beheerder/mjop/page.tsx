'use client';

import { useEffect, useState } from 'react';
import type {
  MaintenanceElement,
  MaintenanceElementCreate,
  MaintenanceElementCategory,
  MaintenancePriority,
  MJOPImportPreviewResponse,
  MJOPImportResponse,
  MJOPTimelineResponse,
  ReserveCalculationResponse,
} from '@/types';

/**
 * MJOP Overzicht - EPIC-014: MJOP & Onderhoudsplanning
 * 
 * Features:
 * - STORY-062: MJOP importeren vanuit Excel
 * - STORY-063: Onderhoudselement handmatig toevoegen
 * - STORY-064: MJOP timeline visualisatie
 * - STORY-065: Reserveberekening automatisch
 */

const CATEGORY_LABELS: Record<MaintenanceElementCategory, { label: string; icon: string }> = {
  roof: { label: 'Dak', icon: '🏠' },
  facade: { label: 'Gevel', icon: '🧱' },
  foundation: { label: 'Fundering', icon: '🏗️' },
  windows: { label: 'Ramen', icon: '🪟' },
  doors: { label: 'Deuren', icon: '🚪' },
  elevator: { label: 'Lift', icon: '🛗' },
  heating: { label: 'Verwarming', icon: '🔥' },
  plumbing: { label: 'Leidingwerk', icon: '🔧' },
  electrical: { label: 'Elektra', icon: '⚡' },
  common_areas: { label: 'Gemeenschappelijk', icon: '🏢' },
  garden: { label: 'Tuin', icon: '🌳' },
  parking: { label: 'Parkeren', icon: '🅿️' },
  other: { label: 'Overig', icon: '📦' },
};

const PRIORITY_LABELS: Record<MaintenancePriority, { label: string; color: string }> = {
  low: { label: 'Laag', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Gemiddeld', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Hoog', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

// Mock data for demo (replace with API calls)
const MOCK_ELEMENTS: MaintenanceElement[] = [
  {
    id: '1',
    vve_id: 'demo-vve-id',
    name: 'Dakbedekking',
    description: 'Bitumen dakbedekking plat dak',
    category: 'roof',
    location: 'Hoofdgebouw',
    quantity: 1,
    unit: 'm²',
    installation_year: 2010,
    expected_lifespan_years: 25,
    last_maintenance_year: 2020,
    next_maintenance_year: 2030,
    estimated_cost: 15000,
    priority: 'high',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    vve_id: 'demo-vve-id',
    name: 'Lift',
    description: 'Personenlift 6 personen',
    category: 'elevator',
    location: 'Trappenhuis',
    quantity: 1,
    installation_year: 2005,
    expected_lifespan_years: 30,
    next_maintenance_year: 2028,
    estimated_cost: 8500,
    priority: 'medium',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '3',
    vve_id: 'demo-vve-id',
    name: 'CV-ketel',
    description: 'Collectieve verwarmingsinstallatie',
    category: 'heating',
    location: 'Technische ruimte',
    quantity: 1,
    installation_year: 2018,
    next_maintenance_year: 2026,
    estimated_cost: 5000,
    priority: 'medium',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
];

export default function MJOPPage() {
  const [elements, setElements] = useState<MaintenanceElement[]>(MOCK_ELEMENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'import' | 'timeline' | 'reserves'>('overview');
  
  // Add element form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MaintenanceElementCreate>({
    name: '',
    category: 'other',
    priority: 'medium',
    quantity: 1,
  });
  
  // Import state (STORY-062)
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<MJOPImportPreviewResponse | null>(null);
  const [importResult, setImportResult] = useState<MJOPImportResponse | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  
  // Timeline state (STORY-064)
  const [timelineData, setTimelineData] = useState<MJOPTimelineResponse | null>(null);
  const [timelineStartYear, setTimelineStartYear] = useState(2024);
  const [timelineEndYear, setTimelineEndYear] = useState(2034);
  
  // Reserve calculation state (STORY-065)
  const [reserveCalculation, setReserveCalculation] = useState<ReserveCalculationResponse | null>(null);
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Filtered elements
  const filteredElements = elements.filter(element => {
    if (categoryFilter !== 'all' && element.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && element.priority !== priorityFilter) return false;
    return true;
  });

  // Statistics
  const stats = {
    total: elements.length,
    urgent: elements.filter(e => e.priority === 'urgent' || e.priority === 'high').length,
    upcomingMaintenance: elements.filter(e => 
      e.next_maintenance_year && e.next_maintenance_year <= 2028
    ).length,
    totalCosts: elements.reduce((sum, e) => sum + (e.estimated_cost || 0), 0),
  };

  // Handle file upload for import preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.xlsx')) {
        setImportFile(file);
        setError(null);
        // In real implementation, call API to get preview
        setImportPreview({
          filename: file.name,
          total_rows: 15,
          valid_rows: 12,
          invalid_rows: 3,
          preview_rows: [
            { row_number: 2, data: { naam: 'Dakbedekking', categorie: 'dak', kosten: '15000' }, errors: [], is_valid: true },
            { row_number: 3, data: { naam: 'Lift', categorie: 'lift', kosten: '8500' }, errors: [], is_valid: true },
            { row_number: 4, data: { naam: '', categorie: 'onbekend', kosten: '5000' }, errors: ['Naam ontbreekt', 'Onbekende categorie'], is_valid: false },
          ],
          detected_columns: ['naam', 'categorie', 'locatie', 'kosten', 'jaar'],
          suggested_mapping: { name: 'A', category: 'B', location: 'C', estimated_cost: 'D', next_maintenance_year: 'E' },
        });
        setColumnMapping({ name: 'A', category: 'B', location: 'C', estimated_cost: 'D', next_maintenance_year: 'E' });
      } else {
        setError('Alleen .xlsx bestanden zijn toegestaan');
      }
    }
  };

  // Handle import confirmation
  const handleConfirmImport = async () => {
    if (!importFile) return;
    
    setIsImporting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setImportResult({
        batch_id: 'batch-123',
        filename: importFile.name,
        total_rows: 15,
        imported_rows: 12,
        failed_rows: 3,
        errors: [{ row: 4, errors: ['Naam ontbreekt'] }],
      });
      
      setSuccessMessage(`${12} elementen succesvol geïmporteerd!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      setError('Fout bij importeren');
    } finally {
      setIsImporting(false);
    }
  };

  // Handle add element
  const handleAddElement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In real implementation, call API
      const newElement: MaintenanceElement = {
        id: String(Date.now()),
        vve_id: 'demo-vve-id',
        ...formData,
        quantity: formData.quantity || 1,
        priority: formData.priority || 'medium',
        category: formData.category || 'other',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setElements([...elements, newElement]);
      setSuccessMessage('Element succesvol toegevoegd!');
      setShowAddForm(false);
      setFormData({ name: '', category: 'other', priority: 'medium', quantity: 1 });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError('Fout bij toevoegen element');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate reserves
  const handleCalculateReserves = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const byYear: Record<number, number> = {};
      const byCategory: Record<string, number> = {};
      
      elements.forEach(e => {
        if (e.next_maintenance_year && e.estimated_cost) {
          byYear[e.next_maintenance_year] = (byYear[e.next_maintenance_year] || 0) + e.estimated_cost;
          byCategory[e.category] = (byCategory[e.category] || 0) + e.estimated_cost;
        }
      });
      
      const totalRequired = Object.values(byYear).reduce((sum, cost) => sum + cost, 0);
      
      setReserveCalculation({
        vve_id: 'demo-vve-id',
        years_ahead: 10,
        total_required: totalRequired * 1.1, // 10% contingency
        annual_contribution: (totalRequired * 1.1) / 10,
        by_year: byYear,
        by_category: byCategory,
        contingency_amount: totalRequired * 0.1,
      });
    } catch {
      setError('Fout bij berekenen reserves');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MJOP - Meerjaren Onderhoudsplan</h1>
          <p className="text-gray-600">Beheer en plan onderhoud voor uw VVE</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nieuw Element
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Totaal Elementen</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <p className="text-sm font-medium text-orange-700">Hoge Prioriteit</p>
          <p className="text-2xl font-bold text-orange-900">{stats.urgent}</p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-sm font-medium text-blue-700">Onderhoud {'<'} 5 jaar</p>
          <p className="text-2xl font-bold text-blue-900">{stats.upcomingMaintenance}</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm font-medium text-green-700">Geschatte Kosten</p>
          <p className="text-2xl font-bold text-green-900">
            €{stats.totalCosts.toLocaleString('nl-NL')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overzicht', icon: '📋' },
            { id: 'import', label: 'Importeren', icon: '📥' },
            { id: 'timeline', label: 'Timeline', icon: '📅' },
            { id: 'reserves', label: 'Reserves', icon: '💰' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Add Element Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nieuw Onderhoudselement Toevoegen</h2>
          <form onSubmit={handleAddElement} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="bijv. Dakbedekking"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categorie *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as MaintenanceElementCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, { label, icon }]) => (
                    <option key={key} value={key}>{icon} {label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locatie</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="bijv. Hoofdgebouw"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioriteit</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenancePriority })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(PRIORITY_LABELS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volgend onderhoud (jaar)</label>
                <input
                  type="number"
                  min={2024}
                  max={2100}
                  value={formData.next_maintenance_year || ''}
                  onChange={(e) => setFormData({ ...formData, next_maintenance_year: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2030"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Geschatte kosten (€)</label>
                <input
                  type="number"
                  min={0}
                  step="100"
                  value={formData.estimated_cost || ''}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="15000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Aanvullende informatie over dit onderhoudselement..."
              />
            </div>
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
                {isSubmitting ? 'Opslaan...' : 'Element Toevoegen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Alle categorieën</option>
                {Object.entries(CATEGORY_LABELS).map(([key, { label, icon }]) => (
                  <option key={key} value={key}>{icon} {label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioriteit</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Alle prioriteiten</option>
                {Object.entries(PRIORITY_LABELS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Elements Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Element</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volgend Onderhoud</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kosten</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioriteit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredElements.map((element) => (
                  <tr key={element.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{element.name}</p>
                        {element.location && (
                          <p className="text-sm text-gray-500">{element.location}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1">
                        {CATEGORY_LABELS[element.category]?.icon}
                        {CATEGORY_LABELS[element.category]?.label || element.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {element.next_maintenance_year ? (
                        <span className={element.next_maintenance_year <= 2026 ? 'text-orange-600 font-medium' : ''}>
                          {element.next_maintenance_year}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {element.estimated_cost ? (
                        `€${element.estimated_cost.toLocaleString('nl-NL')}`
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_LABELS[element.priority]?.color || ''}`}>
                        {PRIORITY_LABELS[element.priority]?.label || element.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredElements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Geen elementen gevonden met de huidige filters
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📥 MJOP Importeren vanuit Excel
          </h2>
          <p className="text-gray-600 mb-6">
            Upload een Excel bestand (.xlsx) met uw MJOP data. De kolommen worden automatisch gedetecteerd.
          </p>

          {!importPreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📁</div>
              <p className="text-gray-600 mb-4">
                Sleep een Excel bestand hierheen of{' '}
                <label className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                  blader
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-sm text-gray-400">Alleen .xlsx bestanden</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Preview: {importPreview.filename}</h3>
                <div className="flex gap-6 text-sm">
                  <span className="text-blue-700">
                    ✓ {importPreview.valid_rows} geldige rijen
                  </span>
                  {importPreview.invalid_rows > 0 && (
                    <span className="text-orange-600">
                      ⚠️ {importPreview.invalid_rows} ongeldige rijen
                    </span>
                  )}
                </div>
              </div>

              {/* Column Mapping */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Kolom Mapping</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(columnMapping).map(([field, column]) => (
                    <div key={field} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-32">{field}:</span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        Kolom {column}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Table */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Preview (eerste 3 rijen)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rij</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Data</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {importPreview.preview_rows.map((row) => (
                        <tr key={row.row_number} className={row.is_valid ? '' : 'bg-red-50'}>
                          <td className="px-4 py-2">{row.row_number}</td>
                          <td className="px-4 py-2 font-mono text-xs">
                            {JSON.stringify(row.data)}
                          </td>
                          <td className="px-4 py-2">
                            {row.is_valid ? (
                              <span className="text-green-600">✓ Geldig</span>
                            ) : (
                              <span className="text-red-600">✗ {row.errors.join(', ')}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Result */}
              {importResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Import Voltooid</h3>
                  <p className="text-green-700">
                    {importResult.imported_rows} van {importResult.total_rows} elementen geïmporteerd.
                    {importResult.failed_rows > 0 && ` ${importResult.failed_rows} rijen overgeslagen.`}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setImportFile(null);
                    setImportPreview(null);
                    setImportResult(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isImporting ? 'Importeren...' : 'Bevestig Import'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📅 MJOP Timeline Visualisatie
          </h2>
          
          {/* Timeline Legend */}
          <div className="flex flex-wrap gap-4 mb-6">
            {Object.entries(CATEGORY_LABELS).slice(0, 6).map(([key, { label, icon }]) => (
              <span key={key} className="text-sm text-gray-600">
                {icon} {label}
              </span>
            ))}
          </div>

          {/* Timeline Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Years Header */}
              <div className="flex border-b border-gray-200 pb-2 mb-4">
                <div className="w-48 shrink-0 text-sm font-medium text-gray-500">Element</div>
                {Array.from({ length: 11 }, (_, i) => 2024 + i).map(year => (
                  <div key={year} className="flex-1 text-center text-sm font-medium text-gray-500">
                    {year}
                  </div>
                ))}
              </div>

              {/* Element Rows */}
              {elements.map(element => (
                <div key={element.id} className="flex items-center border-b border-gray-100 py-2">
                  <div className="w-48 shrink-0 text-sm">
                    {CATEGORY_LABELS[element.category]?.icon} {element.name}
                  </div>
                  {Array.from({ length: 11 }, (_, i) => 2024 + i).map(year => (
                    <div key={year} className="flex-1 flex justify-center">
                      {element.next_maintenance_year === year && (
                        <div 
                          className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs
                            ${element.priority === 'urgent' || element.priority === 'high'
                              ? 'bg-orange-500 text-white'
                              : 'bg-blue-500 text-white'
                            }
                          `}
                          title={`€${element.estimated_cost?.toLocaleString('nl-NL') || '?'}`}
                        >
                          ●
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reserves' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            💰 Reserveberekening
          </h2>
          <p className="text-gray-600 mb-6">
            Bereken de benodigde reserves op basis van uw MJOP elementen.
          </p>

          <button
            onClick={handleCalculateReserves}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
          >
            {isLoading ? 'Berekenen...' : '🔢 Bereken Reserves'}
          </button>

          {reserveCalculation && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                  <p className="text-sm font-medium text-green-700">Totaal Benodigd (10 jaar)</p>
                  <p className="text-2xl font-bold text-green-900">
                    €{reserveCalculation.total_required.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                  <p className="text-sm font-medium text-blue-700">Jaarlijkse Contributie</p>
                  <p className="text-2xl font-bold text-blue-900">
                    €{reserveCalculation.annual_contribution.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                  <p className="text-sm font-medium text-orange-700">Onvoorzien (10%)</p>
                  <p className="text-2xl font-bold text-orange-900">
                    €{(reserveCalculation.contingency_amount || 0).toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              {/* By Year */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Kosten per Jaar</h3>
                <div className="space-y-2">
                  {Object.entries(reserveCalculation.by_year)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([year, cost]) => (
                      <div key={year} className="flex items-center gap-4">
                        <span className="w-16 text-sm font-medium">{year}</span>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${(cost / Math.max(...Object.values(reserveCalculation.by_year))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="w-24 text-sm text-right">
                          €{cost.toLocaleString('nl-NL')}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* By Category */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Kosten per Categorie</h3>
                <div className="space-y-2">
                  {Object.entries(reserveCalculation.by_category).map(([category, cost]) => (
                    <div key={category} className="flex items-center gap-4">
                      <span className="w-32 text-sm">
                        {CATEGORY_LABELS[category as MaintenanceElementCategory]?.icon}{' '}
                        {CATEGORY_LABELS[category as MaintenanceElementCategory]?.label || category}
                      </span>
                      <span className="text-sm font-medium">
                        €{cost.toLocaleString('nl-NL')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
