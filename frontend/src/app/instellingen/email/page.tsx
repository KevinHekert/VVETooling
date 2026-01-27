'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Email Configuration Page - STORY-048
 * 
 * Implements:
 * - Email provider selection (Mailchimp, Amazon SES, SendGrid)
 * - Provider-specific credential fields
 * - Masked credential display after saving
 * - Test email sending
 * - Configuration status display
 */

type EmailProvider = 'mailchimp' | 'amazon_ses' | 'sendgrid';
type ConfigStatus = 'active' | 'not_configured' | 'invalid';

interface EmailConfig {
  id?: string;
  provider_type: EmailProvider;
  sender_email: string;
  sender_name: string;
  status: ConfigStatus;
  is_active: boolean;
  // Masked credentials (for display only)
  mailchimp_api_key?: string;
  ses_access_key_id?: string;
  ses_secret_access_key?: string;
  ses_region?: string;
  sendgrid_api_key?: string;
}

interface ProviderConfig {
  name: string;
  icon: string;
  description: string;
  fields: ProviderField[];
  docsUrl: string;
}

interface ProviderField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'password';
  required: boolean;
}

const PROVIDERS: Record<EmailProvider, ProviderConfig> = {
  mailchimp: {
    name: 'Mailchimp',
    icon: '📧',
    description: 'Mailchimp Transactional (Mandrill) voor betrouwbare e-mail verzending',
    docsUrl: 'https://mailchimp.com/developer/transactional/',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        placeholder: 'mc-xxxxxxxxxxxxxxxx',
        type: 'password',
        required: true,
      },
    ],
  },
  amazon_ses: {
    name: 'Amazon SES',
    icon: '☁️',
    description: 'Amazon Simple Email Service voor schaalbare e-mail infrastructuur',
    docsUrl: 'https://docs.aws.amazon.com/ses/',
    fields: [
      {
        key: 'access_key_id',
        label: 'Access Key ID',
        placeholder: 'AKIAIOSFODNN7EXAMPLE',
        type: 'password',
        required: true,
      },
      {
        key: 'secret_access_key',
        label: 'Secret Access Key',
        placeholder: 'wJalrXUtnFEMI...',
        type: 'password',
        required: true,
      },
      {
        key: 'region',
        label: 'Region',
        placeholder: 'eu-west-1',
        type: 'text',
        required: true,
      },
    ],
  },
  sendgrid: {
    name: 'SendGrid',
    icon: '✉️',
    description: 'SendGrid voor marketing en transactional e-mails',
    docsUrl: 'https://docs.sendgrid.com/',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        placeholder: 'SG.xxxxxxxxxxxxxxxx',
        type: 'password',
        required: true,
      },
    ],
  },
};

const AWS_REGIONS = [
  { value: 'eu-west-1', label: 'EU (Ireland)' },
  { value: 'eu-central-1', label: 'EU (Frankfurt)' },
  { value: 'eu-west-2', label: 'EU (London)' },
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
];

