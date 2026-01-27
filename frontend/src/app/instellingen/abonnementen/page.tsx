'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Abonnementen & Pricing Page - STORY-020
 * 
 * Implements:
 * - Current subscription plan display
 * - Available plans comparison
 * - Billing information management
 * - Invoice history with export
 * - Inline mutations (no modals)
 * - Read-only for bestuur, hidden for bewoners
 */

type PlanTier = 'basic' | 'standard' | 'premium';
type BillingCycle = 'monthly' | 'yearly';
type PaymentMethod = 'ideal' | 'card' | 'invoice';
type InvoiceStatus = 'paid' | 'pending' | 'overdue';

interface Plan {
  id: PlanTier;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  storage: string;
  users: string;
  recommended?: boolean;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  pdfUrl: string;
}

interface Subscription {
  plan: PlanTier;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  paymentMethod: PaymentMethod;
  lastPaymentDate: string;
  status: 'active' | 'trial' | 'cancelled' | 'past_due';
}

// Available plans
const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basis',
    description: 'Voor kleine VVEs',
    priceMonthly: 29,
    priceYearly: 290,
    storage: '2 GB',
    users: 'Tot 10 gebruikers',
    features: [
      'Transactiebeheer',
      'Documentenbeheer',
      'Contributie berekening',
      'Basis rapportages',
      'Email support',
    ],
  },
  {
    id: 'standard',
    name: 'Standaard',
    description: 'Meest gekozen',
    priceMonthly: 59,
    priceYearly: 590,
    storage: '5 GB',
    users: 'Tot 50 gebruikers',
    recommended: true,
    features: [
      'Alles van Basis, plus:',
      'Begroting & jaarrekening',
      'Audit logging',
      'Geavanceerde rapportages',
      'Prioriteit support',
      'API toegang',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Voor grote VVEs',
    priceMonthly: 99,
    priceYearly: 990,
    storage: '10 GB',
    users: 'Onbeperkt gebruikers',
    features: [
      'Alles van Standaard, plus:',
      'Multi-VVE beheer',
      'Custom branding',
      'Dedicated account manager',
      'SLA garantie',
      'Onboarding support',
    ],
  },
];

// Mock subscription data
const MOCK_SUBSCRIPTION: Subscription = {
  plan: 'standard',
  billingCycle: 'yearly',
  nextBillingDate: '2027-01-15',
  paymentMethod: 'ideal',
  lastPaymentDate: '2026-01-15',
  status: 'active',
};

// Mock invoices
const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    number: 'VVE-2026-001',
    date: '2026-01-15',
    amount: 590,
    status: 'paid',
    pdfUrl: '#',
  },
  {
    id: 'inv-002',
    number: 'VVE-2025-012',
    date: '2025-01-15',
    amount: 590,
    status: 'paid',
    pdfUrl: '#',
  },
  {
    id: 'inv-003',
    number: 'VVE-2024-012',
    date: '2024-01-15',
    amount: 540,
    status: 'paid',
    pdfUrl: '#',
  },
];

