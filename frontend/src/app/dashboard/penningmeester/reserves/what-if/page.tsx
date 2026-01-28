'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * What-If Scenario Calculator - STORY-066
 * 
 * Als penningmeester wil ik what-if scenario's kunnen doorrekenen met
 * verschillende contributiehoogtes, zodat ik de impact op reserves kan
 * presenteren aan de ALV.
 * 
 * Features:
 * - Slider for contribution adjustment
 * - Real-time update of projection chart
 * - Comparison: current vs scenario
 * - Save scenario for presentation
 * - Export to PDF for ALV
 */

interface YearProjection {
  year: number;
  original_cost: number;
  scenario_cost: number;
  original_contribution: number;
  scenario_contribution: number;
  original_reserve_balance: number;
  scenario_reserve_balance: number;
}

interface ScenarioResult {
  scenario_name: string;
  years_ahead: number;
  original_total: number;
  scenario_total: number;
  difference: number;
  difference_percentage: number;
  annual_contribution_original: number;
  annual_contribution_scenario: number;
  yearly_projections: YearProjection[];
  by_category_original: Record<string, number>;
  by_category_scenario: Record<string, number>;
  warnings: string[];
}

interface MaintenanceElement {
  id: string;
  name: string;
  category: string;
  estimated_cost: number;
  next_maintenance_year: number;
}

// Mock maintenance elements for demonstration
const MOCK_ELEMENTS: MaintenanceElement[] = [
  { id: 'elem-1', name: 'Dakbedekking', category: 'roof', estimated_cost: 25000, next_maintenance_year: 2028 },
  { id: 'elem-2', name: 'Lift renovatie', category: 'elevator', estimated_cost: 45000, next_maintenance_year: 2029 },
  { id: 'elem-3', name: 'Gevelreiniging', category: 'facade', estimated_cost: 12000, next_maintenance_year: 2027 },
  { id: 'elem-4', name: 'CV-ketel vervanging', category: 'heating', estimated_cost: 18000, next_maintenance_year: 2030 },
  { id: 'elem-5', name: 'Schilderwerk trappenhuizen', category: 'common_areas', estimated_cost: 8500, next_maintenance_year: 2027 },
];

const CATEGORY_LABELS: Record<string, string> = {
  roof: 'Dak',
  elevator: 'Lift',
  facade: 'Gevel',
  heating: 'Verwarming',
  common_areas: 'Gemeenschappelijk',
  electrical: 'Elektra',
  plumbing: 'Leidingwerk',
  windows: 'Ramen',
  doors: 'Deuren',
  foundation: 'Fundering',
  garden: 'Tuin',
  parking: 'Parkeren',
  other: 'Overig',
};

