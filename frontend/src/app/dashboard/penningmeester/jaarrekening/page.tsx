'use client';

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/components/ui/Toast';
import { DashboardWidget, DashboardGrid, KPICard } from '@/components/ui/RoleSwitcher';
import { useAuth } from '@/hooks/useAuth';

/**
 * Jaarrekening (Annual Report) Page - STORY-015
 * 
 * Implements:
 * - Annual report accessible via financial menu
 * - PDF export capability
 * - Read-only summary for bewoners, full version for bestuur
 * - Beheerder can regenerate
 */

// Mock annual report data
interface JaarrekeningSection {
  id: string;
  name: string;
  items: {
    description: string;
    budget: number;
    actual: number;
  }[];
}

interface Jaarrekening {
  year: number;
  status: 'draft' | 'final' | 'approved';
  generated_at: string;
  sections: JaarrekeningSection[];
  opening_balance: number;
  closing_balance: number;
}

const MOCK_JAARREKENING: Jaarrekening = {
  year: 2025,
  status: 'final',
  generated_at: '2026-01-15T10:30:00Z',
  opening_balance: 45230.00,
  closing_balance: 52780.00,
  sections: [
    {
      id: 'inkomsten',
      name: 'Inkomsten',
      items: [
        { description: 'VVE Bijdragen', budget: 43200, actual: 43200 },
        { description: 'Rente spaarrekening', budget: 500, actual: 620 },
        { description: 'Overige inkomsten', budget: 0, actual: 150 },
      ],
    },
    {
      id: 'uitgaven',
      name: 'Uitgaven',
      items: [
        { description: 'Onderhoud gebouw', budget: 12000, actual: 11850 },
        { description: 'Schoonmaak', budget: 3600, actual: 3600 },
        { description: 'Verzekeringen', budget: 4800, actual: 4920 },
        { description: 'Energie gemeenschappelijke ruimtes', budget: 6000, actual: 5840 },
        { description: 'Administratiekosten', budget: 2400, actual: 2400 },
        { description: 'Reserveringen', budget: 8000, actual: 8000 },
        { description: 'Overige kosten', budget: 1000, actual: 1030 },
      ],
    },
  ],
};

