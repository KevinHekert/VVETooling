'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { useToast } from '@/components/ui/Toast';

/**
 * Onboarding Wizard - STORY-007
 * Multi-step wizard for VVE setup: basic info, roles, splitsingssleutel, financial, documents.
 * Progress is saved per step; users can resume later.
 * Activates role-specific dashboards and menus upon completion.
 */

// Define wizard steps
const WIZARD_STEPS = [
  { id: 'basics', label: 'Basisgegevens' },
  { id: 'roles', label: 'Rollen & Uitnodigingen' },
  { id: 'splitsingssleutel', label: 'Splitsingssleutel' },
  { id: 'financial', label: 'Financieel Startpakket' },
  { id: 'documents', label: 'Documenten' },
];

// Types for form data
interface VVEBasics {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  kvk_number: string;
}

// STORY-017 Enhanced: Invitation status tracking
type InvitationStatus = 'draft' | 'sent' | 'pending' | 'accepted' | 'declined';

interface RoleInvitation {
  id: string;
  email: string;
  role: 'beheerder' | 'bestuurslid' | 'penningmeester' | 'bewoner';
  name: string;
  status: InvitationStatus;
  sent_at?: string;
  reminder_count: number;
  last_reminder_at?: string;
}

interface UnitEntry {
  unit_number: string;
  description: string;
  share_percentage: number;
}

interface FinancialSetup {
  starting_balance: number;
  reserve_fund_amount: number;
  fiscal_year_start: string;
}

interface OnboardingState {
  basics: VVEBasics;
  invitations: RoleInvitation[];
  units: UnitEntry[];
  financial: FinancialSetup;
  documents_uploaded: boolean;
}

const INITIAL_STATE: OnboardingState = {
  basics: {
    name: '',
    address: '',
    postal_code: '',
    city: '',
    kvk_number: '',
  },
  invitations: [],
  units: [],
  financial: {
    starting_balance: 0,
    reserve_fund_amount: 0,
    fiscal_year_start: '',
  },
  documents_uploaded: false,
};

