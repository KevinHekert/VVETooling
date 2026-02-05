'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardWidget, DashboardGrid, KPICard } from '@/components/ui/RoleSwitcher';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { UserRole, ContractAlertResponse } from '@/types';

/**
 * Main Dashboard Page - STORY-009
 * Displays role-specific widgets and KPIs
 * - Beheerder: Full financial overview
 * - Bestuurslid: Read-only KPIs
 * - Bewoner: Compact status overview
 */
export default function DashboardPage() {
  const { currentRole, user } = useAuth();
  
  // Default to bewoner for demo
  const role = currentRole || 'bewoner';
  
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welkom{user?.first_name ? `, ${user.first_name}` : ''}
        </h1>
        <p className="text-gray-600">
          {getRoleDescription(role)}
        </p>
      </div>

      {/* Role-specific Dashboard Content */}
      {role === 'beheerder' && <BeheerderDashboard />}
      {role === 'penningmeester' && <PenningmeesterDashboard />}
      {role === 'bestuurslid' && <BestuurslidDashboard />}
      {role === 'bewoner' && <BewonerDashboard />}
    </div>
  );
}

function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    beheerder: 'Volledig overzicht van alle VVE activiteiten en instellingen',
    penningmeester: 'Financieel overzicht en transactiebeheer',
    bestuurslid: 'Belangrijkste KPIs en documenten van uw VVE',
    bewoner: 'Uw persoonlijke status en recente documenten',
  };
  return descriptions[role];
}

/**
 * Beheerder Dashboard - Full financial overview with editing capabilities
 */
