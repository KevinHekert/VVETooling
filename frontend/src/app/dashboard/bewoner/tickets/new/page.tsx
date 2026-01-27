'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { api } from '@/lib/api';
import type { TicketCategory, TicketCreate, TicketDraft } from '@/types';

/**
 * Ticket Wizard - STORY-029: Bewoner ticket wizard en tijdlijn
 * 
 * Multi-step wizard for creating a new ticket:
 * 1. Category selection
 * 2. Location and description
 * 3. Attachments (optional)
 * 4. Summary and submit
 * 
 * UX requirements:
 * - Progress indicator
 * - Inline validation (no modals)
 * - Mobile-first with primary action at bottom
 * - Ability to pause and resume (localStorage draft)
 */

const WIZARD_STEPS = [
  { id: 'category', label: 'Categorie' },
  { id: 'details', label: 'Details' },
  { id: 'attachments', label: 'Bewijsstukken' },
  { id: 'summary', label: 'Samenvatting' },
];

const CATEGORIES: { value: TicketCategory; label: string; icon: string }[] = [
  { value: 'maintenance', label: 'Onderhoud', icon: '🔧' },
  { value: 'noise', label: 'Geluidsoverlast', icon: '🔊' },
  { value: 'safety', label: 'Veiligheid', icon: '⚠️' },
  { value: 'cleaning', label: 'Schoonmaak', icon: '🧹' },
  { value: 'facilities', label: 'Faciliteiten', icon: '🏢' },
  { value: 'other', label: 'Overig', icon: '📝' },
];

const DRAFT_STORAGE_KEY = 'vve_ticket_draft';

