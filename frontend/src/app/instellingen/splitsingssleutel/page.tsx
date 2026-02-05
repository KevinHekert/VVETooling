'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';

/**
 * Splitsingssleutel Wizard - STORY-016
 * Multi-step wizard for configuring and validating splitsingssleutel.
 * Accessible via Instellingen menu.
 * Validates weights to 100% with inline feedback.
 * Supports version history and republishing.
 */

// Define wizard steps
const WIZARD_STEPS = [
  { id: 'overview', label: 'Overzicht' },
  { id: 'configure', label: 'Configureren' },
  { id: 'validate', label: 'Valideren' },
  { id: 'impact', label: 'Impact Analyse' },
  { id: 'publish', label: 'Publiceren' },
];

// Types for form data
interface UnitEntry {
  unit_id: string;
  unit_number: string;
  description: string;
  share_percentage: number;
  owner_name?: string;
}

interface SplitsingssleutelVersion {
  id: string;
  version: number;
  created_at: string;
  created_by: string;
  is_active: boolean;
  units: UnitEntry[];
}

interface ContributionImpact {
  unit_number: string;
  owner_name?: string;
  current_monthly: number;
  new_monthly: number;
  difference: number;
}

interface WizardState {
  units: UnitEntry[];
  versions: SplitsingssleutelVersion[];
  activeVersionId: string | null;
  monthlyBudget: number;
  isDirty: boolean;
}

const INITIAL_STATE: WizardState = {
  units: [],
  versions: [],
  activeVersionId: null,
  monthlyBudget: 1000,
  isDirty: false,
};

