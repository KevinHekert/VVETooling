'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Kennisbank (Knowledge Base) Page - STORY-107
 * 
 * Als bestuurslid wil ik kennisbank artikelen kunnen zoeken op onderwerp, 
 * zodat ik snel relevante informatie vind.
 * 
 * Features:
 * - Full-text zoeken in artikelen
 * - Filter op categorie
 * - Zoekresultaten met snippets
 * - Recent bekeken artikelen
 */

interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  readTime: number; // in minutes
  lastUpdated: string;
  viewCount: number;
}

const CATEGORIES = [
  { id: 'all', label: 'Alle categorieën', icon: '📚' },
  { id: 'financieel', label: 'Financieel', icon: '💰' },
  { id: 'juridisch', label: 'Juridisch', icon: '⚖️' },
  { id: 'onderhoud', label: 'Onderhoud', icon: '🔧' },
  { id: 'alv', label: 'Vergaderingen', icon: '📋' },
  { id: 'bestuur', label: 'Bestuur', icon: '👥' },
  { id: 'eigenaar', label: 'Eigenaren', icon: '🏠' },
];

// Mock articles
const MOCK_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'art-1',
    title: 'Hoe stel ik een begroting op voor de VVE?',
    summary: 'Stapsgewijze handleiding voor het opstellen van een VVE begroting, inclusief tips voor het inschatten van kosten.',
    content: 'Een goede begroting is essentieel voor het financieel gezond houden van uw VVE...',
    category: 'financieel',
    tags: ['begroting', 'financiën', 'planning'],
    readTime: 8,
    lastUpdated: '2025-12-15T10:00:00Z',
    viewCount: 234,
  },
  {
    id: 'art-2',
    title: 'Reservefonds: minimale stand en opbouw',
    summary: 'Leer hoeveel u minimaal in het reservefonds moet hebben en hoe u dit opbouwt.',
    content: 'Het reservefonds is bedoeld voor groot onderhoud en onvoorziene uitgaven...',
    category: 'financieel',
    tags: ['reservefonds', 'mjop', 'onderhoud'],
    readTime: 6,
    lastUpdated: '2025-11-20T14:00:00Z',
    viewCount: 189,
  },
  {
    id: 'art-3',
    title: 'Splitsingsakte: wat staat erin en waarom is het belangrijk?',
    summary: 'Uitleg over de splitsingsakte, de juridische basis van elke VVE.',
    content: 'De splitsingsakte is het document waarmee een gebouw juridisch wordt gesplitst...',
    category: 'juridisch',
    tags: ['splitsingsakte', 'wetgeving', 'rechten'],
    readTime: 10,
    lastUpdated: '2025-10-05T09:00:00Z',
    viewCount: 312,
  },
  {
    id: 'art-4',
    title: 'ALV organiseren: checklist en deadlines',
    summary: 'Volledige checklist voor het organiseren van een Algemene Ledenvergadering.',
    content: 'Een ALV moet minstens 8 dagen van tevoren worden aangekondigd...',
    category: 'alv',
    tags: ['alv', 'vergadering', 'checklist'],
    readTime: 5,
    lastUpdated: '2025-12-01T16:00:00Z',
    viewCount: 456,
  },
  {
    id: 'art-5',
    title: 'Stemmen bij volmacht: regels en procedure',
    summary: 'Hoe werkt stemmen bij volmacht in de VVE en welke regels gelden er?',
    content: 'Een eigenaar kan een ander machtigen om namens hem of haar te stemmen...',
    category: 'alv',
    tags: ['stemmen', 'volmacht', 'reglement'],
    readTime: 4,
    lastUpdated: '2025-11-10T11:00:00Z',
    viewCount: 287,
  },
  {
    id: 'art-6',
    title: 'Onderhoudsplanning (MJOP) opstellen',
    summary: 'Hoe maak je een Meerjarenonderhoudsplan voor uw VVE?',
    content: 'Een MJOP geeft inzicht in het te verwachten onderhoud en de kosten daarvan...',
    category: 'onderhoud',
    tags: ['mjop', 'onderhoud', 'planning'],
    readTime: 12,
    lastUpdated: '2025-09-25T13:00:00Z',
    viewCount: 198,
  },
  {
    id: 'art-7',
    title: 'Rol van het bestuur in de VVE',
    summary: 'Taken, verantwoordelijkheden en aansprakelijkheid van VVE bestuurders.',
    content: 'Het bestuur voert het dagelijks beheer uit en vertegenwoordigt de VVE...',
    category: 'bestuur',
    tags: ['bestuur', 'taken', 'aansprakelijkheid'],
    readTime: 7,
    lastUpdated: '2025-10-18T10:00:00Z',
    viewCount: 167,
  },
  {
    id: 'art-8',
    title: 'Rechten en plichten van appartementseigenaren',
    summary: 'Wat zijn uw rechten en plichten als eigenaar in een VVE?',
    content: 'Als appartementseigenaar bent u automatisch lid van de VVE...',
    category: 'eigenaar',
    tags: ['eigenaar', 'rechten', 'plichten'],
    readTime: 6,
    lastUpdated: '2025-11-28T15:00:00Z',
    viewCount: 245,
  },
  {
    id: 'art-9',
    title: 'Hoe omgaan met wanbetaling van VVE-bijdrage?',
    summary: 'Stappenplan voor het aanpakken van eigenaren die niet betalen.',
    content: 'Bij wanbetaling is het belangrijk om snel te handelen maar ook procedures te volgen...',
    category: 'financieel',
    tags: ['wanbetaling', 'incasso', 'bijdrage'],
    readTime: 8,
    lastUpdated: '2025-12-10T09:00:00Z',
    viewCount: 178,
  },
  {
    id: 'art-10',
    title: 'Verbouwingen in het appartement: wat mag wel en niet?',
    summary: 'Regels rondom verbouwen in een VVE-complex.',
    content: 'Voor verbouwingen aan gemeenschappelijke delen is altijd toestemming nodig...',
    category: 'eigenaar',
    tags: ['verbouwen', 'toestemming', 'regels'],
    readTime: 5,
    lastUpdated: '2025-10-30T14:00:00Z',
    viewCount: 356,
  },
];