export default function EmailConfigPage() {
  const { addToast } = useToast();
  
  // Current configuration state
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  // Form state
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [testEmail, setTestEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmChange, setShowConfirmChange] = useState(false);

  // Load existing configuration
  useEffect(() => {
    loadConfiguration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - in production would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock: Check localStorage for saved config
      const saved = localStorage.getItem('vve_email_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        setSelectedProvider(parsed.provider_type);
        setSenderEmail(parsed.sender_email);
        setSenderName(parsed.sender_name || '');
      }
    } catch {
      addToast('Fout bij laden configuratie', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSelect = (provider: EmailProvider) => {
    if (config?.is_active && provider !== config.provider_type) {
      setShowConfirmChange(true);
      return;
    }
    
    setSelectedProvider(provider);
    setCredentials({});
    setIsEditing(true);
  };

  const handleConfirmProviderChange = () => {
    setShowConfirmChange(false);
    setIsEditing(true);
    setCredentials({});
  };

  const handleSave = async () => {
    if (!selectedProvider) {
      addToast('Selecteer een provider', 'error');
      return;
    }

    if (!senderEmail) {
      addToast('Vul een sender e-mailadres in', 'error');
      return;
    }

    // Validate required fields
    const providerConfig = PROVIDERS[selectedProvider];
    for (const field of providerConfig.fields) {
      if (field.required && !credentials[field.key]) {
        addToast(`Vul ${field.label} in`, 'error');
        return;
      }
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create masked config for display
      const newConfig: EmailConfig = {
        id: config?.id || crypto.randomUUID(),
        provider_type: selectedProvider,
        sender_email: senderEmail,
        sender_name: senderName,
        status: 'not_configured',
        is_active: false,
      };

      // Add masked credentials
      if (selectedProvider === 'mailchimp') {
        newConfig.mailchimp_api_key = maskCredential(credentials.api_key);
      } else if (selectedProvider === 'amazon_ses') {
        newConfig.ses_access_key_id = maskCredential(credentials.access_key_id);
        newConfig.ses_secret_access_key = maskCredential(credentials.secret_access_key);
        newConfig.ses_region = credentials.region;
      } else if (selectedProvider === 'sendgrid') {
        newConfig.sendgrid_api_key = maskCredential(credentials.api_key);
      }

      // Save to localStorage (would be API in production)
      localStorage.setItem('vve_email_config', JSON.stringify(newConfig));
      localStorage.setItem('vve_email_credentials', JSON.stringify({
        provider: selectedProvider,
        ...credentials,
      }));

      setConfig(newConfig);
      setIsEditing(false);
      addToast('Configuratie opgeslagen', 'success');
    } catch {
      addToast('Fout bij opslaan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      addToast('Vul een test e-mailadres in', 'error');
      return;
    }

    setIsTesting(true);
    try {
      addToast('Test e-mail wordt verstuurd...', 'info');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success (50% chance for demo)
      const success = Math.random() > 0.3;
      
      if (success) {
        // Update config to active
        const updatedConfig = { ...config!, status: 'active' as ConfigStatus, is_active: true };
        setConfig(updatedConfig);
        localStorage.setItem('vve_email_config', JSON.stringify(updatedConfig));
        
        addToast('Test e-mail succesvol verzonden! Configuratie is nu actief.', 'success');
      } else {
        const updatedConfig = { ...config!, status: 'invalid' as ConfigStatus };
        setConfig(updatedConfig);
        localStorage.setItem('vve_email_config', JSON.stringify(updatedConfig));
        
        addToast('Test mislukt: Controleer uw credentials', 'error');
      }
    } catch {
      addToast('Fout bij testen', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Weet u zeker dat u de e-mail configuratie wilt verwijderen?')) {
      return;
    }

    try {
      localStorage.removeItem('vve_email_config');
      localStorage.removeItem('vve_email_credentials');
      setConfig(null);
      setSelectedProvider(null);
      setSenderEmail('');
      setSenderName('');
      setCredentials({});
      addToast('Configuratie verwijderd', 'success');
    } catch {
      addToast('Fout bij verwijderen', 'error');
    }
  };

  const maskCredential = (value: string): string => {
    if (!value || value.length <= 4) return '****';
    return '*'.repeat(value.length - 4) + value.slice(-4);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">E-mail Configuratie</h1>
        <p className="text-gray-600 mt-1">
          Configureer de e-mail provider voor het versturen van correspondentie en notificaties
        </p>
      </div>

      {/* Provider Change Confirmation */}
      {showConfirmChange && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-yellow-900">
                Weet u zeker dat u van provider wilt wisselen?
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                De huidige configuratie wordt overschreven. Een nieuwe test is vereist.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmChange(false)}
                className="px-4 py-2 text-sm text-yellow-700 hover:text-yellow-900"
              >
                Annuleren
              </button>
              <button
                onClick={handleConfirmProviderChange}
                className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Bevestigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Status */}
      {config && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Huidige configuratie</h2>
                <p className="text-sm text-gray-500">
                  {PROVIDERS[config.provider_type].name}
                </p>
              </div>
              <StatusBadge status={config.status} />
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-medium flex items-center gap-2">
                  <span>{PROVIDERS[config.provider_type].icon}</span>
                  {PROVIDERS[config.provider_type].name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sender</p>
                <p className="font-medium">
                  {config.sender_name ? `${config.sender_name} <${config.sender_email}>` : config.sender_email}
                </p>
              </div>
              {config.ses_region && (
                <div>
                  <p className="text-sm text-gray-500">AWS Region</p>
                  <p className="font-medium">{config.ses_region}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              {!config.is_active && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Bewerken
                </button>
              )}
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Section */}
      {config && !isEditing && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Test verzending</h2>
            <p className="text-sm text-gray-500">
              Stuur een test e-mail om de configuratie te verifiëren
            </p>
          </div>
          
          <div className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test e-mailadres
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleTest}
                disabled={isTesting || !testEmail}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isTesting ? (
                  <>
                    <LoadingSpinner />
                    Verzenden...
                  </>
                ) : (
                  <>
                    <span>📨</span>
                    Test verzending
                  </>
                )}
              </button>
            </div>
            
            {config.status === 'active' && (
              <p className="mt-3 text-sm text-green-600 flex items-center gap-2">
                <span>✓</span>
                Configuratie is geverifieerd en actief
              </p>
            )}
          </div>
        </div>
      )}

      {/* Provider Selection */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {config && !isEditing ? 'Andere providers' : 'Selecteer een provider'}
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(PROVIDERS) as EmailProvider[]).map((providerId) => {
              const provider = PROVIDERS[providerId];
              const isSelected = selectedProvider === providerId;
              const isCurrent = config?.provider_type === providerId && !isEditing;
              
              return (
                <button
                  key={providerId}
                  onClick={() => handleProviderSelect(providerId)}
                  disabled={isCurrent}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected && isEditing
                      ? 'border-blue-500 bg-blue-50'
                      : isCurrent
                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{provider.icon}</span>
                    <span className="font-medium text-gray-900">{provider.name}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                        Huidig
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{provider.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      {selectedProvider && isEditing && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{PROVIDERS[selectedProvider].icon}</span>
                <h2 className="text-lg font-medium text-gray-900">
                  {PROVIDERS[selectedProvider].name} Configuratie
                </h2>
              </div>
              <a
                href={PROVIDERS[selectedProvider].docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>📖</span>
                Documentatie
              </a>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Sender Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sender e-mailadres *
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="noreply@uwvve.nl"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dit adres moet geverifieerd zijn bij de provider
              </p>
            </div>

            {/* Sender Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sender naam (optioneel)
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="VVE Zonnepark"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Provider-specific fields */}
            {PROVIDERS[selectedProvider].fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && '*'}
                </label>
                {field.key === 'region' ? (
                  <select
                    value={credentials[field.key] || ''}
                    onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecteer regio</option>
                    {AWS_REGIONS.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label} ({region.value})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={credentials[field.key] || ''}
                    onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                )}
              </div>
            ))}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner />
                    Opslaan...
                  </>
                ) : (
                  'Opslaan'
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  if (!config) {
                    setSelectedProvider(null);
                  } else {
                    setSelectedProvider(config.provider_type);
                  }
                  setCredentials({});
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components
function StatusBadge({ status }: { status: ConfigStatus }) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    not_configured: 'bg-yellow-100 text-yellow-800',
    invalid: 'bg-red-100 text-red-800',
  };
  
  const labels = {
    active: 'Actief',
    not_configured: 'Niet geconfigureerd',
    invalid: 'Configuratie ongeldig',
  };

  const icons = {
    active: '✓',
    not_configured: '⚠',
    invalid: '✕',
  };

  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${colors[status]}`}>
      <span>{icons[status]}</span>
      {labels[status]}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
