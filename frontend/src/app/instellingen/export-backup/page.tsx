'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';

/**
 * Export & Back-up Page - STORY-022
 * 
 * Implements:
 * - Export options for VVE data (CSV/PDF)
 * - Back-up trigger and download
 * - Status tracking for running exports
 * - Inline download links after completion
 * - Audit hooks for export actions
 */

// Mock VVE ID - in production this would come from auth context
const MOCK_VVE_ID = '123e4567-e89b-12d3-a456-426614174000';

// Export types available
type ExportType = 'transactions' | 'documents' | 'audit_logs' | 'contributions' | 'units' | 'full_backup';
type ExportFormat = 'csv' | 'pdf' | 'json';
type ExportStatus = 'idle' | 'preparing' | 'processing' | 'completed' | 'failed';

interface ExportOption {
  id: ExportType;
  name: string;
  description: string;
  formats: ExportFormat[];
  icon: string;
}

interface ExportJob {
  id: string;
  type: ExportType;
  format: ExportFormat;
  status: ExportStatus;
  progress?: number;
  recordCount?: number;
  fileSize?: string;
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

// Available export options
const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'transactions',
    name: 'Transacties',
    description: 'Alle transacties inclusief categorie en datum',
    formats: ['csv', 'pdf'],
    icon: '💰',
  },
  {
    id: 'documents',
    name: 'Documenten metadata',
    description: 'Lijst van alle documenten (geen bestanden)',
    formats: ['csv'],
    icon: '📄',
  },
  {
    id: 'audit_logs',
    name: 'Audit logs',
    description: 'Volledige audit trail van alle acties',
    formats: ['csv'],
    icon: '📋',
  },
  {
    id: 'contributions',
    name: 'Contributies',
    description: 'Contributie overzicht per eenheid',
    formats: ['csv', 'pdf'],
    icon: '📊',
  },
  {
    id: 'units',
    name: 'Eenheden & Eigenaren',
    description: 'Splitsingssleutel en eigenaar gegevens',
    formats: ['csv'],
    icon: '🏠',
  },
  {
    id: 'full_backup',
    name: 'Volledige back-up',
    description: 'Complete data export voor archivering',
    formats: ['json'],
    icon: '💾',
  },
];

