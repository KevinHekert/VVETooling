'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Besluitenregister Search Page - STORY-081
 * 
 * Als bestuurslid wil ik besluiten kunnen doorzoeken op onderwerp, 
 * datum en stemresultaat, zodat ik snel historische besluiten kan terugvinden.
 * 
 * Features:
 * - Full-text zoeken in besluiten
 * - Filter op datumbereik
 * - Filter op stemresultaat (aangenomen/verworpen)
 * - Resultaten met relevante snippets
 * - Highlight van zoekterm in resultaten
 */

type DecisionType = 'besluit' | 'actiepunt' | 'aandachtspunt';
type VoteResult = 'aangenomen' | 'verworpen' | 'aangehouden' | 'onbekend' | null;

interface DecisionSearchResult {
  id: string;
  meeting_id: string;
  meeting_title: string;
  meeting_date: string;
  decision_type: DecisionType;
  title: string;
  description: string | null;
  vote_result: VoteResult;
  vote_for: number | null;
  vote_against: number | null;
  vote_abstain: number | null;
  is_completed: boolean;
  created_at: string;
  relevance_snippet: string | null;
  match_score: number;
}

interface SearchFilters {
  query: string;
  dateFrom: string;
  dateTo: string;
  voteResult: VoteResult;
  decisionType: DecisionType | 'all';
}

const VOTE_RESULT_CONFIG = {
  aangenomen: { label: 'Aangenomen', color: 'bg-green-100 text-green-800', icon: '✓' },
  verworpen: { label: 'Verworpen', color: 'bg-red-100 text-red-800', icon: '✗' },
  aangehouden: { label: 'Aangehouden', color: 'bg-yellow-100 text-yellow-800', icon: '⏸' },
  onbekend: { label: 'Onbekend', color: 'bg-gray-100 text-gray-800', icon: '?' },
};

const DECISION_TYPE_CONFIG = {
  besluit: { label: 'Besluit', color: 'bg-blue-100 text-blue-800' },
  actiepunt: { label: 'Actiepunt', color: 'bg-purple-100 text-purple-800' },
  aandachtspunt: { label: 'Aandachtspunt', color: 'bg-orange-100 text-orange-800' },
};

// Mock data for demonstration
const MOCK_DECISIONS: DecisionSearchResult[] = [
  {
    id: 'dec-1',
    meeting_id: 'meet-1',
    meeting_title: 'ALV 2025 Voorjaar',
    meeting_date: '2025-03-15T14:00:00Z',
    decision_type: 'besluit',
    title: 'Goedkeuring begroting 2025',
    description: 'De begroting voor 2025 is met meerderheid van stemmen aangenomen. Totaalbedrag: €45.000. Verdeling conform voorstel penningmeester.',
    vote_result: 'aangenomen',
    vote_for: 15,
    vote_against: 2,
    vote_abstain: 1,
    is_completed: true,
    created_at: '2025-03-15T15:30:00Z',
    relevance_snippet: null,
    match_score: 1.0,
  },
  {
    id: 'dec-2',
    meeting_id: 'meet-1',
    meeting_title: 'ALV 2025 Voorjaar',
    meeting_date: '2025-03-15T14:00:00Z',
    decision_type: 'besluit',
    title: 'Renovatie entree',
    description: 'Het voorstel voor renovatie van de entree wordt verworpen vanwege onvoldoende budget in de reserves.',
    vote_result: 'verworpen',
    vote_for: 6,
    vote_against: 11,
    vote_abstain: 1,
    is_completed: true,
    created_at: '2025-03-15T15:45:00Z',
    relevance_snippet: null,
    match_score: 1.0,
  },
  {
    id: 'dec-3',
    meeting_id: 'meet-2',
    meeting_title: 'ALV 2024 Najaar',
    meeting_date: '2024-11-20T19:00:00Z',
    decision_type: 'besluit',
    title: 'Contributie verhoging 2025',
    description: 'De contributie wordt verhoogd met 5% per 1 januari 2025. Aangenomen met 12 stemmen voor en 5 tegen.',
    vote_result: 'aangenomen',
    vote_for: 12,
    vote_against: 5,
    vote_abstain: 0,
    is_completed: true,
    created_at: '2024-11-20T20:00:00Z',
    relevance_snippet: null,
    match_score: 1.0,
  },
  {
    id: 'dec-4',
    meeting_id: 'meet-2',
    meeting_title: 'ALV 2024 Najaar',
    meeting_date: '2024-11-20T19:00:00Z',
    decision_type: 'actiepunt',
    title: 'Offertes dakonderhoud opvragen',
    description: 'Penningmeester vraagt drie offertes op voor dakonderhoud. Deadline: 1 februari 2025.',
    vote_result: null,
    vote_for: null,
    vote_against: null,
    vote_abstain: null,
    is_completed: false,
    created_at: '2024-11-20T20:15:00Z',
    relevance_snippet: null,
    match_score: 1.0,
  },
  {
    id: 'dec-5',
    meeting_id: 'meet-3',
    meeting_title: 'ALV 2024 Voorjaar',
    meeting_date: '2024-04-10T14:00:00Z',
    decision_type: 'besluit',
    title: 'Reservefonds minimumstand',
    description: 'De minimumstand van het reservefonds wordt vastgesteld op €50.000. Unaniem aangenomen.',
    vote_result: 'aangenomen',
    vote_for: 18,
    vote_against: 0,
    vote_abstain: 0,
    is_completed: true,
    created_at: '2024-04-10T15:30:00Z',
    relevance_snippet: null,
    match_score: 1.0,
  },
  {
    id: 'dec-6',
    meeting_id: 'meet-3',
    meeting_title: 'ALV 2024 Voorjaar',
    meeting_date: '2024-04-10T14:00:00Z',
    decision_type: 'besluit',
    title: 'Laadpalen parkeergarage',
    description: 'Het voorstel voor installatie van laadpalen wordt aangehouden tot nadere informatie over subsidies beschikbaar is.',
    vote_result: 'aangehouden',
    vote_for: null,
    vote_against: null,
    vote_abstain: null,
    is_completed: false,
    created_at: '2024-04-10T16:00:00Z',
    relevance_snippet: null,
    match_score: 1.0,
  },
];

