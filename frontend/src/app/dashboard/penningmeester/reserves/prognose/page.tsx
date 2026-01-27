'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Reservefonds Prognose Dashboard - STORY-026, STORY-033
 * 
 * STORY-026: Scenario planning (basis, optimistisch, conservatief)
 * STORY-033: Prognose dashboard met trend indicators
 * 
 * Implements:
 * - Scenario selection (basis/optimistisch/conservatief)
 * - Prognose cards per reserve with trend indicators
 * - Impact visualization when switching scenarios
 * - Export ready prognose data
 * - Mobile-first design
 */

type Scenario = 'basis' | 'optimistisch' | 'conservatief';

interface ReservePrognose {
  id: string;
  name: string;
  current_balance: number;
  target_amount: number;
  prognose: {
    basis: YearlyPrognose[];
    optimistisch: YearlyPrognose[];
    conservatief: YearlyPrognose[];
  };
  trend: 'growing' | 'stable' | 'declining';
  target_year: number;
}

interface YearlyPrognose {
  year: number;
  projected_balance: number;
  annual_contribution: number;
  planned_expenses: number;
}

// STORY-039: Scenario parameters for configuration
interface ScenarioParams {
  contributionMultiplier: number;  // 1.0 = 100%
  expenseMultiplier: number;       // 1.0 = 100%
  years: number;                   // projection period
}

// Scenario configuration
const SCENARIO_CONFIG: Record<Scenario, { label: string; description: string; color: string; badgeColor: string; defaultParams: ScenarioParams }> = {
  basis: {
    label: 'Basis',
    description: 'Standaard groei o.b.v. huidige contributies',
    color: 'bg-blue-500',
    badgeColor: 'bg-blue-100 text-blue-700',
    defaultParams: { contributionMultiplier: 1.0, expenseMultiplier: 1.0, years: 3 },
  },
  optimistisch: {
    label: 'Optimistisch',
    description: '+10% contributies, geen onvoorziene kosten',
    color: 'bg-green-500',
    badgeColor: 'bg-green-100 text-green-700',
    defaultParams: { contributionMultiplier: 1.1, expenseMultiplier: 0.9, years: 3 },
  },
  conservatief: {
    label: 'Conservatief',
    description: 'Hogere uitgaven, lagere groei',
    color: 'bg-orange-500',
    badgeColor: 'bg-orange-100 text-orange-700',
    defaultParams: { contributionMultiplier: 0.95, expenseMultiplier: 1.15, years: 3 },
  },
};

const TREND_CONFIG = {
  growing: { icon: '📈', label: 'Groeiend', color: 'text-green-600' },
  stable: { icon: '➡️', label: 'Stabiel', color: 'text-blue-600' },
  declining: { icon: '📉', label: 'Dalend', color: 'text-red-600' },
};

// Mock prognose data
const MOCK_PROGNOSES: ReservePrognose[] = [
  {
    id: 'res-1',
    name: 'Groot Onderhoud',
    current_balance: 32500,
    target_amount: 50000,
    target_year: 2028,
    trend: 'growing',
    prognose: {
      basis: [
        { year: 2026, projected_balance: 38500, annual_contribution: 6000, planned_expenses: 0 },
        { year: 2027, projected_balance: 44500, annual_contribution: 6000, planned_expenses: 0 },
        { year: 2028, projected_balance: 50500, annual_contribution: 6000, planned_expenses: 0 },
      ],
      optimistisch: [
        { year: 2026, projected_balance: 39600, annual_contribution: 7100, planned_expenses: 0 },
        { year: 2027, projected_balance: 46700, annual_contribution: 7100, planned_expenses: 0 },
        { year: 2028, projected_balance: 53800, annual_contribution: 7100, planned_expenses: 0 },
      ],
      conservatief: [
        { year: 2026, projected_balance: 36500, annual_contribution: 5000, planned_expenses: 1000 },
        { year: 2027, projected_balance: 40500, annual_contribution: 5000, planned_expenses: 1000 },
        { year: 2028, projected_balance: 44500, annual_contribution: 5000, planned_expenses: 1000 },
      ],
    },
  },
  {
    id: 'res-2',
    name: 'Lift Vervanging',
    current_balance: 18750,
    target_amount: 25000,
    target_year: 2027,
    trend: 'growing',
    prognose: {
      basis: [
        { year: 2026, projected_balance: 22000, annual_contribution: 3250, planned_expenses: 0 },
        { year: 2027, projected_balance: 25250, annual_contribution: 3250, planned_expenses: 0 },
        { year: 2028, projected_balance: 3250, annual_contribution: 3250, planned_expenses: 25000 },
      ],
      optimistisch: [
        { year: 2026, projected_balance: 22500, annual_contribution: 3750, planned_expenses: 0 },
        { year: 2027, projected_balance: 26250, annual_contribution: 3750, planned_expenses: 0 },
        { year: 2028, projected_balance: 5000, annual_contribution: 3750, planned_expenses: 25000 },
      ],
      conservatief: [
        { year: 2026, projected_balance: 21000, annual_contribution: 2500, planned_expenses: 250 },
        { year: 2027, projected_balance: 23250, annual_contribution: 2500, planned_expenses: 250 },
        { year: 2028, projected_balance: 500, annual_contribution: 2500, planned_expenses: 25250 },
      ],
    },
  },
  {
    id: 'res-3',
    name: 'Dakbedekking',
    current_balance: 8500,
    target_amount: 15000,
    target_year: 2029,
    trend: 'stable',
    prognose: {
      basis: [
        { year: 2026, projected_balance: 10700, annual_contribution: 2200, planned_expenses: 0 },
        { year: 2027, projected_balance: 12900, annual_contribution: 2200, planned_expenses: 0 },
        { year: 2028, projected_balance: 15100, annual_contribution: 2200, planned_expenses: 0 },
      ],
      optimistisch: [
        { year: 2026, projected_balance: 11000, annual_contribution: 2500, planned_expenses: 0 },
        { year: 2027, projected_balance: 13500, annual_contribution: 2500, planned_expenses: 0 },
        { year: 2028, projected_balance: 16000, annual_contribution: 2500, planned_expenses: 0 },
      ],
      conservatief: [
        { year: 2026, projected_balance: 10000, annual_contribution: 1800, planned_expenses: 300 },
        { year: 2027, projected_balance: 11500, annual_contribution: 1800, planned_expenses: 300 },
        { year: 2028, projected_balance: 13000, annual_contribution: 1800, planned_expenses: 300 },
      ],
    },
  },
];

