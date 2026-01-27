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
  TicketUpdate,
  TicketAttachmentStatus,
  SupplierStatus,
  Supplier,
  TicketSupplierStatusUpdate,
  SupplierFollowUp,
  SupplierFollowUpCreate,
  SupplierFollowUpChannel
} from '@/types';

/**
 * Bestuur/Beheerder Ticket Detail Page - STORY-031, STORY-044, STORY-038, STORY-036
 * 
 * Shows ticket details with management capabilities:
 * - View full ticket details, timeline, attachments
 * - Update ticket status
 * - Add internal notes (not visible to bewoner)
 * - Accept/reject attachments
 * - STORY-044: Update supplier status
 * - STORY-038: SLA tracking and management
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

// STORY-036: Follow-up channel labels
const FOLLOW_UP_CHANNEL_LABELS: Record<SupplierFollowUpChannel, { label: string; icon: string }> = {
  phone: { label: 'Telefoon', icon: '📞' },
  email: { label: 'E-mail', icon: '✉️' },
  in_person: { label: 'Persoonlijk', icon: '👤' },
  other: { label: 'Anders', icon: '📋' },
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
};

export default function BeheerderTicketDetailPage() {
  const params = useParams();
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

  // STORY-044: Supplier status state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedSupplierStatus, setSelectedSupplierStatus] = useState<SupplierStatus | ''>('');
  const [supplierStatusNote, setSupplierStatusNote] = useState('');
  const [isUpdatingSupplierStatus, setIsUpdatingSupplierStatus] = useState(false);

  // STORY-036: Follow-up state
  const [followUps, setFollowUps] = useState<SupplierFollowUp[]>([]);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpChannel, setFollowUpChannel] = useState<SupplierFollowUpChannel>('phone');
  const [followUpSummary, setFollowUpSummary] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);

  // TODO: Get VVE ID from context/session
  const vveId = 'demo-vve-id';

  useEffect(() => {
    async function fetchTicketData() {
      try {
        const [ticketData, commentsData, timelineData, suppliersData, followUpsData] = await Promise.all([
          api.getTicket(vveId, ticketId),
          api.getTicketComments(vveId, ticketId),
          api.getTicketTimeline(vveId, ticketId),
          api.getSuppliers(vveId).catch(() => []), // Gracefully handle if suppliers API fails
          api.getSupplierFollowUps(vveId, ticketId).catch(() => []),
        ]);
        setTicket(ticketData);
        setComments(commentsData);
        setTimeline(timelineData);
        setNewStatus(ticketData.status);
        setSuppliers(suppliersData);
        setFollowUps(followUpsData);
        
        // Set initial supplier status values
        if (ticketData.supplier_id) {
          setSelectedSupplierId(ticketData.supplier_id);
        }
        if (ticketData.supplier_status) {
          setSelectedSupplierStatus(ticketData.supplier_status);
        }
        if (ticketData.supplier_status_note) {
          setSupplierStatusNote(ticketData.supplier_status_note);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kon ticket niet ophalen');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTicketData();
  }, [ticketId]);

  // STORY-036: Handle add follow-up
  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpSummary.trim() || !selectedSupplierId) return;

    setIsAddingFollowUp(true);
    setError(null);
    
    try {
      const followUpData: SupplierFollowUpCreate = {
        supplier_id: selectedSupplierId,
        channel: followUpChannel,
        summary: followUpSummary,
        contact_date: followUpDate || new Date().toISOString(),
      };
      
      await api.createSupplierFollowUp(vveId, ticketId, followUpData);
      
      // Refresh follow-ups and timeline
      const [followUpsData, timelineData] = await Promise.all([
        api.getSupplierFollowUps(vveId, ticketId),
        api.getTicketTimeline(vveId, ticketId),
      ]);
      setFollowUps(followUpsData);
      setTimeline(timelineData);
      
      // Reset form
      setFollowUpSummary('');
      setFollowUpDate('');
      setShowFollowUpForm(false);
      
      setSuccessMessage('Opvolgactie toegevoegd');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon opvolgactie niet toevoegen');
    } finally {
      setIsAddingFollowUp(false);
    }
  };

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

  // STORY-044: Handle supplier status update
  const handleSupplierStatusUpdate = async () => {
    if (!selectedSupplierId && !ticket?.supplier_id) {
      setError('Selecteer eerst een leverancier');
      return;
    }

    setIsUpdatingSupplierStatus(true);
    setError(null);
    
    try {
      const updateData: TicketSupplierStatusUpdate = {
        supplier_id: selectedSupplierId || undefined,
        supplier_status: selectedSupplierStatus || undefined,
        supplier_status_note: supplierStatusNote || undefined,
      };
      
      const updatedTicket = await api.updateTicketSupplierStatus(vveId, ticketId, updateData);
      setTicket(updatedTicket);
      
      // Refresh timeline
      const timelineData = await api.getTicketTimeline(vveId, ticketId);
      setTimeline(timelineData);
      
      setSuccessMessage('Leveranciersstatus succesvol bijgewerkt');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon leveranciersstatus niet bijwerken');
    } finally {
      setIsUpdatingSupplierStatus(false);
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
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-medium text-gray-900">
                        {comment.author_name || 'Onbekend'}
                      </span>
                      {comment.is_internal && (
                        <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                          Interne notitie
                        </span>
                      )}
                      {comment.is_answered && (
                        <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded-full">
                          ✓ Beantwoord
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
                    
                    {/* Mark as answered button (only for non-internal, unanswered comments) */}
                    {!comment.is_internal && !comment.is_answered && (
                      <div className="mt-3 pt-3 border-t">
                        <button
                          onClick={async () => {
                            try {
                              await api.updateTicketComment(vveId, ticketId, comment.id, {
                                is_answered: true,
                              });
                              // Refresh comments
                              const commentsData = await api.getTicketComments(vveId, ticketId);
                              setComments(commentsData);
                              // Refresh timeline
                              const timelineData = await api.getTicketTimeline(vveId, ticketId);
                              setTimeline(timelineData);
                              setSuccessMessage('Reactie gemarkeerd als beantwoord');
                              setTimeout(() => setSuccessMessage(null), 3000);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Kon reactie niet bijwerken');
                            }
                          }}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          ✓ Markeren als beantwoord
                        </button>
                      </div>
                    )}
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

          {/* STORY-044: Supplier Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">🔧 Leveranciersstatus</h3>
            
            {/* Current supplier status display */}
            {ticket.supplier_status && (
              <div className="mb-4">
                <span
                  className={`
                    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${SUPPLIER_STATUS_LABELS[ticket.supplier_status].color}
                  `}
                >
                  {SUPPLIER_STATUS_LABELS[ticket.supplier_status].label}
                </span>
                {ticket.supplier_name && (
                  <p className="text-sm text-gray-600 mt-2">
                    Leverancier: <strong>{ticket.supplier_name}</strong>
                  </p>
                )}
                {ticket.supplier_status_note && (
                  <p className="text-sm text-gray-500 mt-1 italic">
                    {ticket.supplier_status_note}
                  </p>
                )}
                {ticket.supplier_status_updated_at && (
                  <p className="text-xs text-gray-400 mt-1">
                    Bijgewerkt: {new Date(ticket.supplier_status_updated_at).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {ticket.supplier_status_updated_by_name && ` door ${ticket.supplier_status_updated_by_name}`}
                  </p>
                )}
              </div>
            )}

            {/* Supplier status update form */}
            <div className={ticket.supplier_status ? 'pt-4 border-t' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leverancier
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3"
              >
                <option value="">-- Selecteer leverancier --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                    {supplier.specialty && ` (${supplier.specialty})`}
                  </option>
                ))}
              </select>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedSupplierStatus}
                onChange={(e) => setSelectedSupplierStatus(e.target.value as SupplierStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3"
              >
                <option value="">-- Selecteer status --</option>
                <option value="scheduled">Ingepland</option>
                <option value="in_progress">Bezig</option>
                <option value="completed">Afgerond</option>
              </select>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Toelichting (optioneel)
              </label>
              <input
                type="text"
                value={supplierStatusNote}
                onChange={(e) => setSupplierStatusNote(e.target.value)}
                placeholder="Bijv. afspraak op 15-02..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3"
              />

              <button
                onClick={handleSupplierStatusUpdate}
                disabled={isUpdatingSupplierStatus || (!selectedSupplierId && !ticket.supplier_id)}
                className={`
                  w-full px-4 py-2 rounded-lg text-sm font-medium
                  ${isUpdatingSupplierStatus || (!selectedSupplierId && !ticket.supplier_id)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                  }
                `}
              >
                {isUpdatingSupplierStatus ? 'Bijwerken...' : 'Leveranciersstatus Bijwerken'}
              </button>
            </div>
          </div>

          {/* STORY-036: Supplier Follow-ups */}
          {(ticket.supplier_id || selectedSupplierId) && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">📞 Opvolgacties</h3>
                <button
                  onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Toevoegen
                </button>
              </div>

              {/* Add follow-up form */}
              {showFollowUpForm && (
                <form onSubmit={handleAddFollowUp} className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Kanaal</label>
                      <select
                        value={followUpChannel}
                        onChange={(e) => setFollowUpChannel(e.target.value as SupplierFollowUpChannel)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="phone">📞 Telefoon</option>
                        <option value="email">✉️ E-mail</option>
                        <option value="in_person">👤 Persoonlijk</option>
                        <option value="other">📋 Anders</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Datum</label>
                      <input
                        type="datetime-local"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Samenvatting *</label>
                      <textarea
                        value={followUpSummary}
                        onChange={(e) => setFollowUpSummary(e.target.value)}
                        placeholder="Korte samenvatting van het gesprek..."
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFollowUpForm(false)}
                        className="flex-1 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Annuleren
                      </button>
                      <button
                        type="submit"
                        disabled={isAddingFollowUp || !followUpSummary.trim()}
                        className={`
                          flex-1 px-3 py-1 text-sm rounded
                          ${isAddingFollowUp || !followUpSummary.trim()
                            ? 'bg-gray-200 text-gray-400'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                          }
                        `}
                      >
                        {isAddingFollowUp ? 'Bezig...' : 'Opslaan'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Follow-ups list */}
              {followUps.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {followUps.map((followUp) => (
                    <div key={followUp.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{FOLLOW_UP_CHANNEL_LABELS[followUp.channel]?.icon}</span>
                        <span className="font-medium">{followUp.supplier_name}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(followUp.contact_date).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700">{followUp.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Geen opvolgacties geregistreerd</p>
              )}
            </div>
          )}

          {/* STORY-038: SLA Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">⏱️ SLA Status</h3>
            
            {/* Current SLA status display */}
            {ticket.sla_due_date ? (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {ticket.sla_status && SLA_STATUS_LABELS[ticket.sla_status] && (
                    <span
                      className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${SLA_STATUS_LABELS[ticket.sla_status].color}
                      `}
                    >
                      {SLA_STATUS_LABELS[ticket.sla_status].label}
                    </span>
                  )}
                  {ticket.sla_breached && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      ⚠️ SLA Overschreden
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Deadline: <strong>{new Date(ticket.sla_due_date).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</strong>
                </p>
                {ticket.sla_remaining_hours !== undefined && ticket.sla_remaining_hours > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Nog {ticket.sla_remaining_hours} uur resterend
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">Geen SLA ingesteld</p>
            )}

            {/* SLA settings (simple inline form) */}
            <div className="pt-3 border-t">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Responstermijn (uren)
              </label>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  defaultValue={ticket.sla_response_hours || ''}
                  onChange={async (e) => {
                    const hours = parseInt(e.target.value);
                    if (!hours) return;
                    try {
                      const updateData: TicketUpdate = { 
                        sla_response_hours: hours,
                        sla_due_date: new Date(
                          new Date(ticket.created_at).getTime() + hours * 60 * 60 * 1000
                        ).toISOString()
                      };
                      const updatedTicket = await api.updateTicket(vveId, ticketId, updateData);
                      setTicket(updatedTicket);
                      setSuccessMessage('SLA bijgewerkt');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Kon SLA niet bijwerken');
                    }
                  }}
                >
                  <option value="">-- Selecteer --</option>
                  <option value="24">24 uur (1 dag)</option>
                  <option value="48">48 uur (2 dagen)</option>
                  <option value="72">72 uur (3 dagen)</option>
                  <option value="120">120 uur (5 dagen)</option>
                  <option value="168">168 uur (1 week)</option>
                  <option value="336">336 uur (2 weken)</option>
                </select>
              </div>
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