export default function OnboardingWizardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingState>(INITIAL_STATE);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || INITIAL_STATE);
        setCurrentStep(parsed.currentStep || 0);
      } catch {
        // Ignore invalid saved data
      }
    }
  }, []);

  // Save progress to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      'onboarding_progress',
      JSON.stringify({ formData, currentStep })
    );
  }, [formData, currentStep]);

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      addToast('Stap opgeslagen', 'success');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, this would call the API to save all data
      // and activate role-specific dashboards
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      localStorage.removeItem('onboarding_progress');
      addToast('Onboarding voltooid! Uw VVE is klaar voor gebruik.', 'success');
      router.push('/dashboard');
    } catch {
      addToast('Er is een fout opgetreden bij het voltooien van de onboarding.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateBasics = (field: keyof VVEBasics, value: string) => {
    setFormData((prev) => ({
      ...prev,
      basics: { ...prev.basics, [field]: value },
    }));
  };

  const addInvitation = () => {
    const newId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setFormData((prev) => ({
      ...prev,
      invitations: [
        ...prev.invitations,
        { 
          id: newId,
          email: '', 
          role: 'bewoner', 
          name: '',
          status: 'draft',
          reminder_count: 0,
        },
      ],
    }));
  };

  const updateInvitation = (
    index: number,
    field: keyof RoleInvitation,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      invitations: prev.invitations.map((inv, i) =>
        i === index ? { ...inv, [field]: value } : inv
      ),
    }));
  };

  // STORY-017: Send invitation
  const sendInvitation = async (index: number) => {
    const invitation = formData.invitations[index];
    if (!invitation.email || !invitation.name) {
      addToast('Vul eerst naam en e-mailadres in', 'warning');
      return;
    }

    // Mock API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setFormData((prev) => ({
        ...prev,
        invitations: prev.invitations.map((inv, i) =>
          i === index 
            ? { ...inv, status: 'sent' as InvitationStatus, sent_at: new Date().toISOString() } 
            : inv
        ),
      }));
      
      addToast(`Uitnodiging verzonden naar ${invitation.email}`, 'success');
    } catch {
      addToast('Fout bij verzenden van uitnodiging', 'error');
    }
  };

  // STORY-017: Send reminder
  const sendReminder = async (index: number) => {
    const invitation = formData.invitations[index];
    
    // Mock API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setFormData((prev) => ({
        ...prev,
        invitations: prev.invitations.map((inv, i) =>
          i === index 
            ? { 
                ...inv, 
                reminder_count: inv.reminder_count + 1,
                last_reminder_at: new Date().toISOString(),
              } 
            : inv
        ),
      }));
      
      addToast(`Herinnering verzonden naar ${invitation.email}`, 'success');
    } catch {
      addToast('Fout bij verzenden van herinnering', 'error');
    }
  };

  // STORY-017: Send all pending invitations
  const sendAllInvitations = async () => {
    const draftInvitations = formData.invitations.filter(
      inv => inv.status === 'draft' && inv.email && inv.name
    );
    
    if (draftInvitations.length === 0) {
      addToast('Geen nieuwe uitnodigingen om te verzenden', 'info');
      return;
    }

    // Mock batch send
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setFormData((prev) => ({
        ...prev,
        invitations: prev.invitations.map((inv) =>
          inv.status === 'draft' && inv.email && inv.name
            ? { ...inv, status: 'sent' as InvitationStatus, sent_at: new Date().toISOString() } 
            : inv
        ),
      }));
      
      addToast(`${draftInvitations.length} uitnodigingen verzonden`, 'success');
    } catch {
      addToast('Fout bij verzenden van uitnodigingen', 'error');
    }
  };

  const removeInvitation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      invitations: prev.invitations.filter((_, i) => i !== index),
    }));
  };

  const addUnit = () => {
    setFormData((prev) => ({
      ...prev,
      units: [...prev.units, { unit_number: '', description: '', share_percentage: 0 }],
    }));
  };

  const updateUnit = (index: number, field: keyof UnitEntry, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      units: prev.units.map((unit, i) =>
        i === index ? { ...unit, [field]: value } : unit
      ),
    }));
  };

  const removeUnit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      units: prev.units.filter((_, i) => i !== index),
    }));
  };

  const updateFinancial = (field: keyof FinancialSetup, value: number | string) => {
    setFormData((prev) => ({
      ...prev,
      financial: { ...prev.financial, [field]: value },
    }));
  };

  // Calculate total share percentage for validation - memoized to avoid recalculation
  const totalSharePercentage = React.useMemo(() => 
    formData.units.reduce(
      (sum, unit) => sum + (Number(unit.share_percentage) || 0),
      0
    ),
    [formData.units]
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">VVE Onboarding</h1>
          <p className="text-gray-600 mt-1">
            Stel uw VVE in door de onderstaande stappen te doorlopen.
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
          {/* Step 1: Basisgegevens */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Basisgegevens VVE
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Naam VVE *
                  </label>
                  <input
                    type="text"
                    value={formData.basics.name}
                    onChange={(e) => updateBasics('name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="VVE Voorbeeld"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    KVK Nummer
                  </label>
                  <input
                    type="text"
                    value={formData.basics.kvk_number}
                    onChange={(e) => updateBasics('kvk_number', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12345678"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres
                  </label>
                  <input
                    type="text"
                    value={formData.basics.address}
                    onChange={(e) => updateBasics('address', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Straatnaam 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={formData.basics.postal_code}
                    onChange={(e) => updateBasics('postal_code', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1234 AB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stad
                  </label>
                  <input
                    type="text"
                    value={formData.basics.city}
                    onChange={(e) => updateBasics('city', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Amsterdam"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Rollen & Uitnodigingen - STORY-017 Enhanced */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Rollen & Uitnodigingen
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Nodig leden uit met hun rol binnen de VVE.
                  </p>
                </div>
                {/* STORY-017: Send All Action */}
                {formData.invitations.filter(inv => inv.status === 'draft' && inv.email && inv.name).length > 0 && (
                  <button
                    type="button"
                    onClick={sendAllInvitations}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Alle verzenden ({formData.invitations.filter(inv => inv.status === 'draft' && inv.email && inv.name).length})
                  </button>
                )}
              </div>

              {/* STORY-017: Status Summary */}
              {formData.invitations.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                    <span className="text-gray-600">
                      Concept: {formData.invitations.filter(inv => inv.status === 'draft').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-gray-600">
                      Verzonden: {formData.invitations.filter(inv => inv.status === 'sent').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-gray-600">
                      In afwachting: {formData.invitations.filter(inv => inv.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-gray-600">
                      Geaccepteerd: {formData.invitations.filter(inv => inv.status === 'accepted').length}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {formData.invitations.map((invitation, index) => (
                  <div
                    key={invitation.id}
                    className={`p-4 border rounded-lg ${
                      invitation.status === 'accepted' 
                        ? 'border-green-200 bg-green-50' 
                        : invitation.status === 'sent' || invitation.status === 'pending'
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Status Badge - STORY-017 */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          invitation.status === 'draft'
                            ? 'bg-gray-100 text-gray-600'
                            : invitation.status === 'sent'
                              ? 'bg-blue-100 text-blue-700'
                              : invitation.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : invitation.status === 'accepted'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {invitation.status === 'draft' && '📝 Concept'}
                        {invitation.status === 'sent' && '📧 Verzonden'}
                        {invitation.status === 'pending' && '⏳ In afwachting'}
                        {invitation.status === 'accepted' && '✓ Geaccepteerd'}
                        {invitation.status === 'declined' && '✗ Afgewezen'}
                      </span>
                      {invitation.sent_at && (
                        <span className="text-xs text-gray-500">
                          Verzonden: {new Date(invitation.sent_at).toLocaleDateString('nl-NL')}
                          {invitation.reminder_count > 0 && ` • ${invitation.reminder_count} herinnering(en)`}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Naam
                        </label>
                        <input
                          type="text"
                          value={invitation.name}
                          onChange={(e) =>
                            updateInvitation(index, 'name', e.target.value)
                          }
                          disabled={invitation.status !== 'draft'}
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                            invitation.status !== 'draft' 
                              ? 'bg-gray-50 border-gray-200 text-gray-600' 
                              : 'border-gray-300'
                          }`}
                          placeholder="Jan Jansen"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          E-mail
                        </label>
                        <input
                          type="email"
                          value={invitation.email}
                          onChange={(e) =>
                            updateInvitation(index, 'email', e.target.value)
                          }
                          disabled={invitation.status !== 'draft'}
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                            invitation.status !== 'draft' 
                              ? 'bg-gray-50 border-gray-200 text-gray-600' 
                              : 'border-gray-300'
                          }`}
                          placeholder="jan@example.com"
                        />
                      </div>
                      <div className="w-full md:w-40">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rol
                        </label>
                        <select
                          value={invitation.role}
                          onChange={(e) =>
                            updateInvitation(
                              index,
                              'role',
                              e.target.value as RoleInvitation['role']
                            )
                          }
                          disabled={invitation.status !== 'draft'}
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                            invitation.status !== 'draft' 
                              ? 'bg-gray-50 border-gray-200 text-gray-600' 
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="bewoner">Bewoner</option>
                          <option value="bestuurslid">Bestuurslid</option>
                          <option value="penningmeester">Penningmeester</option>
                          <option value="beheerder">Beheerder</option>
                        </select>
                      </div>
                    </div>

                    {/* STORY-017: Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                      {invitation.status === 'draft' && (
                        <>
                          <button
                            type="button"
                            onClick={() => sendInvitation(index)}
                            disabled={!invitation.email || !invitation.name}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                              invitation.email && invitation.name
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            📧 Verzenden
                          </button>
                          <button
                            type="button"
                            onClick={() => removeInvitation(index)}
                            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                          >
                            Verwijderen
                          </button>
                        </>
                      )}
                      {(invitation.status === 'sent' || invitation.status === 'pending') && (
                        <button
                          type="button"
                          onClick={() => sendReminder(index)}
                          className="px-3 py-1.5 text-sm font-medium text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50"
                        >
                          🔔 Herinnering sturen
                        </button>
                      )}
                      {invitation.status === 'accepted' && (
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Gebruiker heeft toegang tot het dashboard
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addInvitation}
                className="w-full md:w-auto px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                + Uitnodiging toevoegen
              </button>
            </div>
          )}

          {/* Step 3: Splitsingssleutel */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Splitsingssleutel
              </h2>
              <p className="text-gray-600">
                Definieer de eenheden en hun aandeel in de VVE.
              </p>

              {/* Validation message */}
              <div
                className={`p-4 rounded-lg ${
                  totalSharePercentage === 100
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <p
                  className={`text-sm ${
                    totalSharePercentage === 100
                      ? 'text-green-700'
                      : 'text-yellow-700'
                  }`}
                >
                  Totaal aandeel: {totalSharePercentage.toFixed(2)}%
                  {totalSharePercentage !== 100 && ' (moet 100% zijn)'}
                </p>
              </div>

              <div className="space-y-4">
                {formData.units.map((unit, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="w-full md:w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Eenheid Nr.
                      </label>
                      <input
                        type="text"
                        value={unit.unit_number}
                        onChange={(e) =>
                          updateUnit(index, 'unit_number', e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                        onChange={(e) =>
                          updateUnit(index, 'description', e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="Appartement begane grond links"
                      />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aandeel %
                      </label>
                      <input
                        type="number"
                        value={unit.share_percentage}
                        onChange={(e) =>
                          updateUnit(
                            index,
                            'share_percentage',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="25"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeUnit(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                      >
                        Verwijderen
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addUnit}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                + Eenheid toevoegen
              </button>
            </div>
          )}

          {/* Step 4: Financieel Startpakket */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Financieel Startpakket
              </h2>
              <p className="text-gray-600">
                Stel de financiële basisgegevens in voor uw VVE.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Startsaldo (€)
                  </label>
                  <input
                    type="number"
                    value={formData.financial.starting_balance}
                    onChange={(e) =>
                      updateFinancial(
                        'starting_balance',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reservefonds (€)
                  </label>
                  <input
                    type="number"
                    value={formData.financial.reserve_fund_amount}
                    onChange={(e) =>
                      updateFinancial(
                        'reserve_fund_amount',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Boekjaar
                  </label>
                  <input
                    type="date"
                    value={formData.financial.fiscal_year_start}
                    onChange={(e) =>
                      updateFinancial('fiscal_year_start', e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Documenten */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Documenten
              </h2>
              <p className="text-gray-600">
                Upload belangrijke documenten voor uw VVE (optioneel).
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-400 text-5xl mb-4">📁</div>
                <p className="text-gray-600 mb-2">
                  Sleep bestanden hierheen of klik om te uploaden
                </p>
                <p className="text-sm text-gray-400">
                  Splitsingsakte, huishoudelijk reglement, MJOP, etc.
                </p>
                <input
                  type="file"
                  multiple
                  className="mt-4"
                  onChange={() => {
                    setFormData((prev) => ({
                      ...prev,
                      documents_uploaded: true,
                    }));
                    addToast('Documenten geselecteerd', 'success');
                  }}
                />
              </div>

              {formData.documents_uploaded && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✓ Documenten zijn geselecteerd voor upload
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons - Primary action always visible at bottom */}
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
              onClick={handleFinish}
              disabled={isSaving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? 'Bezig...' : 'Onboarding Voltooien'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