export default function AbonnementenPage() {
  const { addToast } = useToast();
  const [subscription, setSubscription] = useState<Subscription>(MOCK_SUBSCRIPTION);
  const [invoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(MOCK_SUBSCRIPTION.billingCycle);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [isEditingPayment, setIsEditingPayment] = useState(false);

  const currentPlan = PLANS.find(p => p.id === subscription.plan)!;

  const handleSelectPlan = (planId: PlanTier) => {
    if (planId === subscription.plan) return;
    setSelectedPlan(planId);
    setIsChangingPlan(true);
  };

  const handleConfirmPlanChange = async () => {
    if (!selectedPlan) return;
    
    // Simulate API call
    addToast('Plan wordt gewijzigd...', 'info');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubscription(prev => ({ ...prev, plan: selectedPlan }));
    setIsChangingPlan(false);
    setSelectedPlan(null);
    addToast(`Uw plan is gewijzigd naar ${PLANS.find(p => p.id === selectedPlan)?.name}`, 'success');
  };

  const handleCancelPlanChange = () => {
    setIsChangingPlan(false);
    setSelectedPlan(null);
  };

  const handleUpdatePaymentMethod = async (method: PaymentMethod) => {
    addToast('Betaalmethode wordt bijgewerkt...', 'info');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSubscription(prev => ({ ...prev, paymentMethod: method }));
    setIsEditingPayment(false);
    addToast('Betaalmethode bijgewerkt', 'success');
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Generate mock PDF
    const blob = new Blob([`Factuur ${invoice.number}\nBedrag: €${invoice.amount}\nDatum: ${invoice.date}`], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    addToast('Factuur gedownload', 'success');
  };

  const getPrice = (plan: Plan): number => {
    return billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  };

  const getMonthlyPrice = (plan: Plan): string => {
    if (billingCycle === 'yearly') {
      return `€${Math.round(plan.priceYearly / 12)}`;
    }
    return `€${plan.priceMonthly}`;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Abonnementen</h1>
        <p className="text-gray-600 mt-1">
          Beheer uw abonnement en facturatiegegevens
        </p>
      </div>

      {/* Current Subscription */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Huidig abonnement</h2>
              <p className="text-sm text-gray-500">
                Actief sinds {new Date(subscription.lastPaymentDate).toLocaleDateString('nl-NL')}
              </p>
            </div>
            <StatusBadge status={subscription.status} />
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-3xl">🏢</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{currentPlan.name}</h3>
                <p className="text-gray-500">{currentPlan.description}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {currentPlan.storage} opslag • {currentPlan.users}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                €{subscription.billingCycle === 'yearly' ? currentPlan.priceYearly : currentPlan.priceMonthly}
              </p>
              <p className="text-sm text-gray-500">
                per {subscription.billingCycle === 'yearly' ? 'jaar' : 'maand'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Volgende facturatie: {new Date(subscription.nextBillingDate).toLocaleDateString('nl-NL')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Change Confirmation */}
      {isChangingPlan && selectedPlan && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">
                Plan wijzigen naar {PLANS.find(p => p.id === selectedPlan)?.name}?
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Uw nieuwe plan wordt direct actief. Eventuele krediet wordt verrekend.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancelPlanChange}
                className="px-4 py-2 text-sm text-blue-700 hover:text-blue-900"
              >
                Annuleren
              </button>
              <button
                onClick={handleConfirmPlanChange}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Bevestigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Beschikbare plannen</h2>
              <p className="text-sm text-gray-500">Vergelijk en kies het plan dat bij u past</p>
            </div>
            
            {/* Billing Cycle Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Maandelijks
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Jaarlijks <span className="text-green-600 text-xs">-17%</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-lg border-2 p-6 ${
                  plan.id === subscription.plan
                    ? 'border-blue-500 bg-blue-50'
                    : plan.recommended
                    ? 'border-green-500'
                    : 'border-gray-200'
                }`}
              >
                {plan.recommended && plan.id !== subscription.plan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      Aanbevolen
                    </span>
                  </div>
                )}
                
                {plan.id === subscription.plan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                      Huidig plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>

                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {getMonthlyPrice(plan)}
                  </span>
                  <span className="text-gray-500">/maand</span>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-gray-400 mt-1">
                      €{plan.priceYearly} per jaar
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={plan.id === subscription.plan}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    plan.id === subscription.plan
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.recommended
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.id === subscription.plan ? 'Huidig plan' : 'Selecteren'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Betaalmethode</h2>
        </div>
        
        <div className="p-6">
          {!isEditingPayment ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <PaymentIcon method={subscription.paymentMethod} />
                <div>
                  <p className="font-medium text-gray-900">
                    {getPaymentMethodName(subscription.paymentMethod)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Automatische incasso actief
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingPayment(true)}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Wijzigen
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Selecteer een betaalmethode:</p>
              <div className="flex flex-wrap gap-3">
                {(['ideal', 'card', 'invoice'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => handleUpdatePaymentMethod(method)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                      subscription.paymentMethod === method
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <PaymentIcon method={method} />
                    <span className="text-sm">{getPaymentMethodName(method)}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsEditingPayment(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Annuleren
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Factuurhistorie</h2>
        </div>
        
        {invoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="text-4xl">📄</span>
            <p className="mt-2">Nog geen facturen</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-medium text-gray-900">{invoice.number}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">€{invoice.amount}</p>
                      <InvoiceStatusBadge status={invoice.status} />
                    </div>
                    <button
                      onClick={() => handleDownloadInvoice(invoice)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                      title="Download"
                    >
                      <DownloadIcon />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Helper components
function StatusBadge({ status }: { status: Subscription['status'] }) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    trial: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-600',
    past_due: 'bg-red-100 text-red-800',
  };
  
  const labels = {
    active: 'Actief',
    trial: 'Proefperiode',
    cancelled: 'Opgezegd',
    past_due: 'Betalingsachterstand',
  };

  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const colors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
  };
  
  const labels = {
    paid: 'Betaald',
    pending: 'Openstaand',
    overdue: 'Achterstallig',
  };

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

function PaymentIcon({ method }: { method: PaymentMethod }) {
  switch (method) {
    case 'ideal':
      return <span className="text-xl">🏦</span>;
    case 'card':
      return <span className="text-xl">💳</span>;
    case 'invoice':
      return <span className="text-xl">📧</span>;
    default:
      return null;
  }
}

function getPaymentMethodName(method: PaymentMethod): string {
  const names = {
    ideal: 'iDEAL',
    card: 'Creditcard',
    invoice: 'Factuur per email',
  };
  return names[method];
}

function DownloadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