function BeheerderDashboard() {
  return (
    <>
      {/* KPI Cards */}
      <DashboardGrid columns={4}>
        <KPICard 
          label="Totaal Saldo" 
          value="€ 45.230,00" 
          trend="up" 
          trendLabel="+12% vs vorig jaar" 
        />
        <KPICard 
          label="Reservefonds" 
          value="€ 32.500,00" 
          trend="neutral" 
          trendLabel="Conform MJOP" 
        />
        <KPICard 
          label="Openstaand" 
          value="€ 1.250,00" 
          trend="down" 
          trendLabel="3 eigenaren" 
        />
        <KPICard 
          label="Transacties" 
          value="47" 
          trend="up" 
          trendLabel="Deze maand" 
        />
      </DashboardGrid>

      {/* Widgets Row */}
      <DashboardGrid columns={2}>
        <DashboardWidget 
          title="Recente Transacties" 
          actions={
            <Link href="/dashboard/penningmeester/transactions" className="text-blue-600 text-sm hover:underline">
              Bekijk alle
            </Link>
          }
        >
          <ul className="divide-y divide-gray-100">
            {[
              { desc: 'Onderhoud lift', amount: '-€ 2.500,00', date: '25 jan' },
              { desc: 'VvE bijdrage - Unit A1', amount: '+€ 450,00', date: '24 jan' },
              { desc: 'Verzekering Q1', amount: '-€ 1.200,00', date: '22 jan' },
            ].map((tx, i) => (
              <li key={i} className="py-2 flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.desc}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>
                <span className={`text-sm font-medium ${tx.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                  {tx.amount}
                </span>
              </li>
            ))}
          </ul>
        </DashboardWidget>

        <DashboardWidget 
          title="Openstaande Acties"
          actions={
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">3 items</span>
          }
        >
          <ul className="space-y-2">
            {[
              { action: 'Begroting 2026 goedkeuren', priority: 'high' },
              { action: 'MJOP actualiseren', priority: 'medium' },
              { action: '2 uitnodigingen versturen', priority: 'low' },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <span className={`w-2 h-2 rounded-full ${
                  item.priority === 'high' ? 'bg-red-500' : 
                  item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <span className="text-sm text-gray-700">{item.action}</span>
              </li>
            ))}
          </ul>
        </DashboardWidget>
      </DashboardGrid>

      {/* Aflopen Contracten Widget (STORY-059) */}
      <ExpiringContractsWidget />

      {/* Quick Links */}
      <DashboardWidget title="Snelkoppelingen">
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/dashboard/penningmeester/transactions/new" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Transactie toevoegen
          </Link>
          <Link 
            href="/dashboard/beheerder/contracten" 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            📝 Contracten
          </Link>
          <Link 
            href="/instellingen/onboarding" 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ⚙️ Onboarding wizard
          </Link>
          <Link 
            href="/dashboard/documenten" 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            📁 Documenten
          </Link>
        </div>
      </DashboardWidget>
    </>
  );
}

/**
 * Expiring Contracts Widget - STORY-059
 * Shows contracts with upcoming notice deadlines
 */
function ExpiringContractsWidget() {
  const { currentVveId } = useAuth();
  const [alerts, setAlerts] = useState<ContractAlertResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    async function fetchAlerts() {
      if (!currentVveId) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getContractAlerts(currentVveId, true);
        // Filter to only show contracts expiring within 90 days
        const filtered = data.filter(a => a.days_until_notice <= 90);
        setAlerts(filtered);
      } catch {
        // Silently fail for demo - widget shows empty state
        setAlerts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAlerts();
  }, [currentVveId]);

  // Color coding based on urgency
  const getUrgencyColor = (daysUntilNotice: number) => {
    if (daysUntilNotice < 30) return 'bg-red-100 text-red-800 border-red-200';
    if (daysUntilNotice < 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getUrgencyDot = (daysUntilNotice: number) => {
    if (daysUntilNotice < 30) return 'bg-red-500';
    if (daysUntilNotice < 60) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const displayedAlerts = alerts.slice(0, displayCount);

  return (
    <DashboardWidget 
      title="Aflopen Contracten" 
      actions={
        <div className="flex items-center gap-2">
          <select
            value={displayCount}
            onChange={(e) => setDisplayCount(parseInt(e.target.value))}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value={5}>5 items</option>
            <option value={10}>10 items</option>
            <option value={15}>15 items</option>
          </select>
          <Link href="/dashboard/beheerder/contracten" className="text-blue-600 text-sm hover:underline">
            Bekijk alle
          </Link>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-sm text-gray-600">Geen contracten die binnen 90 dagen aflopen</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {displayedAlerts.map((alert) => (
            <li 
              key={alert.id} 
              className={`flex items-center justify-between p-3 rounded-lg border ${getUrgencyColor(alert.days_until_notice)}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${getUrgencyDot(alert.days_until_notice)}`} />
                <div>
                  <p className="text-sm font-medium">{alert.supplier_name}</p>
                  <p className="text-xs opacity-75">
                    Opzeggen voor: {new Date(alert.notice_deadline).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">
                  {alert.days_until_notice} dagen
                </span>
                {alert.is_alert_due && (
                  <span className="block text-xs">⚠️ Alert actief</span>
                )}
              </div>
            </li>
          ))}
          {alerts.length > displayCount && (
            <li className="text-center py-2">
              <Link 
                href="/dashboard/beheerder/contracten" 
                className="text-sm text-blue-600 hover:underline"
              >
                +{alerts.length - displayCount} meer bekijken
              </Link>
            </li>
          )}
        </ul>
      )}
    </DashboardWidget>
  );
}

/**
 * Penningmeester Dashboard - Financial focus
 */
function PenningmeesterDashboard() {
  return (
    <>
      <DashboardGrid columns={3}>
        <KPICard 
          label="Totaal Saldo" 
          value="€ 45.230,00" 
          trend="up" 
          trendLabel="+12%" 
        />
        <KPICard 
          label="Reservefonds" 
          value="€ 32.500,00" 
        />
        <KPICard 
          label="Openstaand" 
          value="€ 1.250,00" 
          trend="down" 
          trendLabel="3 eigenaren" 
        />
      </DashboardGrid>

      <DashboardGrid columns={2}>
        <DashboardWidget title="Recente Transacties">
          <ul className="divide-y divide-gray-100">
            {[
              { desc: 'Onderhoud lift', amount: '-€ 2.500,00' },
              { desc: 'VvE bijdrage - Unit A1', amount: '+€ 450,00' },
              { desc: 'Verzekering Q1', amount: '-€ 1.200,00' },
            ].map((tx, i) => (
              <li key={i} className="py-2 flex justify-between">
                <span className="text-sm text-gray-900">{tx.desc}</span>
                <span className={`text-sm font-medium ${tx.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                  {tx.amount}
                </span>
              </li>
            ))}
          </ul>
        </DashboardWidget>

        <DashboardWidget title="Begrotingsoverzicht">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Gerealiseerd</span>
                <span className="font-medium">€ 8.500 / € 35.000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24%' }} />
              </div>
            </div>
            <p className="text-xs text-gray-500">24% van jaarbegroting besteed</p>
          </div>
        </DashboardWidget>
      </DashboardGrid>
    </>
  );
}

/**
 * Bestuurslid Dashboard - Read-only KPIs
 */
function BestuurslidDashboard() {
  return (
    <>
      <DashboardGrid columns={3}>
        <KPICard 
          label="VVE Saldo" 
          value="€ 45.230,00" 
        />
        <KPICard 
          label="Reservefonds" 
          value="€ 32.500,00" 
        />
        <KPICard 
          label="Leden" 
          value="12" 
        />
      </DashboardGrid>

      <DashboardGrid columns={2}>
        <DashboardWidget title="Recente Documenten">
          <ul className="space-y-2">
            {[
              { name: 'Notulen ALV jan 2026', date: '24 jan' },
              { name: 'Begroting 2026 concept', date: '20 jan' },
              { name: 'Onderhoudsrapport', date: '15 jan' },
            ].map((doc, i) => (
              <li key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span>📄</span>
                  <span className="text-sm text-gray-700">{doc.name}</span>
                </div>
                <span className="text-xs text-gray-500">{doc.date}</span>
              </li>
            ))}
          </ul>
        </DashboardWidget>

        <DashboardWidget title="Openstaande Punten">
          <ul className="space-y-2">
            <li className="p-2 bg-yellow-50 rounded-lg text-sm text-yellow-800">
              ⚠️ Begroting 2026 wacht op goedkeuring
            </li>
            <li className="p-2 bg-gray-50 rounded-lg text-sm text-gray-700">
              📅 Volgende ALV: 15 maart 2026
            </li>
          </ul>
        </DashboardWidget>
      </DashboardGrid>
    </>
  );
}

/**
 * Bewoner Dashboard - Compact personal status
 */
function BewonerDashboard() {
  return (
    <>
      <DashboardGrid columns={2}>
        <KPICard 
          label="Mijn Bijdrage" 
          value="€ 450,00 / maand" 
        />
        <KPICard 
          label="Status" 
          value="Betaald ✓" 
        />
      </DashboardGrid>

      <DashboardWidget title="Mijn Recente Betalingen">
        <ul className="divide-y divide-gray-100">
          {[
            { month: 'Januari 2026', amount: '€ 450,00', status: 'Betaald' },
            { month: 'December 2025', amount: '€ 450,00', status: 'Betaald' },
            { month: 'November 2025', amount: '€ 450,00', status: 'Betaald' },
          ].map((payment, i) => (
            <li key={i} className="py-2 flex justify-between items-center">
              <span className="text-sm text-gray-900">{payment.month}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">{payment.amount}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {payment.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </DashboardWidget>

      <DashboardWidget title="Recente Documenten">
        <ul className="space-y-2">
          {[
            { name: 'Huishoudelijk reglement', date: '1 jan' },
            { name: 'Notulen ALV 2025', date: '15 dec' },
          ].map((doc, i) => (
            <li key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span>📄</span>
                <span className="text-sm text-gray-700">{doc.name}</span>
              </div>
              <Link href="/dashboard/documenten" className="text-blue-600 text-sm hover:underline">
                Bekijk
              </Link>
            </li>
          ))}
        </ul>
      </DashboardWidget>
    </>
  );
}
