'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';

/**
 * Sjablonenbeheer Page - STORY-045
 * 
 * Implements:
 * - Template library with search and filter
 * - WYSIWYG-style editor with merge fields
 * - Template categories (welkom, herinnering, ALV, onderhoud, leverancier)
 * - Preview with sample data
 * - CRUD operations with toast feedback
 */

// Template category configuration
type TemplateCategory = 'welkom' | 'herinnering' | 'alv' | 'onderhoud' | 'leverancier' | 'overig';

const CATEGORY_CONFIG: Record<TemplateCategory, { label: string; color: string; icon: string }> = {
  welkom: { label: 'Welkom', color: 'bg-green-100 text-green-700', icon: '👋' },
  herinnering: { label: 'Herinnering', color: 'bg-yellow-100 text-yellow-700', icon: '⏰' },
  alv: { label: 'ALV', color: 'bg-blue-100 text-blue-700', icon: '📋' },
  onderhoud: { label: 'Onderhoud', color: 'bg-purple-100 text-purple-700', icon: '🔧' },
  leverancier: { label: 'Leverancier', color: 'bg-orange-100 text-orange-700', icon: '🏢' },
  overig: { label: 'Overig', color: 'bg-gray-100 text-gray-700', icon: '📄' },
};

// Available merge fields
const MERGE_FIELDS = [
  { key: 'voornaam', label: 'Voornaam', example: 'Jan' },
  { key: 'achternaam', label: 'Achternaam', example: 'Jansen' },
  { key: 'adres', label: 'Adres', example: 'Hoofdstraat 1' },
  { key: 'postcode', label: 'Postcode', example: '1234 AB' },
  { key: 'woonplaats', label: 'Woonplaats', example: 'Amsterdam' },
  { key: 'email', label: 'Email', example: 'jan@voorbeeld.nl' },
  { key: 'appartement', label: 'Appartement', example: 'A-12' },
  { key: 'vve_naam', label: 'VVE Naam', example: 'VVE Zonnepark' },
  { key: 'datum', label: 'Datum', example: new Date().toLocaleDateString('nl-NL') },
  { key: 'bedrag', label: 'Bedrag', example: '€ 125,00' },
];

