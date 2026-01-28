'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Cost Trend Analysis Page - STORY-094
 * 
 * Als penningmeester wil ik trends in kosten over meerdere jaren kunnen 
 * analyseren, zodat ik patronen en afwijkingen kan identificeren.
 * 
 * Features:
 * - Grafiek met kosten per categorie over tijd
 * - Periode selecteerbaar (1, 3, 5 jaar)
 * - Vergelijking met begroting
 * - Trendlijn en prognose
 */

type TimePeriod = '1' | '3' | '5';

interface DataPoint {
  date: string;
  label: string;
  value: number;
}

interface TrendData {
  category: string;
  label: string;
  currentValue: number;
  changePercentage: number;
  trendDirection: 'up' | 'down' | 'stable';
  dataPoints: DataPoint[];
  forecastNextYear: number | null;
  budgetValue: number;
}

interface KeyInsight {
  type: 'positive' | 'negative' | 'neutral';
  message: string;
}

// Mock trend data
const MOCK_TRENDS: TrendData[] = [
  {
    category: 'total_costs',
    label: 'Totale kosten',
    currentValue: 48500,
    changePercentage: -3.2,
    trendDirection: 'down',
    dataPoints: [
      { date: '2024-01', label: 'Jan', value: 4200 },
      { date: '2024-02', label: 'Feb', value: 3800 },
      { date: '2024-03', label: 'Mar', value: 4100 },
      { date: '2024-04', label: 'Apr', value: 3950 },
      { date: '2024-05', label: 'Mei', value: 4300 },
      { date: '2024-06', label: 'Jun', value: 3700 },
      { date: '2024-07', label: 'Jul', value: 4500 },
      { date: '2024-08', label: 'Aug', value: 4100 },
      { date: '2024-09', label: 'Sep', value: 3900 },
      { date: '2024-10', label: 'Okt', value: 4150 },
      { date: '2024-11', label: 'Nov', value: 3800 },
      { date: '2024-12', label: 'Dec', value: 4000 },
    ],
    forecastNextYear: 47000,
    budgetValue: 52000,
  },
  {
    category: 'onderhoud',
    label: 'Onderhoudskosten',
    currentValue: 18500,
    changePercentage: 12.5,
    trendDirection: 'up',
    dataPoints: [
      { date: '2024-01', label: 'Jan', value: 1200 },
      { date: '2024-02', label: 'Feb', value: 800 },
      { date: '2024-03', label: 'Mar', value: 2500 },
      { date: '2024-04', label: 'Apr', value: 1800 },
      { date: '2024-05', label: 'Mei', value: 1500 },
      { date: '2024-06', label: 'Jun', value: 900 },
      { date: '2024-07', label: 'Jul', value: 2200 },
      { date: '2024-08', label: 'Aug', value: 1600 },
      { date: '2024-09', label: 'Sep', value: 1400 },
      { date: '2024-10', label: 'Okt', value: 1700 },
      { date: '2024-11', label: 'Nov', value: 1100 },
      { date: '2024-12', label: 'Dec', value: 1800 },
    ],
    forecastNextYear: 20500,
    budgetValue: 16000,
  },
  {
    category: 'energie',
    label: 'Energiekosten',
    currentValue: 12300,
    changePercentage: -8.4,
    trendDirection: 'down',
    dataPoints: [
      { date: '2024-01', label: 'Jan', value: 1500 },
      { date: '2024-02', label: 'Feb', value: 1400 },
      { date: '2024-03', label: 'Mar', value: 1100 },
      { date: '2024-04', label: 'Apr', value: 900 },
      { date: '2024-05', label: 'Mei', value: 700 },
      { date: '2024-06', label: 'Jun', value: 600 },
      { date: '2024-07', label: 'Jul', value: 650 },
      { date: '2024-08', label: 'Aug', value: 700 },
      { date: '2024-09', label: 'Sep', value: 850 },
      { date: '2024-10', label: 'Okt', value: 1100 },
      { date: '2024-11', label: 'Nov', value: 1300 },
      { date: '2024-12', label: 'Dec', value: 1500 },
    ],
    forecastNextYear: 11200,
    budgetValue: 14000,
  },
  {
    category: 'verzekering',
    label: 'Verzekering',
    currentValue: 8400,
    changePercentage: 2.1,
    trendDirection: 'stable',
    dataPoints: [
      { date: '2024-01', label: 'Jan', value: 700 },
      { date: '2024-02', label: 'Feb', value: 700 },
      { date: '2024-03', label: 'Mar', value: 700 },
      { date: '2024-04', label: 'Apr', value: 700 },
      { date: '2024-05', label: 'Mei', value: 700 },
      { date: '2024-06', label: 'Jun', value: 700 },
      { date: '2024-07', label: 'Jul', value: 700 },
      { date: '2024-08', label: 'Aug', value: 700 },
      { date: '2024-09', label: 'Sep', value: 700 },
      { date: '2024-10', label: 'Okt', value: 700 },
      { date: '2024-11', label: 'Nov', value: 700 },
      { date: '2024-12', label: 'Dec', value: 700 },
    ],
    forecastNextYear: 8600,
    budgetValue: 8400,
  },
];

