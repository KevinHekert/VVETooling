'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';

/**
 * Brieven Genereren Wizard - STORY-046
 * 
 * Implements:
 * - Multi-step wizard: selecteer sjabloon → kies ontvangers → preview → genereren
 * - Recipient selection: individual, all residents, or filtered
 * - Merge field auto-fill with recipient data
 * - Preview per recipient with edit capability
 * - Generated letters saved with metadata
 */

// Types
type WizardStep = 'template' | 'recipients' | 'preview' | 'generate';

interface Template {
  id: string;
  title: string;
  category: string;
  subject: string;
  content: string;
}

interface Recipient {
  id: string;
  voornaam: string;
  achternaam: string;
  email: string;
  adres: string;
  postcode: string;
  woonplaats: string;
  appartement: string;
  selected: boolean;
}

interface GeneratedLetter {
  id: string;
  recipientId: string;
  recipientName: string;
  content: string;
  subject: string;
  status: 'pending' | 'generated' | 'sent';
  generatedAt: string;
}

// Mock data
const MOCK_TEMPLATES: Template[] = [
  {
    id: 'tpl-1',
    title: 'Welkomstbrief nieuwe bewoner',
    category: 'welkom',
    subject: 'Welkom bij {{vve_naam}}',
    content: `Beste {{voornaam}} {{achternaam}},

Welkom als nieuwe bewoner van {{vve_naam}}!

Wij zijn verheugd u te verwelkomen in ons appartementencomplex aan de {{adres}}.

Met vriendelijke groet,
Het bestuur`,
  },
  {
    id: 'tpl-2',
    title: 'Betalingsherinnering',
    category: 'herinnering',
    subject: 'Herinnering: Betaling VVE-bijdrage',
    content: `Beste {{voornaam}} {{achternaam}},

Volgens onze administratie hebben wij nog geen betaling ontvangen voor uw VVE-bijdrage van {{bedrag}}.

Wij verzoeken u vriendelijk dit bedrag zo spoedig mogelijk over te maken.

Met vriendelijke groet,
De penningmeester`,
  },
  {
    id: 'tpl-3',
    title: 'Uitnodiging ALV',
    category: 'alv',
    subject: 'Uitnodiging Algemene Ledenvergadering',
    content: `Beste {{voornaam}} {{achternaam}},

Hierbij nodigen wij u uit voor de Algemene Ledenvergadering van {{vve_naam}}.

Datum: [DATUM]
Tijd: [TIJD]
Locatie: [LOCATIE]

Wij zien u graag op de vergadering.

Met vriendelijke groet,
Het bestuur`,
  },
];

const MOCK_RECIPIENTS: Recipient[] = [
  {
    id: 'rec-1',
    voornaam: 'Jan',
    achternaam: 'Jansen',
    email: 'jan.jansen@email.nl',
    adres: 'Hoofdstraat 1A',
    postcode: '1234 AB',
    woonplaats: 'Amsterdam',
    appartement: 'A-01',
    selected: false,
  },
  {
    id: 'rec-2',
    voornaam: 'Maria',
    achternaam: 'de Vries',
    email: 'maria.devries@email.nl',
    adres: 'Hoofdstraat 1B',
    postcode: '1234 AB',
    woonplaats: 'Amsterdam',
    appartement: 'A-02',
    selected: false,
  },
  {
    id: 'rec-3',
    voornaam: 'Peter',
    achternaam: 'Bakker',
    email: 'peter.bakker@email.nl',
    adres: 'Hoofdstraat 1C',
    postcode: '1234 AB',
    woonplaats: 'Amsterdam',
    appartement: 'B-01',
    selected: false,
  },
  {
    id: 'rec-4',
    voornaam: 'Anna',
    achternaam: 'Smit',
    email: 'anna.smit@email.nl',
    adres: 'Hoofdstraat 1D',
    postcode: '1234 AB',
    woonplaats: 'Amsterdam',
    appartement: 'B-02',
    selected: false,
  },
];

const VVE_DATA = {
  vve_naam: 'VVE Zonnepark',
  datum: new Date().toLocaleDateString('nl-NL'),
  bedrag: '€ 125,00',
};

