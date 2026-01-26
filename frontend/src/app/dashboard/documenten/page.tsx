'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import type { Document } from '@/types';

/**
 * Documents Page - STORY-008: Documenten delen en downloaden
 * 
 * Implements:
 * - Role-based sections: Bestuur, Bewoners, Archief
 * - Download functionality with inline feedback
 * - Share link generation
 * - Mobile-first: shows only title, date, download on mobile
 */

type DocumentSection = 'bestuur' | 'bewoners' | 'archief';

interface DocumentWithSection extends Document {
  section?: DocumentSection;
}

// Mock VVE ID - in production this would come from auth context
const MOCK_VVE_ID = '123e4567-e89b-12d3-a456-426614174000';

export default function DocumentenPage() {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState<DocumentWithSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<DocumentSection | 'all'>('all');
  const [shareModalDoc, setShareModalDoc] = useState<DocumentWithSection | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const data = await api.getDocuments(MOCK_VVE_ID);
        // Categorize documents into sections
        const categorized = data.map((doc: Document) => ({
          ...doc,
          section: categorizeDocument(doc),
        }));
        setDocuments(categorized);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kon documenten niet ophalen');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  function categorizeDocument(doc: Document): DocumentSection {
    // Archief: older than 1 year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (new Date(doc.created_at) < oneYearAgo) {
      return 'archief';
    }
    // Bestuur: not public
    if (!doc.is_public) {
      return 'bestuur';
    }
    // Bewoners: public
    return 'bewoners';
  }

  const handleDownload = async (doc: DocumentWithSection) => {
    try {
      // In production, this would fetch a signed URL from the API
      // For now, simulate download
      addToast(`Download gestart: ${doc.file_name}`, 'info');
      
      // Simulate API call for audit logging
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a mock blob and trigger download
      const mockContent = `Inhoud van ${doc.title}`;
      const blob = new Blob([mockContent], { type: doc.file_type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      addToast(`${doc.file_name} gedownload`, 'success');
    } catch {
      addToast('Download mislukt', 'error');
    }
  };

  const handleShare = (doc: DocumentWithSection) => {
    setShareModalDoc(doc);
  };

  const generateShareLink = async (doc: DocumentWithSection) => {
    try {
      // In production, this would call an API to generate a signed share link
      const shareUrl = `${window.location.origin}/documents/shared/${doc.id}?token=mock-token`;
      
      await navigator.clipboard.writeText(shareUrl);
      addToast('Link gekopieerd naar klembord', 'success');
      setShareModalDoc(null);
    } catch {
      addToast('Kon link niet kopiëren', 'error');
    }
  };

  const filteredDocuments = activeSection === 'all' 
    ? documents 
    : documents.filter(d => d.section === activeSection);

  const sectionCounts = {
    all: documents.length,
    bestuur: documents.filter(d => d.section === 'bestuur').length,
    bewoners: documents.filter(d => d.section === 'bewoners').length,
    archief: documents.filter(d => d.section === 'archief').length,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documenten</h1>
        <p className="text-gray-600">Bekijk en deel documenten van uw VVE</p>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'bestuur', 'bewoners', 'archief'] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeSection === section 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            {section === 'all' ? 'Alle' : section.charAt(0).toUpperCase() + section.slice(1)}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
              {sectionCounts[section]}
            </span>
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredDocuments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-5xl mb-4">📁</div>
            <p>Geen documenten gevonden</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredDocuments.map((doc) => (
              <li key={doc.id} className="hover:bg-gray-50">
                {/* Mobile view: compact */}
                <div className="md:hidden p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                      aria-label={`Download ${doc.title}`}
                    >
                      <DownloadIcon />
                    </button>
                  </div>
                </div>

                {/* Desktop view: full details */}
                <div className="hidden md:flex items-center px-6 py-4">
                  {/* File Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileIcon fileType={doc.file_type} />
                  </div>
                  
                  {/* Title and metadata */}
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                    <p className="text-xs text-gray-500">
                      {doc.file_name} • {formatFileSize(doc.file_size_bytes)}
                    </p>
                  </div>

                  {/* Category badge */}
                  <div className="mx-4">
                    <SectionBadge section={doc.section || 'bewoners'} />
                  </div>

                  {/* Date */}
                  <div className="mx-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(doc.created_at).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare(doc)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      aria-label={`Deel ${doc.title}`}
                    >
                      <ShareIcon />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                      aria-label={`Download ${doc.title}`}
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

      {/* Share Panel (inline, not modal) */}
      {shareModalDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:max-w-md md:rounded-lg p-6 rounded-t-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Document delen
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Genereer een deelbare link voor: <strong>{shareModalDoc.title}</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShareModalDoc(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={() => generateShareLink(shareModalDoc)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Link kopiëren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components
function DownloadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function FileIcon({ fileType }: { fileType: string }) {
  const isPdf = fileType === 'application/pdf';
  const isImage = fileType.startsWith('image/');
  
  if (isPdf) {
    return <span className="text-red-500 text-lg">📄</span>;
  }
  if (isImage) {
    return <span className="text-green-500 text-lg">🖼️</span>;
  }
  return <span className="text-blue-500 text-lg">📁</span>;
}

function SectionBadge({ section }: { section: DocumentSection }) {
  const colors = {
    bestuur: 'bg-purple-100 text-purple-800',
    bewoners: 'bg-green-100 text-green-800',
    archief: 'bg-gray-100 text-gray-600',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[section]}`}>
      {section.charAt(0).toUpperCase() + section.slice(1)}
    </span>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