export default function JaarrekeningPage() {
  const { addToast } = useToast();
  const { currentRole } = useAuth();
  
  const isBewoner = currentRole === 'bewoner';
  const canRegenerate = currentRole === 'beheerder';

  const [jaarrekening, setJaarrekening] = useState<Jaarrekening | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Simulate API call
    const loadJaarrekening = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setJaarrekening(MOCK_JAARREKENING);
      setIsLoading(false);
    };
    loadJaarrekening();
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    if (!jaarrekening) return null;
    
    const inkomstenSection = jaarrekening.sections.find(s => s.id === 'inkomsten');
    const uitgavenSection = jaarrekening.sections.find(s => s.id === 'uitgaven');
    
    const totalInkomstenBudget = inkomstenSection?.items.reduce((sum, i) => sum + i.budget, 0) || 0;
    const totalInkomstenActual = inkomstenSection?.items.reduce((sum, i) => sum + i.actual, 0) || 0;
    const totalUitgavenBudget = uitgavenSection?.items.reduce((sum, i) => sum + i.budget, 0) || 0;
    const totalUitgavenActual = uitgavenSection?.items.reduce((sum, i) => sum + i.actual, 0) || 0;
    
    return {
      inkomstenBudget: totalInkomstenBudget,
      inkomstenActual: totalInkomstenActual,
      uitgavenBudget: totalUitgavenBudget,
      uitgavenActual: totalUitgavenActual,
      resultaatBudget: totalInkomstenBudget - totalUitgavenBudget,
      resultaatActual: totalInkomstenActual - totalUitgavenActual,
    };
  }, [jaarrekening]);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    addToast('Jaarrekening wordt opnieuw gegenereerd...', 'info');
    
    // Simulate regeneration
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setJaarrekening(prev => prev ? {
      ...prev,
      generated_at: new Date().toISOString(),
    } : null);
    
    setIsGenerating(false);
    addToast('Jaarrekening succesvol gegenereerd', 'success');
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    addToast('PDF wordt gegenereerd...', 'info');
    
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create mock PDF download
    const content = `Jaarrekening ${jaarrekening?.year}\n\nInkomsten: € ${totals?.inkomstenActual}\nUitgaven: € ${totals?.uitgavenActual}\nResultaat: € ${totals?.resultaatActual}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jaarrekening-${jaarrekening?.year}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setIsExporting(false);
    addToast('PDF gedownload', 'success');
  };

  const getStatusBadge = (status: Jaarrekening['status']) => {
    const badges = {
      draft: { text: 'Concept', color: 'bg-yellow-100 text-yellow-800' },
      final: { text: 'Definitief', color: 'bg-blue-100 text-blue-800' },
      approved: { text: 'Goedgekeurd', color: 'bg-green-100 text-green-800' },
    };
    const badge = badges[status];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => 
    `€ ${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!jaarrekening || !totals) {
    return (
      <div className="text-center text-gray-500 py-8">
        Geen jaarrekening beschikbaar
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Jaarrekening {jaarrekening.year}
            </h1>
            {getStatusBadge(jaarrekening.status)}
          </div>
          <p className="text-gray-600 mt-1">
            Gegenereerd op {new Date(jaarrekening.generated_at).toLocaleDateString('nl-NL', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          {canRegenerate && (
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {isGenerating ? '⟳ Genereren...' : '🔄 Regenereren'}
            </button>
          )}
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isExporting ? 'Exporteren...' : '📄 Export PDF'}
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <DashboardGrid columns={4}>
        <KPICard
          label="Openingssaldo"
          value={formatCurrency(jaarrekening.opening_balance)}
        />
        <KPICard
          label="Totaal Inkomsten"
          value={formatCurrency(totals.inkomstenActual)}
          trend="up"
        />
        <KPICard
          label="Totaal Uitgaven"
          value={formatCurrency(totals.uitgavenActual)}
          trend="down"
        />
        <KPICard
          label="Sluitsaldo"
          value={formatCurrency(jaarrekening.closing_balance)}
          trend={jaarrekening.closing_balance >= jaarrekening.opening_balance ? 'up' : 'down'}
        />
      </DashboardGrid>

      {/* Bewoner: Compact Summary Only */}
      {isBewoner && (
        <DashboardWidget title="Financieel Overzicht">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Inkomsten</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totals.inkomstenActual)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Uitgaven</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totals.uitgavenActual)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Resultaat</p>
              <p className={`text-xl font-bold ${totals.resultaatActual >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(totals.resultaatActual)}
              </p>
            </div>
          </div>
        </DashboardWidget>
      )}

      {/* Full Report for Bestuur and Beheerder */}
      {!isBewoner && (
        <>
          {jaarrekening.sections.map((section) => {
            const sectionTotal = section.items.reduce((sum, i) => sum + i.actual, 0);
            const sectionBudget = section.items.reduce((sum, i) => sum + i.budget, 0);
            
            return (
              <div key={section.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">{section.name}</h2>
                  <div className="text-sm text-gray-500">
                    Totaal: <span className="font-medium text-gray-900">{formatCurrency(sectionTotal)}</span>
                    <span className="ml-2 text-xs">(budget: {formatCurrency(sectionBudget)})</span>
                  </div>
                </div>
                
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Omschrijving</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Begroting</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Werkelijk</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Verschil</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {section.items.map((item, idx) => {
                        const diff = item.actual - item.budget;
                        const isPositive = section.id === 'inkomsten' ? diff >= 0 : diff <= 0;
                        
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-900">{item.description}</td>
                            <td className="px-6 py-4 text-right text-gray-500">
                              {formatCurrency(item.budget)}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                              {formatCurrency(item.actual)}
                            </td>
                            <td className={`px-6 py-4 text-right font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Section Total */}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="px-6 py-4 text-gray-900">Totaal {section.name}</td>
                        <td className="px-6 py-4 text-right text-gray-700">{formatCurrency(sectionBudget)}</td>
                        <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(sectionTotal)}</td>
                        <td className={`px-6 py-4 text-right ${sectionTotal - sectionBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {sectionTotal - sectionBudget >= 0 ? '+' : ''}{formatCurrency(sectionTotal - sectionBudget)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile List */}
                <div className="md:hidden divide-y divide-gray-200">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="p-4">
                      <p className="font-medium text-gray-900 mb-1">{item.description}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Budget: {formatCurrency(item.budget)}</span>
                        <span className="font-medium">{formatCurrency(item.actual)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Result Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resultaat</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Begroot resultaat</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.resultaatBudget)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Werkelijk resultaat</p>
                <p className={`text-xl font-bold ${totals.resultaatActual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.resultaatActual)}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Verschil</p>
                <p className={`text-xl font-bold ${totals.resultaatActual - totals.resultaatBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totals.resultaatActual - totals.resultaatBudget >= 0 ? '+' : ''}
                  {formatCurrency(totals.resultaatActual - totals.resultaatBudget)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