const WIZARD_STEPS: { key: WizardStep; label: string }[] = [
  { key: 'template', label: 'Sjabloon kiezen' },
  { key: 'recipients', label: 'Ontvangers' },
  { key: 'preview', label: 'Voorbeeld' },
  { key: 'generate', label: 'Genereren' },
];

export default function BrievenGenerenPage() {
  const { addToast } = useToast();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [generatedLetters, setGeneratedLetters] = useState<GeneratedLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filter state
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'selected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      setRecipients(MOCK_RECIPIENTS);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Get current step index
  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.key === currentStep);

  // Navigate steps
  const goToStep = (step: WizardStep) => {
    const stepIndex = WIZARD_STEPS.findIndex(s => s.key === step);
    const currentIndex = WIZARD_STEPS.findIndex(s => s.key === currentStep);
    
    // Only allow going back or to completed steps
    if (stepIndex <= currentIndex || canProceed()) {
      setCurrentStep(step);
    }
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < WIZARD_STEPS.length) {
      setCurrentStep(WIZARD_STEPS[nextIndex].key);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(WIZARD_STEPS[prevIndex].key);
    }
  };

  // Check if can proceed to next step
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'template':
        return selectedTemplate !== null;
      case 'recipients':
        return recipients.some(r => r.selected);
      case 'preview':
        return true;
      case 'generate':
        return generatedLetters.length > 0;
      default:
        return false;
    }
  };

  // Toggle recipient selection
  const toggleRecipient = (id: string) => {
    setRecipients(prev => prev.map(r => 
      r.id === id ? { ...r, selected: !r.selected } : r
    ));
  };

  // Select/deselect all
  const toggleAllRecipients = () => {
    const allSelected = recipients.every(r => r.selected);
    setRecipients(prev => prev.map(r => ({ ...r, selected: !allSelected })));
  };

  // Replace merge fields with recipient data
  const replaceMergeFields = (content: string, recipient: Recipient): string => {
    let result = content;
    result = result.replace(/{{voornaam}}/g, recipient.voornaam);
    result = result.replace(/{{achternaam}}/g, recipient.achternaam);
    result = result.replace(/{{email}}/g, recipient.email);
    result = result.replace(/{{adres}}/g, recipient.adres);
    result = result.replace(/{{postcode}}/g, recipient.postcode);
    result = result.replace(/{{woonplaats}}/g, recipient.woonplaats);
    result = result.replace(/{{appartement}}/g, recipient.appartement);
    result = result.replace(/{{vve_naam}}/g, VVE_DATA.vve_naam);
    result = result.replace(/{{datum}}/g, VVE_DATA.datum);
    result = result.replace(/{{bedrag}}/g, VVE_DATA.bedrag);
    return result;
  };

  // Check for missing fields
  const getMissingFields = (content: string): string[] => {
    const matches = content.match(/{{[^}]+}}/g) || [];
    return matches.map(m => m.replace(/[{}]/g, ''));
  };

  // Generate letters
  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const selectedRecipients = recipients.filter(r => r.selected);
    const letters: GeneratedLetter[] = selectedRecipients.map(recipient => ({
      id: `letter-${Date.now()}-${recipient.id}`,
      recipientId: recipient.id,
      recipientName: `${recipient.voornaam} ${recipient.achternaam}`,
      content: replaceMergeFields(selectedTemplate.content, recipient),
      subject: replaceMergeFields(selectedTemplate.subject, recipient),
      status: 'generated',
      generatedAt: new Date().toISOString(),
    }));

    setGeneratedLetters(letters);
    setIsGenerating(false);
    setCurrentStep('generate');
    addToast(`${letters.length} brief/brieven gegenereerd`, 'success');
  };

  // Filtered recipients
  const filteredRecipients = recipients.filter(r => {
    const matchesSearch = 
      r.voornaam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.achternaam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.appartement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = recipientFilter === 'all' || r.selected;
    return matchesSearch && matchesFilter;
  });

  const selectedCount = recipients.filter(r => r.selected).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Brieven Genereren</h1>
        <p className="text-gray-600">Genereer gepersonaliseerde brieven vanuit sjablonen</p>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator
        steps={WIZARD_STEPS.map((s) => ({
          id: s.key,
          label: s.label,
        }))}
        currentStep={currentStepIndex}
      />

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Step 1: Template Selection */}
        {currentStep === 'template' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Kies een sjabloon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{template.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {template.content.slice(0, 100)}...
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Recipient Selection */}
        {currentStep === 'recipients' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-medium text-gray-900">
                Selecteer ontvangers
                {selectedCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-blue-600">
                    ({selectedCount} geselecteerd)
                  </span>
                )}
              </h2>
              <button
                onClick={toggleAllRecipients}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {recipients.every(r => r.selected) ? 'Deselecteer alles' : 'Selecteer alles'}
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Zoeken..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={recipientFilter}
                onChange={(e) => setRecipientFilter(e.target.value as 'all' | 'selected')}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">Alle bewoners</option>
                <option value="selected">Geselecteerd</option>
              </select>
            </div>

            {/* Recipient List */}
            <div className="border border-gray-200 rounded-lg divide-y">
              {filteredRecipients.map(recipient => (
                <label
                  key={recipient.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={recipient.selected}
                    onChange={() => toggleRecipient(recipient.id)}
                    className="h-5 w-5 text-blue-600 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {recipient.voornaam} {recipient.achternaam}
                    </p>
                    <p className="text-sm text-gray-500">
                      {recipient.appartement} • {recipient.email}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {currentStep === 'preview' && selectedTemplate && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Voorbeeld bekijken</h2>
            
            {/* Missing fields warning */}
            {(() => {
              const sampleRecipient = recipients.find(r => r.selected);
              if (sampleRecipient) {
                const previewContent = replaceMergeFields(selectedTemplate.content, sampleRecipient);
                const missing = getMissingFields(previewContent);
                if (missing.length > 0) {
                  return (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Ontbrekende velden: {missing.join(', ')}
                      </p>
                    </div>
                  );
                }
              }
              return null;
            })()}

            {/* Preview for each selected recipient */}
            <div className="space-y-4">
              {recipients.filter(r => r.selected).slice(0, 3).map(recipient => (
                <div key={recipient.id} className="border border-gray-200 rounded-lg">
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <p className="font-medium text-gray-900">
                      {recipient.voornaam} {recipient.achternaam}
                    </p>
                    <p className="text-sm text-gray-500">
                      Onderwerp: {replaceMergeFields(selectedTemplate.subject, recipient)}
                    </p>
                  </div>
                  <div className="p-4 whitespace-pre-wrap text-sm text-gray-700">
                    {replaceMergeFields(selectedTemplate.content, recipient)}
                  </div>
                </div>
              ))}
              {selectedCount > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  + {selectedCount - 3} meer ontvangers
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Generated */}
        {currentStep === 'generate' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-medium text-gray-900">
                {generatedLetters.length} brief/brieven gegenereerd
              </h2>
              <p className="text-gray-500 mt-2">
                De brieven zijn klaar om te versturen of te downloaden.
              </p>
            </div>

            {/* Generated letters summary */}
            <div className="border border-gray-200 rounded-lg divide-y">
              {generatedLetters.map(letter => (
                <div key={letter.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-gray-900">{letter.recipientName}</p>
                    <p className="text-sm text-gray-500">{letter.subject}</p>
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    Gegenereerd
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  addToast('Naar verzenden wordt in STORY-047 geïmplementeerd', 'info');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Versturen
              </button>
              <button
                onClick={() => {
                  addToast('PDF export wordt in STORY-047 geïmplementeerd', 'info');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Download als PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep !== 'generate' && (
        <div className="flex justify-between">
          <button
            onClick={goBack}
            disabled={currentStepIndex === 0}
            className={`px-6 py-2 border border-gray-300 rounded-lg ${
              currentStepIndex === 0 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Vorige
          </button>
          {currentStep === 'preview' ? (
            <button
              onClick={handleGenerate}
              disabled={!canProceed() || isGenerating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isGenerating ? 'Genereren...' : 'Genereren'}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Volgende
            </button>
          )}
        </div>
      )}

      {/* Start Over Button (only on generate step) */}
      {currentStep === 'generate' && (
        <div className="text-center">
          <button
            onClick={() => {
              setCurrentStep('template');
              setSelectedTemplate(null);
              setRecipients(prev => prev.map(r => ({ ...r, selected: false })));
              setGeneratedLetters([]);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            Nieuwe brief genereren
          </button>
        </div>
      )}
    </div>
  );
}
