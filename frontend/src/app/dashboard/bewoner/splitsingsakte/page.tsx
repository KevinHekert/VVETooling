'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Splitsingsakte Bewoners View - STORY-043
 * 
 * Shows the active splitsingsakte version to residents (bewoners):
 * - Active version with status label
 * - Download link for the document
 * - Summary of amendments
 * - Read-only view (no edit capabilities)
 */

interface SplitsingsaktePublicVersion {
  id: string;
  name: string;
  version_number: number;
  effective_date: string;
  description?: string;
  document_name?: string;
  document_url?: string;
  amendments_count: number;
  last_updated: string;
}

interface AmendmentSummary {
  id: string;
  title: string;
  amendment_type: 'wijziging' | 'toevoeging' | 'correctie' | 'verduidelijking';
  effective_date: string;
}

// Mock data for demo
const MOCK_ACTIVE_VERSION: SplitsingsaktePublicVersion = {
  id: 'version-active',
  name: 'Splitsingsakte VVE Parkzicht 2024',
  version_number: 3,
  effective_date: '2024-01-15',
  description: 'Geactualiseerde splitsingsakte na samenvoeging appartementen en aanpassing gemeenschappelijke ruimtes.',
  document_name: 'Splitsingsakte_VVE_Parkzicht_2024.pdf',
  document_url: '#',
  amendments_count: 3,
  last_updated: '2025-06-15',
};

const MOCK_AMENDMENTS: AmendmentSummary[] = [
  {
    id: 'amend-1',
    title: 'Wijziging artikel 5 - Gemeenschappelijke ruimtes',
    amendment_type: 'toevoeging',
    effective_date: '2025-06-15',
  },
  {
    id: 'amend-2',
    title: 'Wijziging breukdelen appartementen 4B en 4C',
    amendment_type: 'wijziging',
    effective_date: '2025-03-15',
  },
  {
    id: 'amend-3',
    title: 'Correctie kostenverdeelsleutel bijlage 2',
    amendment_type: 'correctie',
    effective_date: '2025-01-20',
  },
];

const AMENDMENT_TYPE_LABELS = {
  wijziging: { label: 'Wijziging', color: 'bg-blue-100 text-blue-700' },
  toevoeging: { label: 'Toevoeging', color: 'bg-green-100 text-green-700' },
  correctie: { label: 'Correctie', color: 'bg-red-100 text-red-700' },
  verduidelijking: { label: 'Verduidelijking', color: 'bg-purple-100 text-purple-700' },
};

export default function BewonersSpitsingasktePage() {
  const { addToast } = useToast();
  const [version, setVersion] = useState<SplitsingsaktePublicVersion | null>(null);
  const [amendments, setAmendments] = useState<AmendmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAmendments, setShowAmendments] = useState(false);

  useEffect(() => {
    // Simulate loading active version
    const loadActiveVersion = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      setVersion(MOCK_ACTIVE_VERSION);
      setAmendments(MOCK_AMENDMENTS);
      setIsLoading(false);
    };
    loadActiveVersion();
  }, []);

  const handleDownload = () => {
    if (!version?.document_name) {
      addToast('Geen document beschikbaar', 'error');
      return;
    }
    
    // Mock download
    addToast(`${version.document_name} wordt gedownload`, 'info');
    
    // In production, this would trigger a real download
    // window.open(version.document_url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!version) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <span className="text-5xl">📄</span>
          <h2 className="text-xl font-medium text-gray-900 mt-4">Geen splitsingsakte beschikbaar</h2>
          <p className="text-gray-500 mt-2">
            Er is nog geen splitsingsakte gepubliceerd door het bestuur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Splitsingsakte</h1>
        <p className="text-gray-600 mt-1">
          De actuele splitsingsakte van uw VVE
        </p>
      </div>

      {/* Active Version Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          {/* Status and Title */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  ✓ Actief
                </span>
                <span className="text-sm text-gray-500">
                  Versie {version.version_number}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{version.name}</h2>
            </div>
            <span className="text-3xl">📜</span>
          </div>

          {/* Description */}
          {version.description && (
            <p className="text-gray-600 mt-4">{version.description}</p>
          )}

          {/* Metadata */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Ingangsdatum</dt>
              <dd className="font-medium text-gray-900">
                {new Date(version.effective_date).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Laatst bijgewerkt</dt>
              <dd className="font-medium text-gray-900">
                {new Date(version.last_updated).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </dd>
            </div>
          </div>

          {/* Download Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DownloadIcon />
              Download Splitsingsakte (PDF)
            </button>
            {version.document_name && (
              <p className="text-sm text-gray-500 mt-2">
                {version.document_name}
              </p>
            )}
          </div>
        </div>

        {/* Amendments Section */}
        {amendments.length > 0 && (
          <div className="border-t border-gray-200">
            <button
              onClick={() => setShowAmendments(!showAmendments)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">Aanvullingen</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {amendments.length}
                </span>
              </div>
              <ChevronIcon expanded={showAmendments} />
            </button>

            {showAmendments && (
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-500 mb-4">
                  Wijzigingen en aanvullingen op de splitsingsakte sinds publicatie:
                </p>
                <ul className="space-y-3">
                  {amendments.map((amendment) => (
                    <li
                      key={amendment.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          AMENDMENT_TYPE_LABELS[amendment.amendment_type].color
                        }`}>
                          {AMENDMENT_TYPE_LABELS[amendment.amendment_type].label}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {amendment.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Per {new Date(amendment.effective_date).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900">Vragen over de splitsingsakte?</h3>
        <p className="text-sm text-blue-700 mt-1">
          Neem contact op met het bestuur als u vragen heeft over de splitsingsakte of de aanvullingen.
        </p>
      </div>
    </div>
  );
}

// Icon components
function DownloadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