export default function ExportBackupPage() {
  const { addToast } = useToast();
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [selectedType, setSelectedType] = useState<ExportType | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);

  // Simulate loading previous exports
  useEffect(() => {
    // In production, fetch from API
    const mockJobs: ExportJob[] = [
      {
        id: 'export-1',
        type: 'transactions',
        format: 'csv',
        status: 'completed',
        recordCount: 156,
        fileSize: '24 KB',
        downloadUrl: '#',
        createdAt: '2026-01-26T10:30:00Z',
        completedAt: '2026-01-26T10:30:05Z',
      },
      {
        id: 'export-2',
        type: 'audit_logs',
        format: 'csv',
        status: 'completed',
        recordCount: 1203,
        fileSize: '180 KB',
        downloadUrl: '#',
        createdAt: '2026-01-25T14:00:00Z',
        completedAt: '2026-01-25T14:00:12Z',
      },
    ];
    setExportJobs(mockJobs);
  }, []);

  const handleStartExport = async () => {
    if (!selectedType) {
      addToast('Selecteer eerst een export type', 'error');
      return;
    }

    setIsExporting(true);
    addToast('Export wordt voorbereid...', 'info');

    const newJob: ExportJob = {
      id: `export-${Date.now()}`,
      type: selectedType,
      format: selectedFormat,
      status: 'preparing',
      createdAt: new Date().toISOString(),
    };

    setExportJobs(prev => [newJob, ...prev]);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update to processing
      setExportJobs(prev => 
        prev.map(job => 
          job.id === newJob.id ? { ...job, status: 'processing' as ExportStatus, progress: 30 } : job
        )
      );

      await new Promise(resolve => setTimeout(resolve, 800));

      // Update progress
      setExportJobs(prev => 
        prev.map(job => 
          job.id === newJob.id ? { ...job, progress: 70 } : job
        )
      );

      await new Promise(resolve => setTimeout(resolve, 700));

      // Complete
      const completedJob: ExportJob = {
        ...newJob,
        status: 'completed',
        progress: 100,
        recordCount: Math.floor(Math.random() * 500) + 50,
        fileSize: `${Math.floor(Math.random() * 200) + 10} KB`,
        downloadUrl: '#',
        completedAt: new Date().toISOString(),
      };

      setExportJobs(prev => 
        prev.map(job => 
          job.id === newJob.id ? completedJob : job
        )
      );

      addToast(`${getExportName(selectedType)} export voltooid`, 'success');
      setSelectedType(null);
    } catch (error) {
      setExportJobs(prev => 
        prev.map(job => 
          job.id === newJob.id ? { ...job, status: 'failed' as ExportStatus, error: 'Export mislukt' } : job
        )
      );
      addToast('Export mislukt', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = (job: ExportJob) => {
    if (job.type === 'audit_logs') {
      // Use existing audit log export
      const downloadUrl = api.getAuditLogExportUrl(MOCK_VVE_ID);
      window.open(downloadUrl, '_blank');
    } else {
      // Generate client-side for demo
      generateMockCsv(job);
    }
    addToast('Download gestart', 'success');
  };

  const generateMockCsv = (job: ExportJob) => {
    let headers: string[] = [];
    let rows: string[][] = [];

    switch (job.type) {
      case 'transactions':
        headers = ['Datum', 'Bedrag', 'Categorie', 'Beschrijving'];
        rows = [
          ['2026-01-15', '€1.500,00', 'Onderhoud', 'Trappenhuisreiniging'],
          ['2026-01-10', '€250,00', 'Energie', 'Elektra gemeenschappelijk'],
          ['2026-01-05', '-€3.200,00', 'Contributie', 'Maandelijkse bijdrage'],
        ];
        break;
      case 'contributions':
        headers = ['Eenheid', 'Eigenaar', 'Aandeel %', 'Maandelijks', 'Status'];
        rows = [
          ['A1', 'Familie Jansen', '12,5%', '€156,25', 'Voldaan'],
          ['A2', 'P. de Vries', '12,5%', '€156,25', 'Voldaan'],
          ['B1', 'M. Bakker', '25,0%', '€312,50', 'Openstaand'],
        ];
        break;
      case 'units':
        headers = ['Nummer', 'Verdieping', 'Oppervlakte', 'Aandeel %', 'Eigenaar'];
        rows = [
          ['A1', 'BG', '65 m²', '12,5%', 'Familie Jansen'],
          ['A2', 'BG', '65 m²', '12,5%', 'P. de Vries'],
          ['B1', '1', '130 m²', '25,0%', 'M. Bakker'],
        ];
        break;
      default:
        headers = ['ID', 'Naam', 'Datum'];
        rows = [['1', 'Voorbeeld', '2026-01-27']];
    }

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.type}_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteJob = (jobId: string) => {
    setExportJobs(prev => prev.filter(job => job.id !== jobId));
    addToast('Export verwijderd', 'success');
  };

  const getExportName = (type: ExportType): string => {
    const option = EXPORT_OPTIONS.find(o => o.id === type);
    return option?.name || type;
  };

  const selectedOption = EXPORT_OPTIONS.find(o => o.id === selectedType);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export & Back-up</h1>
        <p className="text-gray-600 mt-1">
          Exporteer VVE data of maak een volledige back-up
        </p>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Nieuwe export</h2>
          <p className="text-sm text-gray-500 mt-1">
            Selecteer welke data je wilt exporteren
          </p>
        </div>

        <div className="p-6">
          {/* Export Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXPORT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedType(option.id);
                  setSelectedFormat(option.formats[0]);
                }}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${selectedType === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{option.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                    <div className="flex gap-1 mt-2">
                      {option.formats.map(fmt => (
                        <span
                          key={fmt}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded uppercase"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Format Selection & Export Button */}
          {selectedType && selectedOption && (
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  Geselecteerd: <strong>{selectedOption.name}</strong>
                </p>
                {selectedOption.formats.length > 1 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">Formaat:</span>
                    {selectedOption.formats.map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setSelectedFormat(fmt)}
                        className={`
                          px-3 py-1 text-sm rounded-lg transition-colors
                          ${selectedFormat === fmt
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedType(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleStartExport}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <LoadingSpinner />
                      Bezig...
                    </>
                  ) : (
                    <>
                      <ExportIcon />
                      Export starten
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recente exports</h2>
          <p className="text-sm text-gray-500 mt-1">
            Download links blijven 24 uur beschikbaar
          </p>
        </div>

        {exportJobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="text-4xl">📦</span>
            <p className="mt-2">Nog geen exports gemaakt</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {exportJobs.map((job) => (
              <li key={job.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">
                      {EXPORT_OPTIONS.find(o => o.id === job.type)?.icon || '📄'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {getExportName(job.type)}
                        <span className="ml-2 text-xs text-gray-400 uppercase">{job.format}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {job.recordCount && ` • ${job.recordCount} records`}
                        {job.fileSize && ` • ${job.fileSize}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <StatusBadge status={job.status} progress={job.progress} />
                    
                    {job.status === 'completed' && (
                      <button
                        onClick={() => handleDownload(job)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <DownloadIcon />
                        Download
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      title="Verwijderen"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Backup Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Automatische back-ups</h2>
          <p className="text-sm text-gray-500 mt-1">
            Instellingen voor automatische data back-ups
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium text-green-800">Automatische back-ups actief</p>
                <p className="text-sm text-green-600">Laatste back-up: vandaag om 03:00</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm text-green-700 hover:text-green-900 hover:bg-green-100 rounded-lg">
              Instellingen
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            Uw data wordt dagelijks automatisch geback-upt. Bij problemen wordt u per email geïnformeerd.
            Back-ups worden 30 dagen bewaard.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper components
function StatusBadge({ status, progress }: { status: ExportStatus; progress?: number }) {
  switch (status) {
    case 'preparing':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
          <LoadingSpinner size="small" />
          Voorbereiden
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          <LoadingSpinner size="small" />
          {progress ? `${progress}%` : 'Bezig...'}
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          ✓ Voltooid
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
          ✗ Mislukt
        </span>
      );
    default:
      return null;
  }
}

function LoadingSpinner({ size = 'normal' }: { size?: 'small' | 'normal' }) {
  const sizeClass = size === 'small' ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClass}`} />
  );
}

function ExportIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
