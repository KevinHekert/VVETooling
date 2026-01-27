'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { 
  Ticket, 
  TicketComment, 
  TicketTimelineEntry, 
  TicketStatus, 
  TicketCategory,
  TicketCommentCreate,
  TicketAttachmentStatus,
  SupplierStatus,
} from '@/types';

/**
 * Ticket Detail Page - STORY-029: Bewoner ticket wizard en tijdlijn
 * STORY-030: Ticket bewijsstukken (bonnen en facturen)
 * STORY-044: Ticket supplier collaboration status (view only for bewoner)
 * STORY-038: SLA status display (read only for bewoner)
 * 
 * Shows ticket details with:
 * - Status and priority information
 * - Supplier status (read-only for bewoner)
 * - SLA status (read-only for bewoner)
 * - Timeline with status changes and comments
 * - Attachments list with status badges
 * - Attachment upload functionality
 * - Comment form for adding new comments
 */

const STATUS_LABELS: Record<TicketStatus, { label: string; color: string }> = {
  draft: { label: 'Concept', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Ingediend', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In behandeling', color: 'bg-yellow-100 text-yellow-700' },
  awaiting_info: { label: 'Wacht op info', color: 'bg-orange-100 text-orange-700' },
  resolved: { label: 'Opgelost', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Gesloten', color: 'bg-gray-100 text-gray-500' },
};

// STORY-044: Supplier status labels
const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, { label: string; color: string }> = {
  scheduled: { label: 'Ingepland', color: 'bg-purple-100 text-purple-700' },
  in_progress: { label: 'Bezig', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Afgerond', color: 'bg-green-100 text-green-700' },
};

// STORY-038: SLA status labels
const SLA_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  on_track: { label: 'Op schema', color: 'bg-green-100 text-green-700' },
  at_risk: { label: 'Risico', color: 'bg-yellow-100 text-yellow-700' },
  breached: { label: 'Overschreden', color: 'bg-red-100 text-red-700' },
};

const ATTACHMENT_STATUS_LABELS: Record<TicketAttachmentStatus, { label: string; color: string }> = {
  pending: { label: 'In afwachting', color: 'bg-gray-100 text-gray-700' },
  timely: { label: 'Tijdig', color: 'bg-green-100 text-green-700' },
  late: { label: 'Te laat', color: 'bg-orange-100 text-orange-700' },
  accepted: { label: 'Geaccepteerd', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Afgewezen', color: 'bg-red-100 text-red-700' },
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  maintenance: 'Onderhoud',
  noise: 'Geluidsoverlast',
  safety: 'Veiligheid',
  cleaning: 'Schoonmaak',
  facilities: 'Faciliteiten',
  other: 'Overig',
};

const CATEGORY_ICONS: Record<TicketCategory, string> = {
  maintenance: '🔧',
  noise: '🔊',
  safety: '⚠️',
  cleaning: '🧹',
  facilities: '🏢',
  other: '📝',
};

const TIMELINE_ICONS: Record<string, string> = {
  created: '📝',
  status_changed: '🔄',
  comment_added: '💬',
  attachment_added: '📎',
  attachment_reviewed: '✓',
  internal_note_added: '📋',
  supplier_status_changed: '🔧',
  supplier_follow_up_added: '📞',
  supplier_removed: '❌',
};

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [timeline, setTimeline] = useState<TicketTimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Comment form state
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Attachment upload state (STORY-030)
  const [isUploading, setIsUploading] = useState(false);

  // TODO: Get VVE ID from context/session
  const vveId = 'demo-vve-id';

  useEffect(() => {
    async function fetchTicketData() {
      try {
        const [ticketData, commentsData, timelineData] = await Promise.all([
          api.getTicket(vveId, ticketId),
          api.getTicketComments(vveId, ticketId),
          api.getTicketTimeline(vveId, ticketId),
        ]);
        setTicket(ticketData);
        setComments(commentsData);
        setTimeline(timelineData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kon ticket niet ophalen');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTicketData();
  }, [ticketId]);

  // Handle attachment upload (STORY-030)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(`${file.name} is te groot. Maximum is 10 MB.`);
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(`${file.name} heeft een niet-ondersteund formaat.`);
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      await api.uploadTicketAttachment(vveId, ticketId, file);
      
      // Refresh ticket to get updated attachments
      const ticketData = await api.getTicket(vveId, ticketId);
      setTicket(ticketData);
      
      // Refresh timeline
      const timelineData = await api.getTicketTimeline(vveId, ticketId);
      setTimeline(timelineData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon bestand niet uploaden');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const commentData: TicketCommentCreate = {
        content: newComment,
        is_internal: false,
      };
      const comment = await api.addTicketComment(vveId, ticketId, commentData);
      setComments([...comments, comment]);
      setNewComment('');
      
      // Refresh timeline
      const timelineData = await api.getTicketTimeline(vveId, ticketId);
      setTimeline(timelineData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon reactie niet toevoegen');
    } finally {
      setIsSubmittingComment(false);
    }
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
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <Link
          href="/dashboard/bewoner/tickets"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Terug naar meldingen
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <p className="text-gray-600">Ticket niet gevonden</p>
        <Link
          href="/dashboard/bewoner/tickets"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Terug naar meldingen
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Back Link */}
      <Link
        href="/dashboard/bewoner/tickets"
        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
      >
        ← Terug naar meldingen
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">
            {CATEGORY_ICONS[ticket.category]}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
              <span
                className={`
                  inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${STATUS_LABELS[ticket.status].color}
                `}
              >
                {STATUS_LABELS[ticket.status].label}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <span>{CATEGORY_LABELS[ticket.category]}</span>
              {ticket.location && <span>📍 {ticket.location}</span>}
              <span>
                Ingediend op{' '}
                {new Date(ticket.created_at).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* STORY-044: Supplier Status - visible to bewoner */}
        {ticket.supplier_status && (
          <div className="mt-4 pt-4 border-t">
            <h2 className="text-sm font-medium text-gray-700 mb-2">🔧 Leveranciersstatus</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`
                  inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${SUPPLIER_STATUS_LABELS[ticket.supplier_status].color}
                `}
              >
                {SUPPLIER_STATUS_LABELS[ticket.supplier_status].label}
              </span>
              {ticket.supplier_name && (
                <span className="text-sm text-gray-600">
                  door <strong>{ticket.supplier_name}</strong>
                </span>
              )}
            </div>
            {ticket.supplier_status_note && (
              <p className="text-sm text-gray-500 mt-2 italic">
                {ticket.supplier_status_note}
              </p>
            )}
            {ticket.supplier_status_updated_at && (
              <p className="text-xs text-gray-400 mt-1">
                Laatst bijgewerkt: {new Date(ticket.supplier_status_updated_at).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        )}

        {/* STORY-038: SLA Status - visible to bewoner */}
        {ticket.sla_due_date && (
          <div className="mt-4 pt-4 border-t">
            <h2 className="text-sm font-medium text-gray-700 mb-2">⏱️ Verwachte Responstermijn</h2>
            <div className="flex items-center gap-3 flex-wrap">
              {ticket.sla_status && SLA_STATUS_LABELS[ticket.sla_status] && (
                <span
                  className={`
                    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${SLA_STATUS_LABELS[ticket.sla_status].color}
                  `}
                >
                  {SLA_STATUS_LABELS[ticket.sla_status].label}
                </span>
              )}
              <span className="text-sm text-gray-600">
                Deadline: <strong>{new Date(ticket.sla_due_date).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</strong>
              </span>
            </div>
            {ticket.sla_remaining_hours !== undefined && ticket.sla_remaining_hours > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Nog {ticket.sla_remaining_hours} uur resterend
              </p>
            )}
            {ticket.sla_breached && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ De responstermijn is overschreden
              </p>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Beschrijving</h2>
          <p className="text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {/* Attachments - STORY-030 */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-700">
              Bijlagen ({ticket.attachments?.length || 0})
            </h2>
            {/* Upload button */}
            <label className={`
              inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg cursor-pointer
              ${isUploading 
                ? 'bg-gray-200 text-gray-400' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }
            `}>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {isUploading ? 'Uploaden...' : '+ Bijlage toevoegen'}
            </label>
          </div>
          
          {ticket.attachments && ticket.attachments.length > 0 ? (
            <div className="space-y-2">
              {ticket.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-xl">
                    {attachment.file_type.includes('pdf') ? '📄' : '🖼️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.file_name}
                      </p>
                      {/* Status badge */}
                      <span
                        className={`
                          inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${ATTACHMENT_STATUS_LABELS[attachment.status || 'pending'].color}
                        `}
                      >
                        {ATTACHMENT_STATUS_LABELS[attachment.status || 'pending'].label}
                      </span>
                      {/* Timely badge */}
                      {attachment.is_timely === false && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          Te laat
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {(attachment.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                      {attachment.rejection_reason && (
                        <span className="text-red-500 ml-2">
                          Reden: {attachment.rejection_reason}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Geen bijlagen toegevoegd</p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Tijdlijn</h2>
        
        {timeline.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Geen activiteit</p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-6">
              {timeline.map((entry) => (
                <div key={entry.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10">
                    {TIMELINE_ICONS[entry.action] || '📌'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">
                        {entry.actor_name || 'Systeem'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{entry.description}</p>
                    {entry.old_value && entry.new_value && (
                      <p className="text-sm text-gray-500 mt-1">
                        {entry.old_value} → {entry.new_value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Reacties ({comments.length})
        </h2>

        {comments.length > 0 && (
          <div className="space-y-4 mb-6">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">
                    {comment.author_name || 'Onbekend'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment Form */}
        <form onSubmit={handleSubmitComment}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voeg een reactie toe
          </label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Typ uw reactie..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={isSubmittingComment || !newComment.trim()}
              className={`
                px-4 py-2 rounded-lg font-medium
                ${isSubmittingComment || !newComment.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {isSubmittingComment ? 'Bezig...' : 'Reactie Plaatsen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
