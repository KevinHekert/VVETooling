'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Benchmark Dashboard - STORY-093
 * 
 * Als bestuurslid wil ik kunnen zien hoe onze VVE presteert vergeleken 
 * met soortgelijke VVE's, zodat we weten waar verbeterpotentieel ligt.
 * 
 * Features:
 * - Vergelijking op: kosten per m², reservestand, onderhoudskosten
 * - Positie in percentiel (top 25%, mediaan, etc.)
 * - Filter op vergelijkbare VVE's (grootte, bouwjaar)
 * - Aanbevelingen op basis van afwijkingen
 */

type PercentileRank = 'top_10' | 'top_25' | 'mediaan' | 'onder_mediaan' | 'laagste_25';

interface BenchmarkMetric {
  category: string;
  label: string;
  vve_value: number;
  average_value: number;
  median_value: number;
  min_value: number;
  max_value: number;
  percentile: number;
  rank: PercentileRank;
  unit: string;
  comparison_count: number;
  recommendation: string | null;
}

interface BenchmarkFilters {
  sizeMin: string;
  sizeMax: string;
  buildingYearFrom: string;
  buildingYearTo: string;
}

const RANK_CONFIG = {
  top_10: { label: 'Excellent', color: 'bg-green-100 text-green-800', bgBar: 'bg-green-500', icon: '🏆' },
  top_25: { label: 'Goed', color: 'bg-blue-100 text-blue-800', bgBar: 'bg-blue-500', icon: '👍' },
  mediaan: { label: 'Gemiddeld', color: 'bg-yellow-100 text-yellow-800', bgBar: 'bg-yellow-500', icon: '➡️' },
  onder_mediaan: { label: 'Onder gemiddeld', color: 'bg-orange-100 text-orange-800', bgBar: 'bg-orange-500', icon: '⚠️' },
  laagste_25: { label: 'Verbeterpunt', color: 'bg-red-100 text-red-800', bgBar: 'bg-red-500', icon: '🔴' },
};

// Mock benchmark data
const MOCK_BENCHMARK: { metrics: BenchmarkMetric[]; overallScore: number; summary: string; comparisonCount: number } = {
  comparisonCount: 247,
  overallScore: 62,
  summary: 'Uw VVE presteert gemiddeld (score: 62/100). Sterk op: Kosten per m², Onderhoudskosten per unit. Aandachtspunten: Reservestand.',
  metrics: [
    {
      category: 'kosten_per_m2',
      label: 'Kosten per m²',
      vve_value: 45.50,
      average_value: 52.30,
      median_value: 48.00,
      min_value: 25.00,
      max_value: 120.00,
      percentile: 68,
      rank: 'top_25',
      unit: '€/m²/jaar',
      comparison_count: 247,
      recommendation: null,
    },
    {
      category: 'reservestand',
      label: 'Reservestand',
      vve_value: 72500,
      average_value: 95000,
      median_value: 85000,
      min_value: 10000,
      max_value: 500000,
      percentile: 45,
      rank: 'mediaan',
      unit: '€',
      comparison_count: 247,
      recommendation: 'Reserve is voldoende maar kan hoger. Check MJOP voor toekomstige behoeften.',
    },
    {
      category: 'onderhoudskosten',
      label: 'Onderhoudskosten per unit',
      vve_value: 1250,
      average_value: 1480,
      median_value: 1350,
      min_value: 500,
      max_value: 4500,
      percentile: 72,
      rank: 'top_25',
      unit: '€/unit/jaar',
      comparison_count: 247,
      recommendation: null,
    },
    {
      category: 'contributie',
      label: 'Gemiddelde contributie',
      vve_value: 185,
      average_value: 195,
      median_value: 175,
      min_value: 75,
      max_value: 450,
      percentile: 58,
      rank: 'mediaan',
      unit: '€/maand',
      comparison_count: 247,
      recommendation: 'Contributie is marktconform.',
    },
  ],
};