export default function KennisbankPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      setArticles(MOCK_ARTICLES);
      // Load recently viewed from localStorage (mock)
      setRecentlyViewed(['art-1', 'art-4']);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Get popular articles
  const popularArticles = [...articles]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 3);

  // Get recently viewed articles
  const recentArticles = articles.filter(a => recentlyViewed.includes(a.id));

  const handleArticleClick = (articleId: string) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
    // Track view
    if (!recentlyViewed.includes(articleId)) {
      setRecentlyViewed(prev => [articleId, ...prev.slice(0, 4)]);
    }
  };

  const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text;
    // Escape HTML entities first to prevent XSS
    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    // Escape regex special characters in query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapedText.replace(regex, '<mark>$1</mark>');
  };

  const getCategoryConfig = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">📚 Kennisbank</h1>
        <p className="text-gray-600 mt-2">
          Vind antwoorden op veelgestelde VVE-vragen
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek artikelen op onderwerp, trefwoord..."
            className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.icon} {category.label}
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Recently Viewed */}
          {recentArticles.length > 0 && !searchQuery && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">🕐 Recent bekeken</h3>
              <ul className="space-y-2">
                {recentArticles.map((article) => (
                  <li key={article.id}>
                    <button
                      onClick={() => handleArticleClick(article.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 text-left"
                    >
                      {article.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Popular Articles */}
          {!searchQuery && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">🔥 Populair</h3>
              <ul className="space-y-2">
                {popularArticles.map((article) => (
                  <li key={article.id}>
                    <button
                      onClick={() => handleArticleClick(article.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 text-left"
                    >
                      {article.title}
                      <span className="text-gray-400 text-xs ml-1">({article.viewCount}x)</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Article List */}
        <div className="lg:col-span-3">
          {/* Results count */}
          <p className="text-sm text-gray-500 mb-4">
            {filteredArticles.length} artikel{filteredArticles.length !== 1 ? 'en' : ''} gevonden
            {searchQuery && ` voor "${searchQuery}"`}
            {selectedCategory !== 'all' && ` in ${getCategoryConfig(selectedCategory).label}`}
          </p>

          {/* Articles */}
          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <span className="text-4xl mb-4 block">🔍</span>
              <p className="text-gray-600">Geen artikelen gevonden</p>
              <p className="text-sm text-gray-500 mt-1">
                Probeer een andere zoekterm of categorie
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
              >
                Filters wissen
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => {
                const category = getCategoryConfig(article.category);
                const isExpanded = expandedArticle === article.id;

                return (
                  <div key={article.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <button
                      onClick={() => handleArticleClick(article.id)}
                      className="w-full p-4 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {category.icon} {category.label}
                            </span>
                            <span className="text-xs text-gray-400">
                              ⏱ {article.readTime} min leestijd
                            </span>
                          </div>
                          <h3 
                            className="text-lg font-medium text-gray-900"
                            dangerouslySetInnerHTML={{ 
                              __html: searchQuery ? highlightText(article.title, searchQuery) : article.title 
                            }}
                          />
                          <p 
                            className="text-gray-600 mt-1 text-sm"
                            dangerouslySetInnerHTML={{ 
                              __html: searchQuery ? highlightText(article.summary, searchQuery) : article.summary 
                            }}
                          />
                          <div className="flex flex-wrap gap-1 mt-2">
                            {article.tags.map((tag) => (
                              <span 
                                key={tag}
                                className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); setSearchQuery(tag); }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ml-4 ${isExpanded ? 'rotate-180' : ''}`}
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
                      <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                        <div className="prose prose-sm max-w-none mt-4">
                          <p className="text-gray-700">{article.content}</p>
                          <p className="text-gray-500 text-xs mt-4">
                            Laatst bijgewerkt: {new Date(article.lastUpdated).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                          <button 
                            onClick={() => addToast('Artikel gedeeld', 'success')}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            🔗 Delen
                          </button>
                          <button 
                            onClick={() => addToast('Artikel opgeslagen', 'success')}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            ⭐ Opslaan
                          </button>
                          <button 
                            onClick={() => addToast('PDF wordt gegenereerd...', 'info')}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            📄 PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Help Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-1">💬 Vraag niet gevonden?</h3>
        <p className="text-sm text-blue-700">
          Neem contact op met het bestuur of stel uw vraag in het community forum. 
          We updaten de kennisbank regelmatig met nieuwe artikelen.
        </p>
      </div>
    </div>
  );
}