const MOCK_INSIGHTS: KeyInsight[] = [
  { type: 'positive', message: 'Totale kosten liggen 6.7% onder budget' },
  { type: 'negative', message: 'Onderhoudskosten zijn 15.6% hoger dan begroot' },
  { type: 'positive', message: 'Energiekosten zijn 12.1% lager dan begroot' },
  { type: 'neutral', message: 'Verzekeringskosten zijn conform begroting' },
];

const TREND_CONFIG = {
  up: { icon: '📈', color: 'text-red-600', label: 'Stijgend' },
  down: { icon: '📉', color: 'text-green-600', label: 'Dalend' },
  stable: { icon: '➡️', color: 'text-blue-600', label: 'Stabiel' },
};

export default function CostTrendAnalysisPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [insights, setInsights] = useState<KeyInsight[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1');
  const [selectedCategory, setSelectedCategory] = useState<string>('total_costs');
  const [showBudget, setShowBudget] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      setTrends(MOCK_TRENDS);
      setInsights(MOCK_INSIGHTS);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const selectedTrend = trends.find(t => t.category === selectedCategory) || trends[0];
  
  // Calculate max value for chart scaling
  const maxDataValue = selectedTrend ? Math.max(
    ...selectedTrend.dataPoints.map(d => d.value),
    showBudget ? selectedTrend.budgetValue / 12 : 0
  ) : 0;

  const handleExport = () => {
    // Generate CSV
    const headers = ['Categorie', 'Datum', 'Waarde', 'Budget'];
    const rows: string[][] = [];

    trends.forEach(trend => {
      trend.dataPoints.forEach(dp => {
        rows.push([
          trend.label,
          dp.date,
          `€${dp.value.toLocaleString('nl-NL')}`,
          `€${(trend.budgetValue / 12).toFixed(2)}`,
        ]);
      });
    });

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kosten_trend_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    addToast('Trend data geëxporteerd', 'success');
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
          <h1 className="text-2xl font-bold text-gray-900">📊 Kosten Trend Analyse</h1>
          <p className="text-gray-600 mt-1">
            Analyseer patronen en afwijkingen in kosten over tijd
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          📥 Exporteren
        </button>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-3">💡 Belangrijkste inzichten</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                insight.type === 'positive'
                  ? 'bg-green-50 border-green-200'
                  : insight.type === 'negative'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <p className={`text-sm ${
                insight.type === 'positive'
                  ? 'text-green-700'
                  : insight.type === 'negative'
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}>
                {insight.type === 'positive' ? '✓ ' : insight.type === 'negative' ? '⚠ ' : 'ℹ '}
                {insight.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Selector */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Categorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              {trends.map(trend => (
                <option key={trend.category} value={trend.category}>
                  {trend.label}
                </option>
              ))}
            </select>
          </div>

          {/* Period Selector */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Periode</label>
            <div className="flex gap-1">
              {(['1', '3', '5'] as TimePeriod[]).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period} jaar
                </button>
              ))}
            </div>
          </div>

          {/* Budget Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-gray-600">Toon budget</label>
            <input
              type="checkbox"
              checked={showBudget}
              onChange={(e) => setShowBudget(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {trends.map(trend => {
          const trendConfig = TREND_CONFIG[trend.trendDirection];
          const budgetDiff = trend.currentValue - trend.budgetValue;
          const budgetDiffPercent = (budgetDiff / trend.budgetValue) * 100;

          return (
            <button
              key={trend.category}
              onClick={() => setSelectedCategory(trend.category)}
              className={`bg-white rounded-lg shadow p-4 text-left transition-all ${
                selectedCategory === trend.category
                  ? 'ring-2 ring-blue-500'
                  : 'hover:shadow-md'
              }`}
            >
              <p className="text-sm text-gray-500">{trend.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                €{trend.currentValue.toLocaleString('nl-NL')}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-sm ${trendConfig.color}`}>
                  {trendConfig.icon} {trend.changePercentage >= 0 ? '+' : ''}{trend.changePercentage}%
                </span>
                <span className={`text-xs ${budgetDiff <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  vs budget: {budgetDiffPercent >= 0 ? '+' : ''}{budgetDiffPercent.toFixed(1)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chart */}
      {selectedTrend && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{selectedTrend.label}</h3>
              <p className="text-sm text-gray-500">
                Trend: {TREND_CONFIG[selectedTrend.trendDirection].label}
                {selectedTrend.forecastNextYear && (
                  <span className="ml-2">
                    | Prognose volgend jaar: €{selectedTrend.forecastNextYear.toLocaleString('nl-NL')}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-gray-500 text-right pr-2">
              <span>€{maxDataValue.toLocaleString('nl-NL')}</span>
              <span>€{(maxDataValue / 2).toLocaleString('nl-NL')}</span>
              <span>€0</span>
            </div>

            {/* Chart area */}
            <div className="ml-16">
              <div className="flex items-end gap-1 h-48 border-b border-l border-gray-200">
                {selectedTrend.dataPoints.map((dp, idx) => {
                  const barHeight = (dp.value / maxDataValue) * 100;
                  const budgetHeight = showBudget 
                    ? ((selectedTrend.budgetValue / 12) / maxDataValue) * 100 
                    : 0;

                  return (
                    <div 
                      key={idx} 
                      className="flex-1 relative group"
                      title={`${dp.label}: €${dp.value.toLocaleString('nl-NL')}`}
                    >
                      {/* Budget line */}
                      {showBudget && (
                        <div
                          className="absolute left-0 right-0 border-t-2 border-dashed border-orange-400"
                          style={{ bottom: `${budgetHeight}%` }}
                        />
                      )}
                      
                      {/* Value bar */}
                      <div
                        className="absolute bottom-0 left-1 right-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                        style={{ height: `${barHeight}%` }}
                      />

                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {dp.label}: €{dp.value.toLocaleString('nl-NL')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="flex gap-1 mt-2">
                {selectedTrend.dataPoints.map((dp, idx) => (
                  <div key={idx} className="flex-1 text-center text-xs text-gray-500">
                    {dp.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span className="text-sm text-gray-600">Werkelijke kosten</span>
            </div>
            {showBudget && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-0 border-t-2 border-dashed border-orange-400" style={{ width: 16 }} />
                <span className="text-sm text-gray-600">Budget (maandelijks)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Budget Comparison Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">📋 Budget vergelijking</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categorie</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Werkelijk</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Verschil</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trend</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prognose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trends.map(trend => {
                const diff = trend.currentValue - trend.budgetValue;
                const trendConfig = TREND_CONFIG[trend.trendDirection];

                return (
                  <tr key={trend.category} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{trend.label}</td>
                    <td className="px-6 py-4 text-right">
                      €{trend.currentValue.toLocaleString('nl-NL')}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      €{trend.budgetValue.toLocaleString('nl-NL')}
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${
                      diff <= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {diff >= 0 ? '+' : ''}€{diff.toLocaleString('nl-NL')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={trendConfig.color}>{trendConfig.icon}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {trend.forecastNextYear 
                        ? `€${trend.forecastNextYear.toLocaleString('nl-NL')}`
                        : '-'
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-1">ℹ️ Over de trend analyse</h3>
        <p className="text-sm text-blue-700">
          De prognose is gebaseerd op historische data en seizoenspatronen. 
          Klik op een categorie om de gedetailleerde trend te bekijken.
        </p>
      </div>
    </div>
  );
}