export default function BesluitenRegisterPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<DecisionSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Search filters
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateFrom: '',
    dateTo: '',
    voteResult: null,
    decisionType: 'besluit',
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      // Filter to show only "besluit" type by default
      const filtered = MOCK_DECISIONS.filter(d => d.decision_type === 'besluit');
      setResults(filtered);
      setTotalCount(filtered.length);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Handle search
  const handleSearch = async () => {
    setIsSearching(true);
    
    // Simulate API call with filtering
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...MOCK_DECISIONS];
    
    // Filter by decision type
    if (filters.decisionType !== 'all') {
      filtered = filtered.filter(d => d.decision_type === filters.decisionType);
    }
    
    // Filter by query (title and description)
    if (filters.query.trim()) {
      const queryLower = filters.query.toLowerCase();
      filtered = filtered.filter(d => 
        d.title.toLowerCase().includes(queryLower) ||
        (d.description && d.description.toLowerCase().includes(queryLower))
      );
      
      // Add relevance snippets with highlighting
      filtered = filtered.map(d => {
        if (d.description && d.description.toLowerCase().includes(queryLower)) {
          const pos = d.description.toLowerCase().indexOf(queryLower);
          const start = Math.max(0, pos - 40);
          const end = Math.min(d.description.length, pos + filters.query.length + 40);
          let snippet = d.description.substring(start, end);
          if (start > 0) snippet = '...' + snippet;
          if (end < d.description.length) snippet = snippet + '...';
          // Escape HTML entities first to prevent XSS
          snippet = snippet
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
          // Highlight the search term (escape regex special chars)
          const escapedQuery = filters.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(${escapedQuery})`, 'gi');
          snippet = snippet.replace(regex, '<mark>$1</mark>');
          return { ...d, relevance_snippet: snippet };
        }
        return d;
      });
    }
    
    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(d => 
        new Date(d.meeting_date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(d => 
        new Date(d.meeting_date) <= new Date(filters.dateTo)
      );
    }
    
    // Filter by vote result
    if (filters.voteResult) {
      filtered = filtered.filter(d => d.vote_result === filters.voteResult);
    }
    
    setResults(filtered);
    setTotalCount(filtered.length);
    setIsSearching(false);
    
    if (filters.query.trim()) {
      addToast(`${filtered.length} resultaten gevonden voor "${filters.query}"`, 'info');
    }
  };

  // Handle filter changes
  const updateFilter = (key: keyof SearchFilters, value: string | VoteResult | DecisionType | 'all') => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      query: '',
      dateFrom: '',
      dateTo: '',
      voteResult: null,
      decisionType: 'besluit',
    });
    // Reset to default view
    const filtered = MOCK_DECISIONS.filter(d => d.decision_type === 'besluit');
    setResults(filtered);
    setTotalCount(filtered.length);
  };

  // Handle export
  const handleExport = () => {
    const headers = ['Datum', 'Vergadering', 'Type', 'Onderwerp', 'Stemresultaat', 'Voor', 'Tegen', 'Onth.', 'Status'];
    const rows = results.map(d => [
      new Date(d.meeting_date).toLocaleDateString('nl-NL'),
      d.meeting_title,
      DECISION_TYPE_CONFIG[d.decision_type].label,
      d.title,
      d.vote_result ? VOTE_RESULT_CONFIG[d.vote_result].label : '-',
      d.vote_for?.toString() || '-',
      d.vote_against?.toString() || '-',
      d.vote_abstain?.toString() || '-',
      d.is_completed ? 'Afgerond' : 'Open',
    ]);
    
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';')),
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `besluitenregister_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    addToast('Besluitenregister geëxporteerd', 'success');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📜 Besluitenregister</h1>
          <p className="text-gray-600 mt-1">
            Doorzoek historische besluiten van de VVE
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          📥 Exporteren
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Zoek op onderwerp, beschrijving..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSearching ? 'Zoeken...' : 'Zoeken'}
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Wissen
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-4">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Van:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Tot:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Vote Result Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Stemresultaat:</label>
            <select
              value={filters.voteResult || ''}
              onChange={(e) => updateFilter('voteResult', (e.target.value || null) as VoteResult)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Alle</option>
              <option value="aangenomen">Aangenomen</option>
              <option value="verworpen">Verworpen</option>
              <option value="aangehouden">Aangehouden</option>
            </select>
          </div>

          {/* Decision Type Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Type:</label>
            <select
              value={filters.decisionType}
              onChange={(e) => updateFilter('decisionType', e.target.value as DecisionType | 'all')}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Alle</option>
              <option value="besluit">Besluiten</option>
              <option value="actiepunt">Actiepunten</option>
              <option value="aandachtspunt">Aandachtspunten</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {totalCount} {totalCount === 1 ? 'resultaat' : 'resultaten'} gevonden
        </p>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {results.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="text-4xl mb-2 block">📭</span>
            <p>Geen besluiten gevonden</p>
            <p className="text-sm mt-1">Pas de filters aan of probeer een andere zoekterm</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {results.map((decision) => {
              const isExpanded = expandedId === decision.id;
              const typeConfig = DECISION_TYPE_CONFIG[decision.decision_type];
              const voteConfig = decision.vote_result ? VOTE_RESULT_CONFIG[decision.vote_result] : null;

              return (
                <li key={decision.id} className="hover:bg-gray-50">
                  {/* Clickable Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : decision.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${typeConfig.color}`}>
                            {typeConfig.label}
                          </span>
                          {voteConfig && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${voteConfig.color}`}>
                              {voteConfig.icon} {voteConfig.label}
                            </span>
                          )}
                          {!decision.is_completed && decision.decision_type === 'actiepunt' && (
                            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                              Open
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 truncate">
                          {decision.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {decision.meeting_title} • {new Date(decision.meeting_date).toLocaleDateString('nl-NL')}
                        </p>
                        
                        {/* Show relevance snippet with highlighting if available */}
                        {decision.relevance_snippet && (
                          <p 
                            className="text-sm text-gray-600 mt-2 bg-yellow-50 p-2 rounded"
                            dangerouslySetInnerHTML={{ __html: decision.relevance_snippet }}
                          />
                        )}
                      </div>
                      
                      {/* Vote counts */}
                      {decision.vote_for !== null && (
                        <div className="text-right text-sm">
                          <div className="flex gap-2">
                            <span className="text-green-600">✓{decision.vote_for}</span>
                            <span className="text-red-600">✗{decision.vote_against}</span>
                            {decision.vote_abstain !== null && decision.vote_abstain > 0 && (
                              <span className="text-gray-400">○{decision.vote_abstain}</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Expand Icon */}
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50">
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Beschrijving</h4>
                        <p className="text-sm text-gray-600">
                          {decision.description || 'Geen beschrijving beschikbaar'}
                        </p>
                      </div>
                      
                      {decision.vote_for !== null && (
                        <div className="mt-3 grid grid-cols-3 gap-4">
                          <div className="text-center p-2 bg-white rounded-lg">
                            <p className="text-lg font-bold text-green-600">{decision.vote_for}</p>
                            <p className="text-xs text-gray-500">Voor</p>
                          </div>
                          <div className="text-center p-2 bg-white rounded-lg">
                            <p className="text-lg font-bold text-red-600">{decision.vote_against}</p>
                            <p className="text-xs text-gray-500">Tegen</p>
                          </div>
                          <div className="text-center p-2 bg-white rounded-lg">
                            <p className="text-lg font-bold text-gray-400">{decision.vote_abstain}</p>
                            <p className="text-xs text-gray-500">Onthouding</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <a 
                          href={`/dashboard/beheerder/alv/${decision.meeting_id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          → Bekijk vergadering
                        </a>
                        <span className="text-gray-400">
                          Vastgelegd op {new Date(decision.created_at).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-1">ℹ️ Over het besluitenregister</h3>
        <p className="text-sm text-blue-700">
          Het besluitenregister bevat alle officiële besluiten uit ALV-vergaderingen.
          Gebruik de zoekfunctie om snel historische besluiten terug te vinden.
        </p>
      </div>
    </div>
  );
}
