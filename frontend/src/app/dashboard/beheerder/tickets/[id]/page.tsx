'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { 
  Ticket, 
  TicketComment, 
  TicketTimelineEntry, 
  TicketStatus, 
  TicketCategory,
  TicketCommentCreate,
  TicketUpdate,
  TicketAttachmentStatus
} from '@/types';

/**
 * Bestuur/Beheerder Ticket Detail Page - STORY-031
 * 
 * Shows ticket details with management capabilities:
 * - View full ticket details, timeline, attachments
 * - Update ticket status
 * - Add internal notes (not visible to bewoner)
 * - Accept/reject attachments
 */

const STATUS_LABELS: Record<TicketStatus, { label: string; color: string }> = {
  draft: { label: 'Concept', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Ingediend', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In behandeling', color: 'bg-yellow-100 text-yellow-700' },
  awaiting_info: { label: 'Wacht op info', color: 'bg-orange-100 text-orange-700' },
  resolved: { label: 'Opgelost', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Gesloten', color: 'bg-gray-100 text-gray-500' },
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
};

export default function BeheerderTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [timeline, setTimeline] = useState<TicketTimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [newComment, setNewComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Status update state
  const [newStatus, setNewStatus] = useState<TicketStatus | ''>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // Attachment review state
  const [rejectionReason, setRejectionReason] = useState('');

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
        setNewStatus(ticketData.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kon ticket niet ophalen');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTicketData();
  }, [ticketId]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === ticket?.status) return;

    setIsUpdatingStatus(true);
    setError(null);
    
    try {
      const updateData: TicketUpdate = { status: newStatus };
      const updatedTicket = await api.updateTicket(vveId, ticketId, updateData);
      setTicket(updatedTicket);
      
      // Refresh timeline
      const timelineData = await api.getTicketTimeline(vveId, ticketId);
      setTimeline(timelineData);
      
      setSuccessMessage('Status succesvol bijgewerkt');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon status niet bijwerken');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const commentData: TicketCommentCreate = {
        content: newComment,
        is_internal: isInternalNote,
      };
      const comment = await api.addTicketComment(vveId, ticketId, commentData);
      setComments([...comments, comment]);
      setNewComment('');
      setIsInternalNote(false);
      
      // Refresh timeline
      const timelineData = await api.getTicketTimeline(vveId, ticketId);
      setTimeline(timelineData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon reactie niet toevoegen');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleAttachmentReview = async (attachmentId: string, accept: boolean) => {
    if (!accept && !rejectionReason.trim()) {
      setError('Vul een afwijzingsreden in');
      return;
    }

    try {
      await api.updateTicketAttachment(vveId, ticketId, attachmentId, {
        status: accept ? 'accepted' : 'rejected',
        rejection_reason: accept ? undefined : rejectionReason,
      });
      
      // Refresh ticket
      const ticketData = await api.getTicket(vveId, ticketId);
      setTicket(ticketData);
      
      // Refresh timeline
      const timelineData = await api.getTicketTimeline(vveId, ticketId);
      setTimeline(timelineData);
      
      setRejectionReason('');
      setSuccessMessage(`Bewijsstuk ${accept ? 'geaccepteerd' : 'afgewezen'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon bewijsstuk niet beoordelen');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <p className="text-gray-600">Ticket niet gevonden</p>
        <Link
          href="/dashboard/beheerder/tickets"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Terug naar overzicht
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Back Link */}
      <Link
        href="/dashboard/beheerder/tickets"
        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
      >
        ← Terug naar overzicht
      </Link>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">
                {CATEGORY_ICONS[ticket.category]}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                  <span>{CATEGORY_LABELS[ticket.category]}</span>
                  {ticket.location && <span>📍 {ticket.location}</span>}
                  <span>
                    {new Date(ticket.created_at).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Ingediend door: <strong>{ticket.submitted_by_name || 'Onbekend'}</strong>
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Beschrijving</h2>
              <p className="text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Attachments with Review */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Bewijsstukken ({ticket.attachments.length})
              </h2>
              <div className="space-y-3">
                {ticket.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">
                        {attachment.file_type.includes('pdf') ? '📄' : '🖼️'}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900">
                            {attachment.file_name}
                          </p>
                          <span
                            className={`
                              inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                              ${ATTACHMENT_STATUS_LABELS[attachment.status || 'pending'].color}
                            `}
                          >
                            {ATTACHMENT_STATUS_LABELS[attachment.status || 'pending'].label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {(attachment.file_size_bytes / 1024 / 1024).toFixed(2)} MB •
                          {' '}Geüpload door {attachment.uploaded_by_name || 'Onbekend'}
                        </p>
                        {attachment.rejection_reason && (
                          <p className="text-sm text-red-600 mt-1">
                            Afwijzingsreden: {attachment.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Review actions */}
                    {attachment.status === 'pending' && (
                      <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                        <button
                          onClick={() => handleAttachmentReview(attachment.id, true)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          ✓ Accepteren
                        </button>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="Afwijzingsreden..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => handleAttachmentReview(attachment.id, false)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            ✕ Afwijzen
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tijdlijn</h2>
            
            {timeline.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Geen activiteit</p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {timeline.map((entry) => (
                    <div key={entry.id} className="relative flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10">
                        {TIMELINE_ICONS[entry.action] || '📌'}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">
                            {entry.actor_name || 'Systeem'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.created_at).toLocaleDateString('nl-NL', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{entry.description}</p>
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
                  <div 
                    key={comment.id} 
                    className={`p-4 rounded-lg ${
                      comment.is_internal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {comment.author_name || 'Onbekend'}
                      </span>
                      {comment.is_internal && (
                        <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                          Interne notitie
                        </span>
                      )}
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
              <div className="mb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700">Interne notitie (niet zichtbaar voor bewoner)</span>
                </label>
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={isInternalNote ? "Interne notitie..." : "Reactie voor bewoner..."}
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
                      : isInternalNote
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }
                  `}
                >
                  {isSubmittingComment ? 'Bezig...' : isInternalNote ? 'Notitie Toevoegen' : 'Reactie Plaatsen'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar - Status Management */}
        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
            <span
              className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${STATUS_LABELS[ticket.status].color}
              `}
            >
              {STATUS_LABELS[ticket.status].label}
            </span>

            {/* Status Update */}
            <div className="mt-4 pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status wijzigen
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="submitted">Ingediend</option>
                <option value="in_progress">In behandeling</option>
                <option value="awaiting_info">Wacht op info</option>
                <option value="resolved">Opgelost</option>
                <option value="closed">Gesloten</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdatingStatus || newStatus === ticket.status}
                className={`
                  mt-2 w-full px-4 py-2 rounded-lg text-sm font-medium
                  ${isUpdatingStatus || newStatus === ticket.status
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                {isUpdatingStatus ? 'Bijwerken...' : 'Status Bijwerken'}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Overzicht</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Prioriteit</dt>
                <dd className="font-medium">{ticket.priority}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Bijlagen</dt>
                <dd className="font-medium">{ticket.attachments?.length || 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Reacties</dt>
                <dd className="font-medium">{comments.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
