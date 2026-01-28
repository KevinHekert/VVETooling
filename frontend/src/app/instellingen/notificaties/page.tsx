'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Notification Preferences Page - STORY-099
 * 
 * Als eigenaar wil ik mijn notificatie-voorkeuren kunnen instellen per kanaal 
 * en type, zodat ik alleen relevante berichten ontvang.
 * 
 * Features:
 * - Toggle per notificatie-type (ALV, betalingen, onderhoud)
 * - Kanaal selectie per type (email, push, SMS)
 * - Digest optie (direct, dagelijks, wekelijks)
 * - Test notificatie functie
 */

type NotificationChannel = 'email' | 'push' | 'sms';
type DigestFrequency = 'direct' | 'daily' | 'weekly';

interface NotificationPreference {
  id: string;
  category: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface NotificationSettings {
  preferences: NotificationPreference[];
  digestFrequency: DigestFrequency;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  emailAddress: string;
  phoneNumber: string;
}

const INITIAL_PREFERENCES: NotificationPreference[] = [
  {
    id: 'alv',
    category: 'Vergaderingen',
    label: 'ALV uitnodigingen',
    description: 'Uitnodigingen en herinneringen voor Algemene Ledenvergaderingen',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'alv_reminder',
    category: 'Vergaderingen',
    label: 'ALV herinneringen',
    description: 'Herinneringen 1 dag voor de vergadering',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'notulen',
    category: 'Vergaderingen',
    label: 'Notulen beschikbaar',
    description: 'Notificatie wanneer notulen zijn gepubliceerd',
    email: true,
    push: false,
    sms: false,
  },
  {
    id: 'contributie',
    category: 'Financiën',
    label: 'Contributie herinneringen',
    description: 'Herinneringen voor openstaande contributies',
    email: true,
    push: true,
    sms: true,
  },
  {
    id: 'betaling_ontvangen',
    category: 'Financiën',
    label: 'Betaling ontvangen',
    description: 'Bevestiging wanneer uw betaling is verwerkt',
    email: true,
    push: false,
    sms: false,
  },
  {
    id: 'jaarrekening',
    category: 'Financiën',
    label: 'Jaarrekening beschikbaar',
    description: 'Notificatie wanneer de jaarrekening is gepubliceerd',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'onderhoud_gepland',
    category: 'Onderhoud',
    label: 'Gepland onderhoud',
    description: 'Informatie over gepland onderhoud aan het gebouw',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'onderhoud_urgent',
    category: 'Onderhoud',
    label: 'Urgent onderhoud',
    description: 'Dringende berichten over storingen of urgent onderhoud',
    email: true,
    push: true,
    sms: true,
  },
  {
    id: 'ticket_update',
    category: 'Service',
    label: 'Ticket updates',
    description: 'Updates over uw ingediende serviceverzoeken',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'document_nieuw',
    category: 'Documenten',
    label: 'Nieuwe documenten',
    description: 'Notificatie wanneer nieuwe documenten zijn toegevoegd',
    email: true,
    push: false,
    sms: false,
  },
  {
    id: 'stemming',
    category: 'Stemmen',
    label: 'Stemming geopend',
    description: 'Notificatie wanneer een nieuwe stemming is geopend',
    email: true,
    push: true,
    sms: false,
  },
];

const DIGEST_OPTIONS = [
  { value: 'direct', label: 'Direct', description: 'Ontvang notificaties onmiddellijk' },
  { value: 'daily', label: 'Dagelijks', description: 'Eén samenvatting per dag om 09:00' },
  { value: 'weekly', label: 'Wekelijks', description: 'Eén samenvatting per week op maandag' },
];

export default function NotificationPreferencesPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [settings, setSettings] = useState<NotificationSettings>({
    preferences: INITIAL_PREFERENCES,
    digestFrequency: 'direct',
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    emailAddress: 'gebruiker@example.nl',
    phoneNumber: '+31612345678',
  });