export default function SplitsingssleutelWizardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { currentVveId } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // VVE ID for API calls (prepared for future integration)

  // Load data from backend or localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from localStorage first (for resumption)
        const saved = localStorage.getItem('splitsingssleutel_wizard');
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData(parsed);
          setIsLoading(false);
          return;
        }

        // Load mock data (in real implementation, would call api.getSplitsingssleutel)
        const mockUnits: UnitEntry[] = [
          { unit_id: '1', unit_number: 'A1', description: 'Begane grond links', share_percentage: 25, owner_name: 'J. Jansen' },
          { unit_id: '2', unit_number: 'A2', description: 'Begane grond rechts', share_percentage: 25, owner_name: 'P. Pietersen' },
          { unit_id: '3', unit_number: 'B1', description: 'Eerste verdieping links', share_percentage: 25, owner_name: 'K. Klaassen' },
          { unit_id: '4', unit_number: 'B2', description: 'Eerste verdieping rechts', share_percentage: 25, owner_name: 'W. Willemsen' },
        ];

        const mockVersions: SplitsingssleutelVersion[] = [
          {
            id: 'v1',
            version: 1,
            created_at: '2025-01-15T10:00:00Z',
            created_by: 'Admin',
            is_active: true,
            units: mockUnits,
          },
        ];

        setFormData({
          units: mockUnits,
          versions: mockVersions,
          activeVersionId: 'v1',
          monthlyBudget: 2000,
          isDirty: false,
        });
      } catch {
        addToast('Fout bij laden van gegevens', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [addToast]);

  // Save progress to localStorage on change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('splitsingssleutel_wizard', JSON.stringify(formData));
    }
  }, [formData, isLoading]);

  // Calculate total share percentage
  const totalSharePercentage = useMemo(() =>
    formData.units.reduce(
      (sum, unit) => sum + (Number(unit.share_percentage) || 0),
      0
    ),
    [formData.units]
  );

  // Validation status
  const isValid = Math.abs(totalSharePercentage - 100) < 0.00001;
  const validationMessage = isValid
    ? 'Splitsingssleutel is geldig (100%)'
    : `Totaal is ${totalSharePercentage.toFixed(2)}%, ${totalSharePercentage < 100 ? 'voeg' : 'verwijder'} ${Math.abs(100 - totalSharePercentage).toFixed(2)}% ${totalSharePercentage < 100 ? 'toe' : ''}`;

  // Calculate contribution impact
  const contributionImpact = useMemo((): ContributionImpact[] => {
    return formData.units.map(unit => {
      const activeVersion = formData.versions.find(v => v.id === formData.activeVersionId);
      const oldUnit = activeVersion?.units.find(u => u.unit_id === unit.unit_id);
      const oldPercentage = oldUnit?.share_percentage || 0;
      
      const currentMonthly = (oldPercentage / 100) * formData.monthlyBudget;
      const newMonthly = (unit.share_percentage / 100) * formData.monthlyBudget;
      
      return {
        unit_number: unit.unit_number,
        owner_name: unit.owner_name,
        current_monthly: currentMonthly,
        new_monthly: newMonthly,
        difference: newMonthly - currentMonthly,
      };
    });
  }, [formData.units, formData.versions, formData.activeVersionId, formData.monthlyBudget]);

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      // Validate before moving to validate step
      if (currentStep === 1 && !isValid) {
        addToast('Corrigeer eerst de splitsingssleutel (totaal moet 100% zijn)', 'warning');
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Can only go back, or forward if valid
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    } else if (stepIndex === currentStep + 1 && isValid) {
      setCurrentStep(stepIndex);
    }
  };

  const updateUnit = useCallback((unitId: string, field: keyof UnitEntry, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      isDirty: true,
      units: prev.units.map((unit) =>
        unit.unit_id === unitId ? { ...unit, [field]: value } : unit
      ),
    }));
  }, []);

  const addUnit = useCallback(() => {
    const newId = `new-${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      isDirty: true,
      units: [
        ...prev.units,
        {
          unit_id: newId,
          unit_number: '',
          description: '',
          share_percentage: 0,
          owner_name: '',
        },
      ],
    }));
  }, []);

  const removeUnit = useCallback((unitId: string) => {
    setFormData((prev) => ({
      ...prev,
      isDirty: true,
      units: prev.units.filter((u) => u.unit_id !== unitId),
    }));
  }, []);

  const distributeEvenly = useCallback(() => {
    const count = formData.units.length;
    if (count === 0) return;
    
    const evenShare = 100 / count;
    setFormData((prev) => ({
      ...prev,
      isDirty: true,
      units: prev.units.map((unit) => ({
        ...unit,
        share_percentage: Math.round(evenShare * 100) / 100,
      })),
    }));
    addToast('Percentages gelijk verdeeld', 'success');
  }, [formData.units.length, addToast]);

  const restoreVersion = useCallback((versionId: string) => {
    const version = formData.versions.find(v => v.id === versionId);
    if (version) {
      setFormData((prev) => ({
        ...prev,
        units: [...version.units],
        isDirty: true,
      }));
      addToast(`Versie ${version.version} hersteld`, 'success');
    }
  }, [formData.versions, addToast]);

  const handlePublish = async () => {
    if (!isValid) {
      addToast('Splitsingssleutel moet exact 100% zijn', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // In real implementation: await api.updateSplitsingssleutel(currentVveId, formData.units);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create new version
      const newVersion: SplitsingssleutelVersion = {
        id: `v${formData.versions.length + 1}`,
        version: formData.versions.length + 1,
        created_at: new Date().toISOString(),
        created_by: 'Huidige gebruiker',
        is_active: true,
        units: [...formData.units],
      };

      // Mark old versions as inactive
      const updatedVersions = formData.versions.map(v => ({ ...v, is_active: false }));
      
      setFormData((prev) => ({
        ...prev,
        versions: [...updatedVersions, newVersion],
        activeVersionId: newVersion.id,
        isDirty: false,
      }));

      localStorage.removeItem('splitsingssleutel_wizard');
      addToast('Splitsingssleutel succesvol gepubliceerd!', 'success');
      router.push('/dashboard');
    } catch {
      addToast('Fout bij het publiceren van de splitsingssleutel', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-2">
            <span>Instellingen</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Splitsingssleutel</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Splitsingssleutel Configureren</h1>
          <p className="text-gray-600 mt-1">
            Configureer en valideer de splitsingssleutel voor uw VVE.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <ProgressIndicator
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Step 1: Overzicht */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Overzicht Splitsingssleutel</h2>
              
              {/* Current Validation Status */}
              <div
                className={`p-4 rounded-lg ${
                  isValid
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${isValid ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isValid ? '✓' : '⚠'}
                  </span>
                  <span className={`text-sm font-medium ${isValid ? 'text-green-700' : 'text-yellow-700'}`}>
                    {validationMessage}
                  </span>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">Aantal Eenheden</div>
                  <div className="text-2xl font-bold text-blue-900">{formData.units.length}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm text-purple-600 font-medium">Maandelijks Budget</div>
                  <div className="text-2xl font-bold text-purple-900">€{formData.monthlyBudget.toLocaleString('nl-NL')}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 font-medium">Versies</div>
                  <div className="text-2xl font-bold text-gray-900">{formData.versions.length}</div>
                </div>
              </div>

              {/* Current Units Preview */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Huidige Verdeling</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eenheid</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Omschrijving</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eigenaar</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aandeel</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Maandelijks</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.units.map((unit) => (
                        <tr key={unit.unit_id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{unit.unit_number}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{unit.description || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{unit.owner_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{unit.share_percentage}%</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            €{((unit.share_percentage / 100) * formData.monthlyBudget).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900">Totaal</td>
                        <td className={`px-4 py-3 text-sm text-right font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                          {totalSharePercentage.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                          €{formData.monthlyBudget.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Version History */}
              {formData.versions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Versie Geschiedenis</h3>
                  <div className="space-y-2">
                    {formData.versions.map((version) => (
                      <div
                        key={version.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          version.is_active ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            version.is_active 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            v{version.version}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {version.is_active ? 'Huidige versie' : `Versie ${version.version}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(version.created_at).toLocaleDateString('nl-NL')} door {version.created_by}
                            </div>
                          </div>
                        </div>
                        {!version.is_active && (
                          <button
                            onClick={() => restoreVersion(version.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Herstellen
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Configureren */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Eenheden Configureren</h2>
                <button
                  onClick={distributeEvenly}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Gelijk verdelen
                </button>
              </div>

              {/* Validation Status - Always Visible */}
              <div
                className={`p-4 rounded-lg ${
                  isValid
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${isValid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isValid ? '✓' : '⚠'}
                    </span>
                    <span className={`text-sm font-medium ${isValid ? 'text-green-700' : 'text-yellow-700'}`}>
                      {validationMessage}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${isValid ? 'text-green-700' : 'text-yellow-700'}`}>
                    {totalSharePercentage.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Units List */}
              <div className="space-y-4">
                {formData.units.map((unit) => (
                  <div
                    key={unit.unit_id}
                    className={`p-4 border rounded-lg ${
                      unit.share_percentage === 0
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="w-full lg:w-24">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Eenheid Nr.
                        </label>
                        <input
                          type="text"
                          value={unit.unit_number}
                          onChange={(e) => updateUnit(unit.unit_id, 'unit_number', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="A1"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Omschrijving
                        </label>
                        <input
                          type="text"
                          value={unit.description}
                          onChange={(e) => updateUnit(unit.unit_id, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Appartement begane grond links"
                        />
                      </div>
                      <div className="w-full lg:w-40">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Eigenaar
                        </label>
                        <input
                          type="text"
                          value={unit.owner_name || ''}
                          onChange={(e) => updateUnit(unit.unit_id, 'owner_name', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Naam"
                        />
                      </div>
                      <div className="w-full lg:w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Aandeel %
                        </label>
                        <input
                          type="number"
                          value={unit.share_percentage}
                          onChange={(e) =>
                            updateUnit(
                              unit.unit_id,
                              'share_percentage',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            unit.share_percentage === 0 ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="25"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        {unit.share_percentage === 0 && (
                          <p className="mt-1 text-xs text-red-600">Voer een percentage in</p>
                        )}
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeUnit(unit.unit_id)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                          aria-label={`Verwijder eenheid ${unit.unit_number}`}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addUnit}
                className="w-full md:w-auto px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                + Eenheid toevoegen
              </button>
            </div>
          )}

          {/* Step 3: Valideren */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Validatie Controle</h2>

              {/* Validation Result */}
              <div
                className={`p-6 rounded-lg ${
                  isValid
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-red-50 border-2 border-red-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-4xl ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isValid ? '✓' : '✗'}
                  </span>
                  <div>
                    <h3 className={`text-lg font-semibold ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                      {isValid ? 'Splitsingssleutel is geldig!' : 'Splitsingssleutel is niet geldig'}
                    </h3>
                    <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validationMessage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Validation Checks */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Validatie Controles</h3>
                
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className={`text-xl ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isValid ? '✓' : '✗'}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Totaal percentage is 100%</div>
                    <div className="text-xs text-gray-500">Huidig: {totalSharePercentage.toFixed(5)}%</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className={`text-xl ${formData.units.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.units.length > 0 ? '✓' : '✗'}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Minimaal één eenheid geconfigureerd</div>
                    <div className="text-xs text-gray-500">Aantal: {formData.units.length}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className={`text-xl ${
                    formData.units.every(u => u.unit_number.length > 0) ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {formData.units.every(u => u.unit_number.length > 0) ? '✓' : '⚠'}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Alle eenheden hebben een nummer</div>
                    <div className="text-xs text-gray-500">
                      {formData.units.filter(u => u.unit_number.length === 0).length === 0 
                        ? 'Alle eenheden compleet' 
                        : `${formData.units.filter(u => u.unit_number.length === 0).length} eenheden missen nummer`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className={`text-xl ${
                    formData.units.every(u => u.share_percentage > 0) ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {formData.units.every(u => u.share_percentage > 0) ? '✓' : '⚠'}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Alle eenheden hebben een aandeel {'>'} 0%</div>
                    <div className="text-xs text-gray-500">
                      {formData.units.filter(u => u.share_percentage === 0).length === 0 
                        ? 'Alle aandelen ingevuld' 
                        : `${formData.units.filter(u => u.share_percentage === 0).length} eenheden hebben 0%`}
                    </div>
                  </div>
                </div>
              </div>

              {!isValid && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>Let op:</strong> U kunt pas publiceren als de splitsingssleutel geldig is. 
                    Ga terug naar stap 2 om de percentages aan te passen.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Impact Analyse */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Impact op Contributies</h2>
              
              <p className="text-gray-600">
                Bekijk hoe de wijzigingen in de splitsingssleutel de maandelijkse contributies beïnvloeden.
              </p>

              {/* Budget Input */}
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maandelijks Budget (€)
                </label>
                <input
                  type="number"
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyBudget: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="100"
                />
              </div>

              {/* Impact Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eenheid</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eigenaar</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Huidig</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Nieuw</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Verschil</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contributionImpact.map((impact) => (
                      <tr key={impact.unit_number}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{impact.unit_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{impact.owner_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          €{impact.current_monthly.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">
                          €{impact.new_monthly.toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-medium ${
                          impact.difference > 0 
                            ? 'text-red-600' 
                            : impact.difference < 0 
                              ? 'text-green-600' 
                              : 'text-gray-500'
                        }`}>
                          {impact.difference > 0 ? '+' : ''}€{impact.difference.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {formData.isDirty && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Wijzigingen gedetecteerd:</strong> De bovenstaande tabel toont het verschil 
                    tussen de huidige actieve splitsingssleutel en uw voorgestelde wijzigingen.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Publiceren */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Publiceren</h2>

              {/* Final Summary */}
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Samenvatting</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Aantal eenheden</div>
                    <div className="text-lg font-semibold text-gray-900">{formData.units.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Totaal percentage</div>
                    <div className={`text-lg font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {totalSharePercentage.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Nieuwe versie</div>
                    <div className="text-lg font-semibold text-gray-900">v{formData.versions.length + 1}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className={`text-lg font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {isValid ? 'Gereed voor publicatie' : 'Niet geldig'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Validation */}
              <div
                className={`p-4 rounded-lg ${
                  isValid
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xl ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isValid ? '✓' : '✗'}
                  </span>
                  <span className={`text-sm font-medium ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                    {isValid 
                      ? 'Alle validaties geslaagd. U kunt nu publiceren.' 
                      : 'Niet alle validaties geslaagd. Ga terug om fouten te corrigeren.'}
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Let op:</strong> Na publicatie wordt de nieuwe splitsingssleutel direct actief. 
                  Contributies worden vanaf de volgende periode berekend met de nieuwe percentages.
                  Eerdere versies blijven beschikbaar voor herstel indien nodig.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex flex-col-reverse md:flex-row justify-between gap-4">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`
              px-6 py-3 rounded-lg font-medium
              ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            Vorige
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 text-gray-600 hover:text-gray-800"
            >
              Annuleren
            </button>

            {currentStep < WIZARD_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Volgende
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSaving || !isValid}
                className={`
                  px-6 py-3 rounded-lg font-medium
                  ${
                    isValid && !isSaving
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isSaving ? 'Bezig met publiceren...' : 'Publiceren'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