export default function BenchmarkDashboardPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [benchmark, setBenchmark] = useState(MOCK_BENCHMARK);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BenchmarkFilters>({
    sizeMin: '',
    sizeMax: '',
    buildingYearFrom: '',
    buildingYearTo: '',
  });

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setBenchmark(MOCK_BENCHMARK);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleApplyFilters = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    // In production, this would call the API with filters
    setIsLoading(false);
    setShowFilters(false);
    addToast('Filters toegepast', 'success');
  };

  const formatCurrency = (value: number, unit: string): string => {
    if (unit.includes('€/m²') || unit.includes('€/maand') || unit === '€/unit/jaar') {
      return `€${value.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`;
    }
    if (unit === '€') {
      return `€${value.toLocaleString('nl-NL')}`;
    }
    return value.toLocaleString('nl-NL');
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
          <h1 className="text-2xl font-bold text-gray-900">📊 Benchmark Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Vergelijk uw VVE met {benchmark.comparisonCount} soortgelijke VVE&apos;s
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          🔧 Filters {showFilters ? '▲' : '▼'}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Vergelijkingsgroep aanpassen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min. units</label>
              <input
                type="number"
                value={filters.sizeMin}
                onChange={(e) => setFilters(prev => ({ ...prev, sizeMin: e.target.value }))}
                placeholder="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max. units</label>
              <input
                type="number"
                value={filters.sizeMax}
                onChange={(e) => setFilters(prev => ({ ...prev, sizeMax: e.target.value }))}
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bouwjaar vanaf</label>
              <input
                type="number"
                value={filters.buildingYearFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, buildingYearFrom: e.target.value }))}
                placeholder="1980"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bouwjaar tot</label>
              <input
                type="number"
                value={filters.buildingYearTo}
                onChange={(e) => setFilters(prev => ({ ...prev, buildingYearTo: e.target.value }))}
                placeholder="2020"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Toepassen
            </button>
          </div>
        </div>
      )}

      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Totaalscore</h2>
            <p className="text-sm text-gray-500 mt-1">{benchmark.summary}</p>
          </div>
          <div className="text-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${benchmark.overallScore * 2.64} 264`}
                  className={
                    benchmark.overallScore >= 70 ? 'text-green-500' :
                    benchmark.overallScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                  }
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900">
                {benchmark.overallScore}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">van 100</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benchmark.metrics.map((metric) => {
          const rankConfig = RANK_CONFIG[metric.rank];
          const position = ((metric.vve_value - metric.min_value) / (metric.max_value - metric.min_value)) * 100;
          
          return (
            <div key={metric.category} className="bg-white rounded-lg shadow p-6">
              {/* Metric Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">{metric.label}</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(metric.vve_value, metric.unit)}
                    <span className="text-sm font-normal text-gray-500 ml-1">{metric.unit.replace('€', '').replace('/', ' / ')}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${rankConfig.color}`}>
                    {rankConfig.icon} {rankConfig.label}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Top {100 - metric.percentile}%
                  </p>
                </div>
              </div>

              {/* Position Visualization */}
              <div className="mb-4">
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                  {/* Position indicator */}
                  <div
                    className="absolute top-0 h-full w-1 bg-blue-600 z-10"
                    style={{ left: `${Math.max(0, Math.min(100, position))}%` }}
                  />
                  {/* Percentile bar */}
                  <div
                    className={`h-full ${rankConfig.bgBar} opacity-60`}
                    style={{ width: `${metric.percentile}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatCurrency(metric.min_value, metric.unit)}</span>
                  <span className="text-gray-700">
                    Gem: {formatCurrency(metric.average_value, metric.unit)}
                  </span>
                  <span>{formatCurrency(metric.max_value, metric.unit)}</span>
                </div>
              </div>

              {/* Comparison Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-sm border-t pt-3">
                <div>
                  <p className="text-gray-500">Mediaan</p>
                  <p className="font-medium">{formatCurrency(metric.median_value, metric.unit)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Gemiddelde</p>
                  <p className="font-medium">{formatCurrency(metric.average_value, metric.unit)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Vergelijken</p>
                  <p className="font-medium">{metric.comparison_count} VVE&apos;s</p>
                </div>
              </div>

              {/* Recommendation */}
              {metric.recommendation && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    💡 {metric.recommendation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Ranking legenda</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(RANK_CONFIG).map(([key, config]) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color}`}
            >
              {config.icon} {config.label}
            </span>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-1">ℹ️ Over de benchmark</h3>
        <p className="text-sm text-blue-700">
          De benchmark vergelijkt uw VVE met {benchmark.comparisonCount} soortgelijke VVE&apos;s 
          op basis van grootte en bouwjaar. Gebruik de filters om de vergelijkingsgroep aan te passen.
          Data wordt maandelijks geactualiseerd.
        </p>
      </div>
    </div>
  );
}