export default function NewTicketPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [draft, setDraft] = useState<TicketDraft>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Ignore parse errors
        }
      }
    }
    return { step: 1 };
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  // Save draft to localStorage
  const saveDraft = (updates: Partial<TicketDraft>) => {
    const newDraft = { ...draft, ...updates, step: currentStep + 1 };
    setDraft(newDraft);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(newDraft));
    }
  };

  // Clear draft from localStorage
  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  };

  // Validation
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!draft.category;
      case 1:
        return !!draft.title && draft.title.length >= 3 && 
               !!draft.description && draft.description.length >= 10;
      case 2:
        return true; // Attachments are optional
      case 3:
        return true; // Summary step
      default:
        return false;
    }
  };

  // Navigation
  const goNext = () => {
    if (isStepValid(currentStep) && currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      saveDraft({ step: currentStep + 2 });
    }
  };

  const goPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit ticket
  const handleSubmit = async () => {
    if (!draft.category || !draft.title || !draft.description) {
      setError('Vul alle verplichte velden in');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Get VVE ID from context/session
      const vveId = 'demo-vve-id';
      
      const ticketData: TicketCreate = {
        title: draft.title,
        description: draft.description,
        category: draft.category,
        location: draft.location,
      };

      const ticket = await api.createTicket(vveId, ticketData);

      // Upload attachments if any
      for (const file of attachments) {
        await api.uploadTicketAttachment(vveId, ticket.id, file);
      }

      clearDraft();
      setSuccess(true);
      
      // Redirect to ticket detail page after short delay
      setTimeout(() => {
        router.push(`/dashboard/bewoner/tickets/${ticket.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon ticket niet indienen');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} is te groot. Maximum is 10 MB.`);
          return false;
        }
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          setError(`${file.name} heeft een niet-ondersteund formaat.`);
          return false;
        }
        return true;
      });
      setAttachments([...attachments, ...newFiles]);
      setError(null);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-xl font-bold text-green-800">Ticket ingediend!</h2>
          <p className="text-green-600 mt-2">
            Uw melding is succesvol ontvangen. U wordt doorgestuurd naar de ticket-pagina...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nieuwe Melding</h1>
        <p className="text-gray-600">Maak een melding of klacht aan</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <ProgressIndicator
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onStepClick={(step) => step < currentStep && setCurrentStep(step)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {/* Step 1: Category */}
        {currentStep === 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Kies een categorie
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => saveDraft({ category: cat.value })}
                  className={`
                    p-4 rounded-lg border-2 text-center transition-all
                    ${draft.category === cat.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="text-sm font-medium text-gray-700">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Beschrijf uw melding
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel *
              </label>
              <input
                type="text"
                value={draft.title || ''}
                onChange={(e) => saveDraft({ title: e.target.value })}
                placeholder="Korte omschrijving van het probleem"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                minLength={3}
                maxLength={200}
              />
              {draft.title && draft.title.length < 3 && (
                <p className="text-sm text-red-500 mt-1">Titel moet minimaal 3 karakters bevatten</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Locatie
              </label>
              <input
                type="text"
                value={draft.location || ''}
                onChange={(e) => saveDraft({ location: e.target.value })}
                placeholder="Bijv. 3e verdieping, trapportaal"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschrijving *
              </label>
              <textarea
                value={draft.description || ''}
                onChange={(e) => saveDraft({ description: e.target.value })}
                placeholder="Beschrijf het probleem in detail..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                minLength={10}
                maxLength={5000}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                {draft.description && draft.description.length < 10 && (
                  <p className="text-red-500">Beschrijving moet minimaal 10 karakters bevatten</p>
                )}
                <span className="ml-auto">{draft.description?.length || 0} / 5000</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Attachments */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Bewijsstukken toevoegen
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Voeg foto&apos;s of documenten toe om uw melding te ondersteunen (optioneel).
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-700"
              >
                <div className="text-4xl mb-2">📎</div>
                <span className="font-medium">Klik om bestanden te uploaden</span>
                <p className="text-sm text-gray-500 mt-1">
                  PDF, JPEG, PNG of WebP (max. 10 MB per bestand)
                </p>
              </label>
            </div>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">
                        {file.type.includes('pdf') ? '📄' : '🖼️'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Summary */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Samenvatting
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Controleer uw melding voordat u deze indient.
            </p>

            <dl className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <dt className="text-sm font-medium text-gray-500">Categorie</dt>
                <dd className="text-sm text-gray-900">
                  {CATEGORIES.find(c => c.value === draft.category)?.label || '-'}
                </dd>
              </div>
              <div className="py-2 border-b">
                <dt className="text-sm font-medium text-gray-500 mb-1">Titel</dt>
                <dd className="text-sm text-gray-900">{draft.title || '-'}</dd>
              </div>
              {draft.location && (
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-sm font-medium text-gray-500">Locatie</dt>
                  <dd className="text-sm text-gray-900">{draft.location}</dd>
                </div>
              )}
              <div className="py-2 border-b">
                <dt className="text-sm font-medium text-gray-500 mb-1">Beschrijving</dt>
                <dd className="text-sm text-gray-900 whitespace-pre-wrap">
                  {draft.description || '-'}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-sm font-medium text-gray-500">Bijlagen</dt>
                <dd className="text-sm text-gray-900">{attachments.length} bestand(en)</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Navigation Buttons - Mobile-first with primary action at bottom */}
      <div className="flex flex-col-reverse md:flex-row md:justify-between gap-3">
        {currentStep > 0 && (
          <button
            onClick={goPrevious}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Vorige
          </button>
        )}
        
        <div className="flex-1 md:flex-none md:ml-auto">
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <button
              onClick={goNext}
              disabled={!isStepValid(currentStep)}
              className={`
                w-full md:w-auto px-6 py-3 rounded-lg font-medium
                ${isStepValid(currentStep)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Volgende
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`
                w-full md:w-auto px-6 py-3 rounded-lg font-medium
                ${isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }
              `}
            >
              {isSubmitting ? 'Bezig met indienen...' : 'Melding Indienen'}
            </button>
          )}
        </div>
      </div>

      {/* Save Draft Link */}
      <div className="mt-4 text-center">
        <button
          onClick={() => router.push('/dashboard/bewoner/tickets')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Opslaan en later verder gaan
        </button>
      </div>
    </div>
  );
}
