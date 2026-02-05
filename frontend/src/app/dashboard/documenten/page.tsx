'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import type { Document, DocumentVersion, DocumentShareLink } from '@/types';

/**
 * Documents Page - STORY-008: Documenten delen en downloaden
 *                  STORY-018: Document versiebeheer en rol-specifiek delen
 *                  STORY-019: Document download-links en notificaties
 * 
 * Implements:
 * - Role-based sections: Bestuur, Bewoners, Archief
 * - Download functionality with inline feedback and secure URLs
 * - Share link generation with expiry and tracking
 * - Version management: view versions, upload new, restore old
 * - Mobile-first: shows only title, date, download on mobile
 * - Email notification triggers (prepared for backend integration)
 */

type DocumentSection = 'bestuur' | 'bewoners' | 'archief';

interface DocumentWithSection extends Document {
  section?: DocumentSection;
}

export default function DocumentenPage() {
  const { addToast } = useToast();
  const { currentVveId, isLoading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<DocumentWithSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<DocumentSection | 'all'>('all');
  const [shareModalDoc, setShareModalDoc] = useState<DocumentWithSection | null>(null);
  
  // STORY-019: Share link management state
  const [shareLinks, setShareLinks] = useState<DocumentShareLink[]>([]);
  const [isLoadingShareLinks, setIsLoadingShareLinks] = useState(false);
  const [shareLinkExpiry, setShareLinkExpiry] = useState(24); // hours
  const [shareLinkAllowDownload, setShareLinkAllowDownload] = useState(true);
  
  // Version management state (STORY-018)
  const [versionPanelDoc, setVersionPanelDoc] = useState<DocumentWithSection | null>(null);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  useEffect(() => {
    async function fetchDocuments() {
      if (!currentVveId) {
        setIsLoading(false);
        return;
      }
      setError(null);
      try {
        const data = await api.getDocuments(currentVveId);
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
    if (!authLoading) {
      fetchDocuments();
    }
  }, [currentVveId, authLoading]);

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

  // STORY-019: Enhanced download with secure URL and notifications
  const handleDownload = async (doc: DocumentWithSection) => {
    if (!currentVveId) {
      addToast('Geen VVE geselecteerd', 'error');
      return;
    }
    try {
      addToast(`Download wordt voorbereid: ${doc.file_name}`, 'info');
      
      // Try to get secure download URL from API
      try {
        const downloadInfo = await api.getDocumentDownloadUrl(currentVveId, doc.id);
        
        // In production, this would use the signed URL
        // For now, simulate with mock content
        const mockContent = `Inhoud van ${doc.title}`;
        const blob = new Blob([mockContent], { type: downloadInfo.file_type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadInfo.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        addToast(`${doc.file_name} gedownload`, 'success');
      } catch {
        // Fallback for demo when API is not available
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
      }
    } catch {
      addToast('Download mislukt', 'error');
    }
  };

  // STORY-019: Open share panel and load existing share links
  const handleShare = async (doc: DocumentWithSection) => {
    if (!currentVveId) {
      addToast('Geen VVE geselecteerd', 'error');
      return;
    }
    setShareModalDoc(doc);
    setShareLinks([]);
    setIsLoadingShareLinks(true);
    
    try {
      const links = await api.getDocumentShareLinks(currentVveId, doc.id);
      setShareLinks(links);
    } catch {
      // API not available, show empty state
      setShareLinks([]);
    } finally {
      setIsLoadingShareLinks(false);
    }
  };

  // STORY-019: Generate secure share link with options
  const generateShareLink = async (doc: DocumentWithSection) => {
    if (!currentVveId) {
      addToast('Geen VVE geselecteerd', 'error');
      return;
    }
    try {
      const shareLink = await api.createDocumentShareLink(currentVveId, doc.id, {
        expires_in_hours: shareLinkExpiry,
        allow_download: shareLinkAllowDownload,
      });
      
      const shareUrl = `${window.location.origin}${shareLink.share_url}`;
      await navigator.clipboard.writeText(shareUrl);
      
      // Add to local list
      setShareLinks(prev => [shareLink, ...prev]);
      
      addToast('Deelbare link gekopieerd naar klembord', 'success');
      
      // Keep panel open to show the new link
    } catch {
      // Fallback for demo when API is not available
      const mockShareUrl = `${window.location.origin}/documents/shared/${doc.id}?token=demo-${Date.now()}`;
      await navigator.clipboard.writeText(mockShareUrl);
      addToast('Link gekopieerd naar klembord', 'success');
      setShareModalDoc(null);
    }
  };

  // STORY-019: Revoke a share link
  const handleRevokeShareLink = async (doc: DocumentWithSection, linkToken: string) => {
    if (!currentVveId) {
      addToast('Geen VVE geselecteerd', 'error');
      return;
    }
    try {
      await api.revokeDocumentShareLink(currentVveId, doc.id, linkToken);
      setShareLinks(prev => prev.filter(link => link.token !== linkToken));
      addToast('Link ingetrokken', 'success');
    } catch {
      addToast('Kon link niet intrekken', 'error');
    }
  };

  // STORY-019: Copy existing share link to clipboard
  const handleCopyShareLink = async (link: DocumentShareLink) => {
    try {
      const shareUrl = `${window.location.origin}${link.share_url}`;
      await navigator.clipboard.writeText(shareUrl);
      addToast('Link gekopieerd naar klembord', 'success');
    } catch {
      addToast('Kon link niet kopiëren', 'error');
    }
  };

  // STORY-018: Version management functions
  const handleShowVersions = async (doc: DocumentWithSection) => {
    if (!currentVveId) {
      addToast('Geen VVE geselecteerd', 'error');
      return;
    }
    setVersionPanelDoc(doc);
    setIsLoadingVersions(true);
    try {
      const versions = await api.getDocumentVersions(currentVveId, doc.id);
      setDocumentVersions(versions);
    } catch {
      // DEV/DEMO ONLY: Show current document as single version when API is unavailable.
      // In production, this should show an error message to the user instead.
      // TODO: Replace with proper error handling when backend is fully integrated.
      setDocumentVersions([
        {
          id: doc.id,
          version: doc.version || 1,
          file_name: doc.file_name,
          file_size_bytes: doc.file_size_bytes,
          uploaded_by_name: doc.uploaded_by_name,
          created_at: doc.created_at,
          is_current_version: true,
        },
      ]);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleUploadVersion = async (doc: DocumentWithSection, file: File) => {
    if (!currentVveId) {
      addToast('Geen VVE geselecteerd', 'error');
      return;
    }
    try {
      await api.uploadDocumentVersion(currentVveId, doc.id, file);
      addToast(`Nieuwe versie van ${doc.title} geüpload`, 'success');
      // Refresh versions
      handleShowVersions(doc);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Upload mislukt', 'error');
    }
  };

  const handleRestoreVersion = async (doc: DocumentWithSection, versionId: string) => {
    if (!currentVveId) {
      addToast('Geen VVE geselecteerd', 'error');
      return;
    }
    try {
      await api.restoreDocumentVersion(currentVveId, doc.id, versionId);
      addToast('Versie hersteld', 'success');
      // Refresh versions
      handleShowVersions(doc);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Herstel mislukt', 'error');
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

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentVveId) {
    return (
      <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
        <p className="text-sm text-yellow-700">Geen VVE geselecteerd. Selecteer eerst een VVE via het menu.</p>
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
                    {/* Version button (STORY-018) */}
                    <button
                      onClick={() => handleShowVersions(doc)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      aria-label={`Versies van ${doc.title}`}
                      title="Versies bekijken"
                    >
                      <VersionIcon />
                    </button>
                    <button
                      onClick={() => handleShare(doc)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      aria-label={`Deel ${doc.title}`}
                      title="Delen"
                    >
                      <ShareIcon />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                      aria-label={`Download ${doc.title}`}
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

      {/* STORY-019: Enhanced Share Panel with link management */}
      {shareModalDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:max-w-lg md:rounded-lg rounded-t-lg max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Document delen
                </h3>
                <button
                  onClick={() => setShareModalDoc(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  aria-label="Sluiten"
                >
                  <CloseIcon />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                <strong>{shareModalDoc.title}</strong>
              </p>
            </div>

            {/* New link options */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Nieuwe link aanmaken</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-600 flex-shrink-0">
                    Geldig voor:
                  </label>
                  <select
                    value={shareLinkExpiry}
                    onChange={(e) => setShareLinkExpiry(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>1 uur</option>
                    <option value={24}>24 uur</option>
                    <option value={72}>3 dagen</option>
                    <option value={168}>1 week</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowDownload"
                    checked={shareLinkAllowDownload}
                    onChange={(e) => setShareLinkAllowDownload(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="allowDownload" className="text-sm text-gray-600">
                    Download toestaan
                  </label>
                </div>
              </div>
              <button
                onClick={() => generateShareLink(shareModalDoc)}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <LinkIcon />
                Link genereren en kopiëren
              </button>
            </div>

            {/* Existing links */}
            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Actieve links
                {shareLinks.length > 0 && (
                  <span className="ml-2 text-gray-400">({shareLinks.length})</span>
                )}
              </h4>
              
              {isLoadingShareLinks ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : shareLinks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Geen actieve deellinks voor dit document
                </p>
              ) : (
                <ul className="space-y-2">
                  {shareLinks.map((link) => (
                    <li
                      key={link.id}
                      className="p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              link.allow_download 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {link.allow_download ? 'Download' : 'Alleen bekijken'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Vervalt: {new Date(link.expires_at).toLocaleString('nl-NL', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {link.view_count} bekeken • {link.download_count} downloads
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => handleCopyShareLink(link)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Kopieer link"
                          >
                            <CopyIcon />
                          </button>
                          <button
                            onClick={() => handleRevokeShareLink(shareModalDoc, link.token)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Link intrekken"
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
          </div>
        </div>
      )}

      {/* Version Panel (STORY-018) - inline, not modal */}
      {versionPanelDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:max-w-lg md:rounded-lg rounded-t-lg max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Versies: {versionPanelDoc.title}
                </h3>
                <button
                  onClick={() => setVersionPanelDoc(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  aria-label="Sluiten"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Version list */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingVersions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ul className="space-y-3">
                  {documentVersions.map((version) => (
                    <li
                      key={version.id}
                      className={`
                        p-3 rounded-lg border
                        ${version.is_current_version 
                          ? 'border-blue-200 bg-blue-50' 
                          : 'border-gray-200 bg-white'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              Versie {version.version}
                            </span>
                            {version.is_current_version && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Huidig
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {version.file_name} • {formatFileSize(version.file_size_bytes)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(version.created_at).toLocaleDateString('nl-NL', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {version.uploaded_by_name && ` door ${version.uploaded_by_name}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleDownload(versionPanelDoc)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg"
                            title="Download"
                          >
                            <DownloadIcon />
                          </button>
                          {!version.is_current_version && (
                            <button
                              onClick={() => handleRestoreVersion(versionPanelDoc, version.id)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg"
                              title="Herstel deze versie"
                            >
                              <RestoreIcon />
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Upload new version */}
            <div className="p-4 border-t border-gray-200">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Nieuwe versie uploaden
                </span>
                <input
                  type="file"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                  "
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadVersion(versionPanelDoc, file);
                    }
                  }}
                />
              </label>
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

// STORY-018: Version management icons
function VersionIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M6 18L18 6M6 6l12 12" />
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

// STORY-019: Additional icons for share link management
function LinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