interface Template {
  id: string;
  title: string;
  category: TemplateCategory;
  content: string;
  subject?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Default templates
const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tpl-1',
    title: 'Welkomstbrief nieuwe bewoner',
    category: 'welkom',
    subject: 'Welkom bij {{vve_naam}}',
    content: `Beste {{voornaam}} {{achternaam}},

Welkom als nieuwe bewoner van {{vve_naam}}!

Wij zijn verheugd u te verwelkomen in ons appartementencomplex aan de {{adres}}.

Als lid van onze VVE heeft u toegang tot alle gemeenschappelijke voorzieningen en ontvangt u regelmatig updates over het beheer van ons gebouw.

Met vriendelijke groet,
Het bestuur van {{vve_naam}}`,
    isDefault: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'tpl-2',
    title: 'Betalingsherinnering',
    category: 'herinnering',
    subject: 'Herinnering: Betaling VVE-bijdrage',
    content: `Beste {{voornaam}} {{achternaam}},

Volgens onze administratie hebben wij nog geen betaling ontvangen voor uw VVE-bijdrage van {{bedrag}}.

Wij verzoeken u vriendelijk dit bedrag zo spoedig mogelijk over te maken naar onze rekening.

Heeft u al betaald? Dan kunt u deze herinnering als niet verzonden beschouwen.

Met vriendelijke groet,
De penningmeester van {{vve_naam}}`,
    isDefault: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'tpl-3',
    title: 'Uitnodiging ALV',
    category: 'alv',
    subject: 'Uitnodiging Algemene Ledenvergadering {{vve_naam}}',
    content: `Beste {{voornaam}} {{achternaam}},

Hierbij nodigen wij u uit voor de Algemene Ledenvergadering van {{vve_naam}}.

Datum: [DATUM INVOEGEN]
Tijd: [TIJD INVOEGEN]
Locatie: [LOCATIE INVOEGEN]

Agenda:
1. Opening
2. Vaststelling notulen vorige vergadering
3. Financieel verslag
4. Begroting komend jaar
5. Onderhoudszaken
6. Rondvraag
7. Sluiting

Wij zien u graag op de vergadering.

Met vriendelijke groet,
Het bestuur van {{vve_naam}}`,
    isDefault: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

export default function SjablonenPage() {
  const { addToast } = useToast();
  const { currentRole } = useAuth();
  const canEdit = currentRole === 'beheerder' || currentRole === 'bestuurslid';

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<TemplateCategory | 'all'>('all');
  
  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<TemplateCategory>('overig');
  const [formSubject, setFormSubject] = useState('');
  const [formContent, setFormContent] = useState('');

  useEffect(() => {
    const loadTemplates = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      setTemplates(DEFAULT_TEMPLATES);
      setIsLoading(false);
    };
    loadTemplates();
  }, []);

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle new template
  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setFormTitle('');
    setFormCategory('overig');
    setFormSubject('');
    setFormContent('');
    setIsEditing(true);
    setShowPreview(false);
  };

  // Handle edit template
  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setFormTitle(template.title);
    setFormCategory(template.category);
    setFormSubject(template.subject || '');
    setFormContent(template.content);
    setIsEditing(true);
    setShowPreview(false);
  };

  // Handle save template
  const handleSaveTemplate = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      addToast('Vul titel en inhoud in', 'error');
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    if (editingTemplate) {
      // Update existing template
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, title: formTitle, category: formCategory, subject: formSubject, content: formContent, updatedAt: new Date().toISOString() }
          : t
      ));
      addToast('Sjabloon bijgewerkt', 'success');
    } else {
      // Create new template
      const newTemplate: Template = {
        id: `tpl-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        subject: formSubject,
        content: formContent,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTemplates(prev => [newTemplate, ...prev]);
      addToast('Sjabloon aangemaakt', 'success');
    }

    setIsEditing(false);
    setEditingTemplate(null);
  };

  // Handle duplicate template
  const handleDuplicateTemplate = (template: Template) => {
    const duplicated: Template = {
      ...template,
      id: `tpl-${Date.now()}`,
      title: `${template.title} (kopie)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates(prev => [duplicated, ...prev]);
    addToast('Sjabloon gedupliceerd', 'success');
  };

  // Handle delete template
  const handleDeleteTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) {
      addToast('Standaard sjablonen kunnen niet worden verwijderd', 'error');
      return;
    }

    if (!confirm('Weet u zeker dat u dit sjabloon wilt verwijderen?')) {
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    addToast('Sjabloon verwijderd', 'success');
  };

  // Insert merge field at cursor
  const handleInsertMergeField = (field: string) => {
    const mergeTag = `{{${field}}}`;
    setFormContent(prev => prev + mergeTag);
  };

  // Replace merge fields with sample data for preview
  const getPreviewContent = (content: string): string => {
    let preview = content;
    MERGE_FIELDS.forEach(field => {
      const regex = new RegExp(`{{${field.key}}}`, 'g');
      preview = preview.replace(regex, field.example);
    });
    return preview;
  };

  // Highlight merge fields in content
  const highlightMergeFields = (content: string): JSX.Element[] => {
    const parts = content.split(/({{[^}]+}})/g);
    return parts.map((part, index) => {
      if (part.match(/{{[^}]+}}/)) {
        return (
          <span key={index} className="bg-blue-100 text-blue-700 px-1 rounded font-mono text-sm">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Editor view
  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {editingTemplate ? 'Sjabloon bewerken' : 'Nieuw sjabloon'}
          </h1>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕ Annuleren
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titel
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Bijv. Welkomstbrief nieuwe bewoner"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category and Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categorie
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as TemplateCategory)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {(Object.keys(CATEGORY_CONFIG) as TemplateCategory[]).map(cat => (
                  <option key={cat} value={cat}>
                    {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Onderwerp (voor email)
              </label>
              <input
                type="text"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                placeholder="Bijv. Welkom bij {{vve_naam}}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Merge Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoegen samenvoegveld
            </label>
            <div className="flex flex-wrap gap-2">
              {MERGE_FIELDS.map(field => (
                <button
                  key={field.key}
                  onClick={() => handleInsertMergeField(field.key)}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                  title={`Voorbeeld: ${field.example}`}
                >
                  {`{{${field.key}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Inhoud
              </label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showPreview ? 'Bewerken' : 'Voorbeeld bekijken'}
              </button>
            </div>
            {showPreview ? (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[300px] whitespace-pre-wrap">
                {getPreviewContent(formContent)}
              </div>
            ) : (
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Schrijf hier de inhoud van uw sjabloon. Gebruik {{veld}} voor samenvoegvelden."
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuleren
            </button>
            <button
              onClick={handleSaveTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingTemplate ? 'Opslaan' : 'Aanmaken'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sjablonen</h1>
          <p className="text-gray-600">Beheer herbruikbare templates voor correspondentie</p>
        </div>
        {canEdit && (
          <button
            onClick={handleNewTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Nieuw sjabloon
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Zoeken op titel of inhoud..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as TemplateCategory | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Alle categorieën</option>
          {(Object.keys(CATEGORY_CONFIG) as TemplateCategory[]).map(cat => (
            <option key={cat} value={cat}>
              {CATEGORY_CONFIG[cat].label}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Geen sjablonen gevonden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${CATEGORY_CONFIG[template.category].color}`}>
                        {CATEGORY_CONFIG[template.category].icon} {CATEGORY_CONFIG[template.category].label}
                      </span>
                      {template.isDefault && (
                        <span className="text-xs text-gray-400">Standaard</span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 truncate">{template.title}</h3>
                  </div>
                </div>
              </div>

              {/* Card Content - Preview */}
              <div className="p-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {highlightMergeFields(template.content)}
                </p>
              </div>

              {/* Card Actions */}
              {canEdit && (
                <div className="p-4 pt-0 flex gap-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1 text-sm text-blue-600 hover:text-blue-800 py-2 border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    Bewerken
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    title="Dupliceren"
                  >
                    📋
                  </button>
                  {!template.isDefault && (
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-sm text-red-600 hover:text-red-800 px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50"
                      title="Verwijderen"
                    >
                      🗑
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900">Over sjablonen</h3>
        <p className="text-sm text-blue-700 mt-1">
          Sjablonen bevatten samenvoegvelden zoals {`{{voornaam}}`} die automatisch worden ingevuld bij het genereren van brieven.
          Standaard sjablonen kunnen niet worden verwijderd maar wel gedupliceerd en aangepast.
        </p>
      </div>
    </div>
  );
}