export default function WhatIfScenarioPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Scenario parameters
  const [scenarioName, setScenarioName] = useState('Nieuw Scenario');
  const [contributionAdjustment, setContributionAdjustment] = useState(0);
  const [yearsAhead, setYearsAhead] = useState(10);
  const [costIncrease, setCostIncrease] = useState(0);
  const [includeContingency, setIncludeContingency] = useState(true);
  const [contingencyPercentage, setContingencyPercentage] = useState(10);
  const [postponeElements, setPostponeElements] = useState<string[]>([]);
  const [postponeYears, setPostponeYears] = useState(1);
  
  // Results
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [elements, setElements] = useState<MaintenanceElement[]>([]);
  
  // Saved scenarios
  const [savedScenarios, setSavedScenarios] = useState<Array<{ name: string; params: object }>>([]);

  useEffect(() => {
    // Load elements
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      setElements(MOCK_ELEMENTS);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Calculate scenario when parameters change
  const calculateScenario = useCallback(async () => {
    setIsCalculating(true);
    
    // Simulate API call - in real implementation this would call the backend
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentYear = new Date().getFullYear();
    const endYear = currentYear + yearsAhead;
    
    // Calculate original projections
    let originalTotal = 0;
    const originalByYear: Record<number, number> = {};
    const originalByCategory: Record<string, number> = {};
    
    elements.forEach(elem => {
      if (elem.next_maintenance_year <= endYear) {
        originalTotal += elem.estimated_cost;
        originalByYear[elem.next_maintenance_year] = (originalByYear[elem.next_maintenance_year] || 0) + elem.estimated_cost;
        originalByCategory[elem.category] = (originalByCategory[elem.category] || 0) + elem.estimated_cost;
      }
    });
    
    // Calculate scenario projections
    let scenarioTotal = 0;
    const scenarioByYear: Record<number, number> = {};
    const scenarioByCategory: Record<string, number> = {};
    
    elements.forEach(elem => {
      const costMultiplier = 1 + (costIncrease / 100);
      const adjustedCost = elem.estimated_cost * costMultiplier;
      let adjustedYear = elem.next_maintenance_year;
      
      if (postponeElements.includes(elem.id)) {
        adjustedYear += postponeYears;
      }
      
      if (adjustedYear <= endYear) {
        scenarioTotal += adjustedCost;
        scenarioByYear[adjustedYear] = (scenarioByYear[adjustedYear] || 0) + adjustedCost;
        scenarioByCategory[elem.category] = (scenarioByCategory[elem.category] || 0) + adjustedCost;
      }
    });
    
    // Add contingency
    if (includeContingency) {
      originalTotal *= (1 + contingencyPercentage / 100);
      scenarioTotal *= (1 + contingencyPercentage / 100);
    }
    
    // Calculate contributions
    const annualContributionOriginal = originalTotal / yearsAhead;
    const contributionMultiplier = 1 + (contributionAdjustment / 100);
    const annualContributionScenario = annualContributionOriginal * contributionMultiplier;
    
    // Generate yearly projections
    const projections: YearProjection[] = [];
    let originalBalance = 0;
    let scenarioBalance = 0;
    const warnings: string[] = [];
    
    for (let year = currentYear; year <= endYear; year++) {
      const originalCostThisYear = originalByYear[year] || 0;
      const scenarioCostThisYear = scenarioByYear[year] || 0;
      
      originalBalance = originalBalance + annualContributionOriginal - originalCostThisYear;
      scenarioBalance = scenarioBalance + annualContributionScenario - scenarioCostThisYear;
      
      projections.push({
        year,
        original_cost: originalCostThisYear,
        scenario_cost: scenarioCostThisYear,
        original_contribution: annualContributionOriginal,
        scenario_contribution: annualContributionScenario,
        original_reserve_balance: originalBalance,
        scenario_reserve_balance: scenarioBalance,
      });
      
      if (scenarioBalance < 0 && !warnings.some(w => w.includes(String(year)))) {
        warnings.push(`Waarschuwing: Negatief saldo in ${year} (€${scenarioBalance.toFixed(2)})`);
      }
    }
    
    const difference = scenarioTotal - originalTotal;
    const differencePercentage = originalTotal > 0 ? (difference / originalTotal) * 100 : 0;
    
    setResult({
      scenario_name: scenarioName,
      years_ahead: yearsAhead,
      original_total: originalTotal,
      scenario_total: scenarioTotal,
      difference,
      difference_percentage: differencePercentage,
      annual_contribution_original: annualContributionOriginal,
      annual_contribution_scenario: annualContributionScenario,
      yearly_projections: projections,
      by_category_original: originalByCategory,
      by_category_scenario: scenarioByCategory,
      warnings,
    });
    
    setIsCalculating(false);
  }, [scenarioName, contributionAdjustment, yearsAhead, costIncrease, includeContingency, contingencyPercentage, postponeElements, postponeYears, elements]);

  // Recalculate on parameter change
  useEffect(() => {
    if (!isLoading && elements.length > 0) {
      calculateScenario();
    }
  }, [calculateScenario, isLoading, elements.length]);

  const handleSaveScenario = () => {
    const scenario = {
      name: scenarioName,
      params: {
        contributionAdjustment,
        yearsAhead,
        costIncrease,
        includeContingency,
        contingencyPercentage,
        postponeElements,
        postponeYears,
      },
    };
    setSavedScenarios(prev => [...prev, scenario]);
    addToast(`Scenario "${scenarioName}" opgeslagen`, 'success');
  };

  const handleExportPDF = () => {
    // Generate printable content
    if (!result) return;
    
    const printContent = `
      <html>
        <head>
          <title>What-If Scenario: ${result.scenario_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1e40af; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f3f4f6; }
            .header { text-align: left; }
            .warning { color: #dc2626; margin: 10px 0; }
            .summary { display: flex; gap: 40px; margin: 20px 0; }
            .summary-card { background: #f9fafb; padding: 16px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>🔮 What-If Scenario: ${result.scenario_name}</h1>
          <p>Gegenereerd: ${new Date().toLocaleDateString('nl-NL')}</p>
          
          <h2>Samenvatting</h2>
          <table>
            <tr>
              <th class="header">Metric</th>
              <th>Huidige Situatie</th>
              <th>Scenario</th>
              <th>Verschil</th>
            </tr>
            <tr>
              <td class="header">Totaal kosten</td>
              <td>€ ${result.original_total.toLocaleString('nl-NL')}</td>
              <td>€ ${result.scenario_total.toLocaleString('nl-NL')}</td>
              <td>${result.difference >= 0 ? '+' : ''}€ ${result.difference.toLocaleString('nl-NL')}</td>
            </tr>
            <tr>
              <td class="header">Jaarlijkse bijdrage</td>
              <td>€ ${result.annual_contribution_original.toLocaleString('nl-NL')}</td>
              <td>€ ${result.annual_contribution_scenario.toLocaleString('nl-NL')}</td>
              <td>${result.difference_percentage >= 0 ? '+' : ''}${result.difference_percentage.toFixed(1)}%</td>
            </tr>
          </table>
          
          ${result.warnings.length > 0 ? `
            <h2>⚠️ Waarschuwingen</h2>
            ${result.warnings.map(w => `<p class="warning">${w}</p>`).join('')}
          ` : ''}
          
          <h2>Jaarlijkse Prognose</h2>
          <table>
            <tr>
              <th>Jaar</th>
              <th>Kosten (huidig)</th>
              <th>Kosten (scenario)</th>
              <th>Saldo (huidig)</th>
              <th>Saldo (scenario)</th>
            </tr>
            ${result.yearly_projections.map(p => `
              <tr>
                <td>${p.year}</td>
                <td>€ ${p.original_cost.toLocaleString('nl-NL')}</td>
                <td>€ ${p.scenario_cost.toLocaleString('nl-NL')}</td>
                <td style="color: ${p.original_reserve_balance < 0 ? '#dc2626' : 'inherit'}">
                  € ${p.original_reserve_balance.toLocaleString('nl-NL')}
                </td>
                <td style="color: ${p.scenario_reserve_balance < 0 ? '#dc2626' : 'inherit'}">
                  € ${p.scenario_reserve_balance.toLocaleString('nl-NL')}
                </td>
              </tr>
            `).join('')}
          </table>
          
          <p style="margin-top: 40px; color: #6b7280; font-size: 12px;">
            VVE Tooling - Gegenereerd voor ALV presentatie
          </p>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    
    addToast('PDF geëxporteerd', 'success');
  };

  const togglePostponeElement = (elementId: string) => {
    setPostponeElements(prev => 
      prev.includes(elementId) 
        ? prev.filter(id => id !== elementId)
        : [...prev, elementId]
    );
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
          <h1 className="text-2xl font-bold text-gray-900">🔮 What-If Scenario</h1>
          <p className="text-gray-600 mt-1">
            Bereken impact van verschillende contributiehoogtes op reserves
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveScenario}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            💾 Opslaan
          </button>
          <button
            onClick={handleExportPDF}
            disabled={!result}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Scenario Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Scenario Parameters</h2>
        
        {/* Scenario Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scenario Naam
          </label>
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Bijv. 'ALV Voorstel 2026'"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contribution Adjustment Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contributie Aanpassing: <span className={`font-bold ${contributionAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {contributionAdjustment >= 0 ? '+' : ''}{contributionAdjustment}%
              </span>
            </label>
            <input
              type="range"
              min="-30"
              max="50"
              value={contributionAdjustment}
              onChange={(e) => setContributionAdjustment(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-30%</span>
              <span>0%</span>
              <span>+50%</span>
            </div>
          </div>

          {/* Years Ahead */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Projectieperiode: <span className="font-bold">{yearsAhead} jaar</span>
            </label>
            <input
              type="range"
              min="5"
              max="30"
              value={yearsAhead}
              onChange={(e) => setYearsAhead(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 jaar</span>
              <span>15 jaar</span>
              <span>30 jaar</span>
            </div>
          </div>

          {/* Cost Increase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kostenstijging: <span className={`font-bold ${costIncrease >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {costIncrease >= 0 ? '+' : ''}{costIncrease}%
              </span>
            </label>
            <input
              type="range"
              min="-20"
              max="50"
              value={costIncrease}
              onChange={(e) => setCostIncrease(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-20%</span>
              <span>0%</span>
              <span>+50%</span>
            </div>
          </div>

          {/* Contingency */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                id="contingency"
                checked={includeContingency}
                onChange={(e) => setIncludeContingency(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="contingency" className="text-sm font-medium text-gray-700">
                Onvoorzien meenemen
              </label>
              <span className="text-sm text-gray-500">({contingencyPercentage}%)</span>
            </div>
            {includeContingency && (
              <input
                type="range"
                min="5"
                max="25"
                value={contingencyPercentage}
                onChange={(e) => setContingencyPercentage(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            )}
          </div>
        </div>

        {/* Postpone Elements */}
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Onderhoud uitstellen ({postponeYears} jaar)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={postponeYears}
              onChange={(e) => setPostponeYears(Number(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {elements.map(elem => (
              <button
                key={elem.id}
                onClick={() => togglePostponeElement(elem.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  postponeElements.includes(elem.id)
                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {elem.name}
                {postponeElements.includes(elem.id) && ' ⏸'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {isCalculating ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Berekenen...</p>
        </div>
      ) : result && (
        <>
          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-900 mb-2">
                ⚠️ {result.warnings.length} waarschuwing{result.warnings.length > 1 ? 'en' : ''}
              </h3>
              <ul className="space-y-1">
                {result.warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-red-700">{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Huidige Totaal</p>
              <p className="text-2xl font-bold text-gray-900">
                €{result.original_total.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Scenario Totaal</p>
              <p className="text-2xl font-bold text-blue-600">
                €{result.scenario_total.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Huidige Jaarlijkse Bijdrage</p>
              <p className="text-2xl font-bold text-gray-900">
                €{result.annual_contribution_original.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Scenario Jaarlijkse Bijdrage</p>
              <p className={`text-2xl font-bold ${
                result.annual_contribution_scenario >= result.annual_contribution_original ? 'text-green-600' : 'text-red-600'
              }`}>
                €{result.annual_contribution_scenario.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Comparison Chart (simplified text-based visualization) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Vergelijking: Huidige vs Scenario
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-medium text-gray-500">Jaar</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-500">Kosten (huidig)</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-500">Kosten (scenario)</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-500">Saldo (huidig)</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-500">Saldo (scenario)</th>
                    <th className="text-left py-2 pl-4 font-medium text-gray-500">Verschil</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearly_projections.map((proj) => {
                    const balanceDiff = proj.scenario_reserve_balance - proj.original_reserve_balance;
                    return (
                      <tr key={proj.year} className="border-b border-gray-100">
                        <td className="py-2 pr-4 font-medium">{proj.year}</td>
                        <td className="py-2 px-4 text-right text-gray-600">
                          {proj.original_cost > 0 
                            ? `€${proj.original_cost.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}` 
                            : '-'}
                        </td>
                        <td className="py-2 px-4 text-right text-blue-600">
                          {proj.scenario_cost > 0 
                            ? `€${proj.scenario_cost.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}` 
                            : '-'}
                        </td>
                        <td className={`py-2 px-4 text-right font-medium ${
                          proj.original_reserve_balance < 0 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          €{proj.original_reserve_balance.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                        </td>
                        <td className={`py-2 px-4 text-right font-medium ${
                          proj.scenario_reserve_balance < 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          €{proj.scenario_reserve_balance.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                        </td>
                        <td className={`py-2 pl-4 ${balanceDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {balanceDiff >= 0 ? '+' : ''}€{balanceDiff.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📁 Kosten per Categorie
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(result.by_category_original).map(category => {
                const originalCost = result.by_category_original[category] || 0;
                const scenarioCost = result.by_category_scenario[category] || 0;
                const diff = scenarioCost - originalCost;
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {CATEGORY_LABELS[category] || category}
                      </p>
                      <p className="text-sm text-gray-500">
                        Huidig: €{originalCost.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">
                        €{scenarioCost.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                      </p>
                      <p className={`text-sm ${diff >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {diff >= 0 ? '+' : ''}€{diff.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Saved Scenarios */}
      {savedScenarios.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💾 Opgeslagen Scenario&apos;s
          </h3>
          <div className="flex flex-wrap gap-2">
            {savedScenarios.map((scenario, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {scenario.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-1">💡 Tip voor ALV</h3>
        <p className="text-sm text-blue-700">
          Pas de contributie-slider aan om te zien hoe verschillende bijdragehoogtes 
          de reserves beïnvloeden. Gebruik &quot;Export PDF&quot; om het scenario te delen met de ALV.
        </p>
      </div>
    </div>
  );
}