export default function ReservePrognosePage() {
  const { addToast } = useToast();
  const [prognoses, setPrognoses] = useState<ReservePrognose[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>('basis');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedReserve, setExpandedReserve] = useState<string | null>(null);
  
  // STORY-039: Scenario parameter configuration
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [scenarioParams, setScenarioParams] = useState<Record<Scenario, ScenarioParams>>({
    basis: SCENARIO_CONFIG.basis.defaultParams,
    optimistisch: SCENARIO_CONFIG.optimistisch.defaultParams,
    conservatief: SCENARIO_CONFIG.conservatief.defaultParams,
  });

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      setPrognoses(MOCK_PROGNOSES);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleScenarioChange = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    addToast(`Scenario gewijzigd naar ${SCENARIO_CONFIG[scenario].label}`, 'info');
  };

  const handleExport = () => {
    // Generate CSV with scenario label
    const headers = ['Reserve', 'Scenario', 'Jaar', 'Projectie', 'Bijdrage', 'Uitgaven'];
    const rows: string[][] = [];

    prognoses.forEach(reserve => {
      reserve.prognose[selectedScenario].forEach(year => {
        rows.push([
          reserve.name,
          SCENARIO_CONFIG[selectedScenario].label,
          year.year.toString(),
          `€${year.projected_balance.toLocaleString('nl-NL')}`,
          `€${year.annual_contribution.toLocaleString('nl-NL')}`,
          `€${year.planned_expenses.toLocaleString('nl-NL')}`,
        ]);
      });
    });

    // STORY-039: Include scenario parameters in export
    const params = scenarioParams[selectedScenario];
    const paramsRow = [
      '',
      '',
      'Parameters:',
      `Bijdrage: ${Math.round(params.contributionMultiplier * 100)}%`,
      `Uitgaven: ${Math.round(params.expenseMultiplier * 100)}%`,
      `Looptijd: ${params.years} jaar`,
    ];

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';')),
      '',
      paramsRow.join(';'),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reserves_prognose_${selectedScenario}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    addToast('Prognose geëxporteerd', 'success');
  };

  // Calculate totals for selected scenario
  const calculateTotals = () => {
    const currentTotal = prognoses.reduce((sum, r) => sum + r.current_balance, 0);
    const targetTotal = prognoses.reduce((sum, r) => sum + r.target_amount, 0);
    const projectedTotal = prognoses.reduce((sum, r) => {
      const lastYear = r.prognose[selectedScenario].slice(-1)[0];
      return sum + (lastYear?.projected_balance || 0);
    }, 0);

    return { currentTotal, targetTotal, projectedTotal };
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reserves Prognose</h1>
          <p className="text-gray-600 mt-1">Scenario-analyse voor reservefondsen</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ExportIcon />
          Exporteren
        </button>
      </div>

      {/* Scenario Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700">Scenario selecteren</h2>
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showConfigPanel ? 'Verbergen' : 'Parameters aanpassen'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SCENARIO_CONFIG) as Scenario[]).map((scenario) => {
            const config = SCENARIO_CONFIG[scenario];
            const isSelected = selectedScenario === scenario;
            
            return (
              <button
                key={scenario}
                onClick={() => handleScenarioChange(scenario)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isSelected
                    ? `${config.color} text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {config.label}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          {SCENARIO_CONFIG[selectedScenario].description}
        </p>

        {/* STORY-039: Scenario Parameters Configuration Panel */}
        {showConfigPanel && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Parameters voor &quot;{SCENARIO_CONFIG[selectedScenario].label}&quot;
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Bijdrage factor
                  <span className="ml-1 text-gray-400 cursor-help" title="1.0 = 100% van huidige bijdrage">ⓘ</span>
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="2"
                  value={scenarioParams[selectedScenario].contributionMultiplier}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 1;
                    setScenarioParams(prev => ({
                      ...prev,
                      [selectedScenario]: { ...prev[selectedScenario], contributionMultiplier: value }
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round(scenarioParams[selectedScenario].contributionMultiplier * 100)}% van basis
                </p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Uitgaven factor
                  <span className="ml-1 text-gray-400 cursor-help" title="1.0 = 100% geplande uitgaven">ⓘ</span>
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="2"
                  value={scenarioParams[selectedScenario].expenseMultiplier}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 1;
                    setScenarioParams(prev => ({
                      ...prev,
                      [selectedScenario]: { ...prev[selectedScenario], expenseMultiplier: value }
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round(scenarioParams[selectedScenario].expenseMultiplier * 100)}% van gepland
                </p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Looptijd (jaren)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="10"
                  value={scenarioParams[selectedScenario].years}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 3;
                    setScenarioParams(prev => ({
                      ...prev,
                      [selectedScenario]: { ...prev[selectedScenario], years: value }
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  addToast('Parameters opgeslagen', 'success');
                  setShowConfigPanel(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Toepassen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Huidig saldo</p>
          <p className="text-2xl font-bold text-gray-900">
            €{totals.currentTotal.toLocaleString('nl-NL')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Prognose 2028</p>
          <p className={`text-2xl font-bold ${
            totals.projectedTotal >= totals.targetTotal ? 'text-green-600' : 'text-orange-600'
          }`}>
            €{totals.projectedTotal.toLocaleString('nl-NL')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Doelstellingen</p>
          <p className="text-2xl font-bold text-gray-900">
            €{totals.targetTotal.toLocaleString('nl-NL')}
          </p>
        </div>
      </div>

      {/* Prognose Cards per Reserve */}
      <div className="space-y-4">
        {prognoses.map((reserve) => {
          const scenarioData = reserve.prognose[selectedScenario];
          const lastYearData = scenarioData.slice(-1)[0];
          const meetsTarget = lastYearData.projected_balance >= reserve.target_amount;
          const trendConfig = TREND_CONFIG[reserve.trend];
          const isExpanded = expandedReserve === reserve.id;

          return (
            <div key={reserve.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Card Header - Always visible */}
              <button
                onClick={() => setExpandedReserve(isExpanded ? null : reserve.id)}
                className="w-full p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`${trendConfig.color} text-2xl`}>{trendConfig.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{reserve.name}</h3>
                      <p className="text-sm text-gray-500">
                        Doel: €{reserve.target_amount.toLocaleString('nl-NL')} in {reserve.target_year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${meetsTarget ? 'text-green-600' : 'text-orange-600'}`}>
                        €{lastYearData.projected_balance.toLocaleString('nl-NL')}
                      </p>
                      <p className="text-xs text-gray-500">Prognose 2028</p>
                    </div>
                    <ChevronIcon expanded={isExpanded} />
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {/* Yearly Breakdown */}
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Jaarlijkse prognose</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="pb-2">Jaar</th>
                          <th className="pb-2">Saldo</th>
                          <th className="pb-2">Bijdrage</th>
                          <th className="pb-2">Uitgaven</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-gray-600">
                          <td className="py-1">2025 (huidig)</td>
                          <td className="py-1 font-medium">€{reserve.current_balance.toLocaleString('nl-NL')}</td>
                          <td className="py-1">-</td>
                          <td className="py-1">-</td>
                        </tr>
                        {scenarioData.map((year) => (
                          <tr key={year.year} className="text-gray-800">
                            <td className="py-1">{year.year}</td>
                            <td className={`py-1 font-medium ${
                              year.projected_balance >= reserve.target_amount 
                                ? 'text-green-600' 
                                : ''
                            }`}>
                              €{year.projected_balance.toLocaleString('nl-NL')}
                            </td>
                            <td className="py-1 text-green-600">
                              +€{year.annual_contribution.toLocaleString('nl-NL')}
                            </td>
                            <td className="py-1 text-red-600">
                              {year.planned_expenses > 0 
                                ? `-€${year.planned_expenses.toLocaleString('nl-NL')}` 
                                : '-'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Status indicator */}
                  <div className={`mt-4 p-3 rounded-lg ${
                    meetsTarget ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
                  }`}>
                    <p className={`text-sm ${meetsTarget ? 'text-green-700' : 'text-orange-700'}`}>
                      {meetsTarget
                        ? `✓ Doel wordt bereikt in ${reserve.target_year} met €${(lastYearData.projected_balance - reserve.target_amount).toLocaleString('nl-NL')} overschot`
                        : `⚠ Doel wordt niet bereikt. Tekort: €${(reserve.target_amount - lastYearData.projected_balance).toLocaleString('nl-NL')}`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Tooltip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900">Over de prognoses</h3>
        <p className="text-sm text-blue-700 mt-1">
          Prognoses zijn gebaseerd op historische data en aannames per scenario.
          Wijzig het scenario om de impact van verschillende strategieën te zien.
        </p>
      </div>
    </div>
  );
}

// Icon components
function ExportIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