  useEffect(() => {
    const loadSettings = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      // In production, load from API
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const toggleChannel = (prefId: string, channel: NotificationChannel) => {
    setSettings(prev => ({
      ...prev,
      preferences: prev.preferences.map(p => 
        p.id === prefId ? { ...p, [channel]: !p[channel] } : p
      ),
    }));
    setHasChanges(true);
  };

  const toggleAllForCategory = (category: string, channel: NotificationChannel, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      preferences: prev.preferences.map(p => 
        p.category === category ? { ...p, [channel]: value } : p
      ),
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    // In production, save to API
    setIsSaving(false);
    setHasChanges(false);
    addToast('Notificatie voorkeuren opgeslagen', 'success');
  };

  const handleTestNotification = async (channel: NotificationChannel) => {
    addToast(`Test ${channel} notificatie verzonden`, 'success');
  };

  // Group preferences by category
  const categorizedPrefs = settings.preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) acc[pref.category] = [];
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, NotificationPreference[]>);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔔 Notificatie Voorkeuren</h1>
          <p className="text-gray-600 mt-1">
            Bepaal hoe en wanneer u berichten wilt ontvangen
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
            hasChanges 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? 'Opslaan...' : '💾 Opslaan'}
        </button>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          ⚠️ U heeft onopgeslagen wijzigingen
        </div>
      )}

      {/* Contact Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Contactgegevens</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mailadres
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={settings.emailAddress}
                onChange={(e) => {
                  setSettings(prev => ({ ...prev, emailAddress: e.target.value }));
                  setHasChanges(true);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => handleTestNotification('email')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Test
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefoonnummer (voor SMS)
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={settings.phoneNumber}
                onChange={(e) => {
                  setSettings(prev => ({ ...prev, phoneNumber: e.target.value }));
                  setHasChanges(true);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => handleTestNotification('sms')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Digest Frequency */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Frequentie</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DIGEST_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSettings(prev => ({ ...prev, digestFrequency: option.value as DigestFrequency }));
                setHasChanges(true);
              }}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                settings.digestFrequency === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{option.label}</p>
              <p className="text-sm text-gray-500 mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Stille uren</h2>
            <p className="text-sm text-gray-500">Geen push of SMS notificaties tijdens deze periode</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.quietHoursEnabled}
              onChange={(e) => {
                setSettings(prev => ({ ...prev, quietHoursEnabled: e.target.checked }));
                setHasChanges(true);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        {settings.quietHoursEnabled && (
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Van</label>
              <input
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) => {
                  setSettings(prev => ({ ...prev, quietHoursStart: e.target.value }));
                  setHasChanges(true);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <span className="text-gray-400 mt-6">→</span>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tot</label>
              <input
                type="time"
                value={settings.quietHoursEnd}
                onChange={(e) => {
                  setSettings(prev => ({ ...prev, quietHoursEnd: e.target.value }));
                  setHasChanges(true);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Notification Matrix */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Notificatie-instellingen per type</h2>
          <p className="text-sm text-gray-500 mt-1">Selecteer per notificatietype via welk kanaal u berichten wilt ontvangen</p>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">📧 Email</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">📱 Push</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">💬 SMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(categorizedPrefs).map(([category, prefs]) => (
                <>
                  {/* Category Header */}
                  <tr key={`cat-${category}`} className="bg-gray-50">
                    <td className="px-6 py-2">
                      <span className="font-medium text-gray-700">{category}</span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => toggleAllForCategory(category, 'email', !prefs.every(p => p.email))}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {prefs.every(p => p.email) ? 'Alles uit' : 'Alles aan'}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => toggleAllForCategory(category, 'push', !prefs.every(p => p.push))}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {prefs.every(p => p.push) ? 'Alles uit' : 'Alles aan'}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => toggleAllForCategory(category, 'sms', !prefs.every(p => p.sms))}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {prefs.every(p => p.sms) ? 'Alles uit' : 'Alles aan'}
                      </button>
                    </td>
                  </tr>
                  {/* Individual Preferences */}
                  {prefs.map((pref) => (
                    <tr key={pref.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                        <p className="text-xs text-gray-500">{pref.description}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={pref.email}
                          onChange={() => toggleChannel(pref.id, 'email')}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={pref.push}
                          onChange={() => toggleChannel(pref.id, 'push')}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={pref.sms}
                          onChange={() => toggleChannel(pref.id, 'sms')}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {Object.entries(categorizedPrefs).map(([category, prefs]) => (
            <div key={`mobile-${category}`}>
              <div className="px-4 py-2 bg-gray-50">
                <span className="font-medium text-gray-700">{category}</span>
              </div>
              {prefs.map((pref) => (
                <div key={pref.id} className="p-4">
                  <p className="font-medium text-gray-900">{pref.label}</p>
                  <p className="text-xs text-gray-500 mb-3">{pref.description}</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pref.email}
                        onChange={() => toggleChannel(pref.id, 'email')}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-600">📧 Email</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pref.push}
                        onChange={() => toggleChannel(pref.id, 'push')}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-600">📱 Push</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pref.sms}
                        onChange={() => toggleChannel(pref.id, 'sms')}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-600">💬 SMS</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-1">ℹ️ Over notificaties</h3>
        <p className="text-sm text-blue-700">
          SMS-notificaties zijn alleen beschikbaar voor urgente berichten. 
          Standaard kosten kunnen van toepassing zijn bij uw provider.
          Push-notificaties vereisen dat u de app heeft geïnstalleerd.
        </p>
      </div>
    </div>
  );
}
