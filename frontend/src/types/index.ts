/**
 * TypeScript types for VVE Tooling Frontend
 * Based on backend Pydantic schemas and backlog requirements
 */

// User Roles (FEAT-010)
export type UserRole = 'bewoner' | 'penningmeester' | 'bestuurslid' | 'beheerder';

// Transaction Categories (FEAT-001)
export type TransactionCategory =
  | 'contribution'
  | 'maintenance'
  | 'energy'
  | 'insurance'
  | 'administrative'
  | 'reserve'
  | 'other';

// Contribution Status
export type ContributionStatus = 'pending' | 'paid' | 'overdue';

// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface UserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

// Authentication types (STORY-005)
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// VVE types
export interface VVE {
  id: string;
  name: string;
  address?: string;
  postal_code?: string;
  city?: string;
  kvk_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VVEMembership {
  id: string;
  vve_id: string;
  vve_name: string;
  role: UserRole;
  unit_id?: string;
  unit_number?: string;
  is_active: boolean;
  joined_at: string;
}

// Transaction types (STORY-001)
export interface Transaction {
  id: string;
  vve_id: string;
  amount: number;
  category: TransactionCategory;
  description?: string;
  transaction_date: string;
  reserve_fund_id?: string;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  amount: number;
  category: TransactionCategory;
  description?: string;
  transaction_date: string;
  reserve_fund_id?: string;
}

export interface TransactionSummary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  transaction_count: number;
  by_category: Record<string, number>;
}

// Unit types (STORY-002)
export interface Unit {
  id: string;
  vve_id: string;
  unit_number: string;
  description?: string;
  floor?: number;
  area_sqm?: number;
  share_percentage: number;
  is_active: boolean;
  created_at: string;
  owner_name?: string;
}

export interface SplitsingssleutelEntry {
  unit_id: string;
  unit_number: string;
  share_percentage: number;
}

export interface SplitsingssleutelValidation {
  units: SplitsingssleutelEntry[];
  total_percentage: number;
  is_valid: boolean;
  validation_message: string;
}

// Contribution types (STORY-003)
export interface Contribution {
  id: string;
  unit_id: string;
  vve_id: string;
  year: number;
  month: number;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  paid_at?: string;
  status: ContributionStatus;
  created_at: string;
}

export interface BewonersStatus {
  unit_id: string;
  unit_number: string;
  vve_name: string;
  current_month_due: number;
  current_month_paid: number;
  current_month_status: ContributionStatus;
  total_due_year: number;
  total_paid_year: number;
  outstanding_balance: number;
  recent_contributions: Contribution[];
  is_up_to_date: boolean;
  has_overdue_payments: boolean;
  next_due_date?: string;
}

// Document types (STORY-004, STORY-018)
export interface Document {
  id: string;
  vve_id: string;
  title: string;
  description?: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  category: string;
  is_public: boolean;
  uploaded_by_id?: string;
  uploaded_by_name?: string;
  created_at: string;
  // Version fields (STORY-018)
  version: number;
  parent_document_id?: string;
  is_current_version: boolean;
  visible_to_roles: string;
}

export interface DocumentVersion {
  id: string;
  version: number;
  file_name: string;
  file_size_bytes: number;
  uploaded_by_name?: string;
  created_at: string;
  is_current_version: boolean;
}

export interface DocumentUpload {
  title: string;
  description?: string;
  category?: string;
  is_public?: boolean;
  file: File;
}

export interface StorageUsage {
  vve_id: string;
  total_documents: number;
  total_size_bytes: number;
  total_size_mb: number;
  storage_limit_mb: number;
  usage_percentage: number;
  is_near_limit: boolean;
}

// STORY-019: Document share link types
export interface DocumentShareLinkRequest {
  expires_in_hours?: number;
  allow_download?: boolean;
}

export interface DocumentShareLink {
  id: string;
  document_id: string;
  share_url: string;
  token: string;
  expires_at: string;
  created_by_id: string;
  created_by_name?: string;
  allow_download: boolean;
  view_count: number;
  download_count: number;
  is_active: boolean;
  created_at: string;
}

export interface DocumentDownloadUrl {
  download_url: string;
  expires_in_seconds: number;
  file_name: string;
  file_type: string;
}

// Budget types (STORY-006)
export type BudgetStatus = 'draft' | 'approved' | 'archived';

export interface BudgetItem {
  id: string;
  category: TransactionCategory;
  description: string;
  planned_amount: number;
  notes?: string;
}

export interface BudgetItemCreate {
  category: TransactionCategory;
  description: string;
  planned_amount: number;
  notes?: string;
}

export interface Budget {
  id: string;
  vve_id: string;
  year: number;
  name: string;
  description?: string;
  status: BudgetStatus;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
  items: BudgetItem[];
}

export interface BudgetCreate {
  year: number;
  name: string;
  description?: string;
  status?: BudgetStatus;
  items: BudgetItemCreate[];
}

export interface BudgetUpdate {
  name?: string;
  description?: string;
  status?: BudgetStatus;
  items?: BudgetItemCreate[];
}

export interface BudgetSummary {
  total_planned: number;
  by_category: Record<string, number>;
  item_count: number;
}

// Audit Log types (STORY-010, STORY-023)
export interface AuditLog {
  id: string;
  vve_id: string | null;
  user_id: string | null;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values?: string;
  new_values?: string;
  ip_address?: string;
  is_financial: boolean;
  created_at: string;
  result?: string;
}

export interface AuditLogFilters {
  action?: string;
  entity_type?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  is_financial?: boolean;
}

// STORY-023: Audit log list and export types
export interface AuditLogListResponse {
  items: AuditLog[];
  total: number;
  page: number;
  size: number;
}

export interface AuditLogExportSummary {
  export_id: string;
  format: string;
  record_count: number;
  file_size_estimate: string;
  download_url: string;
  expires_at: string;
}

// Ticket types (STORY-029, STORY-030, STORY-037, STORY-044)
export type TicketStatus = 'draft' | 'submitted' | 'in_progress' | 'awaiting_info' | 'resolved' | 'closed';
export type TicketCategory = 'maintenance' | 'noise' | 'safety' | 'cleaning' | 'facilities' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
// STORY-044: Supplier collaboration status
export type SupplierStatus = 'scheduled' | 'in_progress' | 'completed';
// STORY-038: SLA status type
export type SlaStatus = 'on_track' | 'at_risk' | 'breached';

export interface Ticket {
  id: string;
  vve_id: string;
  unit_id: string;
  submitted_by_id: string;
  submitted_by_name?: string;
  title: string;
  description: string;
  category: TicketCategory;
  location?: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  // STORY-044: Supplier status fields
  supplier_id?: string;
  supplier_name?: string;
  supplier_status?: SupplierStatus;
  supplier_status_note?: string;
  supplier_status_updated_at?: string;
  supplier_status_updated_by_id?: string;
  supplier_status_updated_by_name?: string;
  // STORY-038: SLA fields
  sla_due_date?: string;
  sla_response_hours?: number;
  sla_breached?: boolean;
  sla_breached_at?: string;
  sla_status?: SlaStatus;
  sla_remaining_hours?: number;
  attachments: TicketAttachment[];
  timeline: TicketTimelineEntry[];
}

export interface TicketCreate {
  title: string;
  description: string;
  category: TicketCategory;
  location?: string;
  priority?: TicketPriority;
}

export interface TicketUpdate {
  title?: string;
  description?: string;
  category?: TicketCategory;
  location?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  // STORY-038: SLA fields
  sla_due_date?: string;
  sla_response_hours?: number;
}

export type TicketAttachmentStatus = 'pending' | 'timely' | 'late' | 'accepted' | 'rejected';

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  description?: string;
  uploaded_by_id: string;
  uploaded_by_name?: string;
  created_at: string;
  // STORY-030 fields
  status: TicketAttachmentStatus;
  is_timely: boolean;
  rejection_reason?: string;
  reviewed_by_id?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
}

export interface TicketAttachmentUpdate {
  status?: TicketAttachmentStatus;
  rejection_reason?: string;
}

export interface TicketTimelineEntry {
  id: string;
  ticket_id: string;
  action: string;
  description?: string;
  actor_id: string;
  actor_name?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  author_name?: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  // STORY-037 fields
  is_answered: boolean;
  answered_by_id?: string;
  answered_by_name?: string;
  answered_at?: string;
}

export interface TicketCommentCreate {
  content: string;
  is_internal?: boolean;
}

export interface TicketCommentUpdate {
  is_answered?: boolean;
}

export interface TicketDraft {
  title?: string;
  description?: string;
  category?: TicketCategory;
  location?: string;
  step: number;
}

// STORY-044: Supplier status update
export interface TicketSupplierStatusUpdate {
  supplier_id?: string | null;
  supplier_status?: SupplierStatus;
  supplier_status_note?: string;
}

// STORY-035, STORY-044, STORY-060: Supplier types
export interface Supplier {
  id: string;
  vve_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;  // STORY-060
  specialty?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierCreate {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;  // STORY-060
  specialty?: string;
  notes?: string;
  is_active?: boolean;
}

export interface SupplierUpdate {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;  // STORY-060
  specialty?: string;
  notes?: string;
  is_active?: boolean;
}

// STORY-036: Supplier follow-up types
export type SupplierFollowUpChannel = 'phone' | 'email' | 'in_person' | 'other';

export interface SupplierFollowUp {
  id: string;
  ticket_id: string;
  supplier_id: string;
  supplier_name?: string;
  channel: SupplierFollowUpChannel;
  summary: string;
  contact_date: string;
  created_by_id: string;
  created_by_name?: string;
  created_at: string;
}

export interface SupplierFollowUpCreate {
  supplier_id: string;
  channel: SupplierFollowUpChannel;
  summary: string;
  contact_date: string;
}

// STORY-061: Supplier Evaluation types
export interface SupplierEvaluation {
  id: string;
  vve_id: string;
  supplier_id: string;
  supplier_name?: string;
  contract_id?: string;
  contract_description?: string;
  rating: number;
  feedback?: string;
  is_anonymous: boolean;
  created_by_id: string;
  created_by_name?: string;
  created_at: string;
}

export interface SupplierEvaluationCreate {
  supplier_id: string;
  contract_id?: string;
  rating: number;
  feedback?: string;
  is_anonymous?: boolean;
}

export interface SupplierEvaluationSummary {
  supplier_id: string;
  supplier_name: string;
  average_rating: number | null;
  evaluation_count: number;
}

// STORY-041: Splitsingsakte version types
export type SplitsingsakteVersionStatus = 'draft' | 'active' | 'archived';

export interface SplitsingsakteVersion {
  id: string;
  vve_id: string;
  version_number: number;
  name: string;
  description?: string;
  status: SplitsingsakteVersionStatus;
  effective_date?: string;
  archived_date?: string;
  document_id?: string;
  document_name?: string;
  created_by_id: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  activated_by_id?: string;
  activated_by_name?: string;
  activated_at?: string;
}

export interface SplitsingsakteVersionListItem {
  id: string;
  vve_id: string;
  version_number: number;
  name: string;
  status: SplitsingsakteVersionStatus;
  effective_date?: string;
  created_at: string;
  is_active: boolean;
}

export interface SplitsingsakteVersionCreate {
  name: string;
  description?: string;
  effective_date?: string;
  document_id?: string;
}

export interface SplitsingsakteVersionUpdate {
  name?: string;
  description?: string;
  effective_date?: string;
  document_id?: string;
}

// STORY-032, STORY-042: Splitsingsakte amendments/aanvullingen
export type SplitsingsakteAmendmentType = 'wijziging' | 'toevoeging' | 'correctie' | 'verduidelijking';

export interface SplitsingsakteAmendment {
  id: string;
  version_id: string;
  title: string;
  description: string;
  amendment_type: SplitsingsakteAmendmentType;
  effective_date: string;
  document_id?: string;
  document_name?: string;
  created_by_id: string;
  created_by_name?: string;
  created_at: string;
}

export interface SplitsingsakteAmendmentCreate {
  title: string;
  description: string;
  amendment_type: SplitsingsakteAmendmentType;
  effective_date: string;
  document_id?: string;
}

// EPIC-013: Contract types (STORY-055)
export type ContractType = 'energie' | 'verzekering' | 'onderhoud' | 'overig';
export type CostsPeriod = 'monthly' | 'yearly' | 'one_time';

export interface Contract {
  id: string;
  vve_id: string;
  supplier_name: string;
  supplier_id?: string;
  contract_type: ContractType;
  description?: string;
  start_date: string;
  end_date?: string;
  notice_period_days?: number;
  costs?: number;
  costs_period?: CostsPeriod;
  document_id?: string;
  created_by_id: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  // STORY-058: Alert configuration
  alert_days_before?: number;
}

export interface ContractCreate {
  supplier_name: string;
  supplier_id?: string;
  contract_type: ContractType;
  description?: string;
  start_date: string;
  end_date?: string;
  notice_period_days?: number;
  alert_days_before?: number;
  costs?: number;
  costs_period?: CostsPeriod;
}

export interface ContractUpdate {
  supplier_name?: string;
  supplier_id?: string;
  contract_type?: ContractType;
  description?: string;
  start_date?: string;
  end_date?: string;
  notice_period_days?: number;
  alert_days_before?: number;
  costs?: number;
  costs_period?: CostsPeriod;
  is_active?: boolean;
}

export interface ContractListItem {
  id: string;
  vve_id: string;
  supplier_name: string;
  contract_type: ContractType;
  start_date: string;
  end_date?: string;
  notice_period_days?: number;
  costs?: number;
  costs_period?: CostsPeriod;
  is_active: boolean;
  created_at: string;
  days_until_end?: number;
  days_until_notice?: number;
  is_expiring_soon: boolean;
}

export interface ContractSummary {
  total_contracts: number;
  active_contracts: number;
  expiring_soon: number;
  by_type: Record<string, number>;
  total_monthly_costs: number;
  total_yearly_costs: number;
}

// STORY-056: Contract document types
export interface ContractDocumentResponse {
  contract_id: string;
  document_id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  created_at: string;
}

// STORY-058: Contract alert types
export interface ContractAlertResponse {
  id: string;
  vve_id: string;
  supplier_name: string;
  contract_type: ContractType;
  end_date: string;
  notice_period_days: number;
  alert_days_before: number;
  notice_deadline: string;
  alert_date: string;
  days_until_alert: number;
  days_until_notice: number;
  is_alert_due: boolean;
  is_notice_due: boolean;
}

// STORY-069: ALV/Meeting types
export type MeetingType = 'fysiek' | 'online' | 'hybride';
export type MeetingStatus = 'gepland' | 'uitnodiging_verzonden' | 'actief' | 'afgesloten' | 'geannuleerd';

export interface Meeting {
  id: string;
  vve_id: string;
  title: string;
  description?: string;
  meeting_date: string;
  end_time?: string;
  meeting_type: MeetingType;
  location_address?: string;
  location_online_link?: string;
  status: MeetingStatus;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  days_until?: number;
  is_upcoming: boolean;
}

export interface MeetingCreate {
  title: string;
  description?: string;
  meeting_date: string;
  end_time?: string;
  meeting_type: MeetingType;
  location_address?: string;
  location_online_link?: string;
}

export interface MeetingUpdate {
  title?: string;
  description?: string;
  meeting_date?: string;
  end_time?: string;
  meeting_type?: MeetingType;
  location_address?: string;
  location_online_link?: string;
  status?: MeetingStatus;
}

export interface MeetingListItem {
  id: string;
  vve_id: string;
  title: string;
  meeting_date: string;
  meeting_type: MeetingType;
  status: MeetingStatus;
  days_until?: number;
  is_upcoming: boolean;
}

// STORY-070: Agenda Item types
export interface AgendaItem {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  order_index: number;
  document_id?: string;
  document_name?: string;
  is_standard: boolean;
  created_by_id: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AgendaItemCreate {
  title: string;
  description?: string;
  duration_minutes?: number;
  order_index?: number;
  document_id?: string;
  is_standard?: boolean;
}

export interface AgendaItemUpdate {
  title?: string;
  description?: string;
  duration_minutes?: number;
  order_index?: number;
  document_id?: string;
}

export interface AgendaItemReorder {
  item_ids: string[];
}

// STORY-071: ALV Invitation types
export interface MeetingInvitationCreate {
  include_agenda?: boolean;
  include_documents?: boolean;
  custom_message?: string;
}

export interface MeetingInvitationResponse {
  meeting_id: string;
  invitations_sent: number;
  status: string;
  sent_at: string;
  recipients: string[];
}

export interface MeetingInvitationPreview {
  subject: string;
  body_preview: string;
  recipient_count: number;
  meeting_date: string;
  agenda_summary?: string;
  document_count: number;
}

// STORY-072: RSVP types
export type RsvpStatus = 'present' | 'absent' | 'with_proxy';

export interface MeetingRsvp {
  id: string;
  meeting_id: string;
  user_id: string;
  user_name?: string;
  status: RsvpStatus;
  proxy_holder_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RsvpCreate {
  status: RsvpStatus;
  proxy_holder_name?: string;
  notes?: string;
}

export interface RsvpSummary {
  meeting_id: string;
  total_invited: number;
  total_responded: number;
  present_count: number;
  absent_count: number;
  with_proxy_count: number;
  no_response_count: number;
  response_rate: number;
}

// API Response types
export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// STORY-073: Proxy (Volmacht) types
export type ProxyScope = 'full' | 'specific';
export type ProxyStatusType = 'pending' | 'confirmed' | 'revoked';

export interface MeetingProxy {
  id: string;
  meeting_id: string;
  grantor_id: string;
  grantor_name?: string;
  grantee_id: string;
  grantee_name?: string;
  scope: ProxyScope;
  agenda_item_ids?: string[];
  status: ProxyStatusType;
  notes?: string;
  confirmed_at?: string;
  revoked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProxyCreate {
  grantee_id: string;
  scope?: ProxyScope;
  agenda_item_ids?: string[];
  notes?: string;
}

export interface ProxyListItem {
  id: string;
  meeting_id: string;
  grantor_id: string;
  grantor_name?: string;
  grantee_id: string;
  grantee_name?: string;
  scope: ProxyScope;
  status: ProxyStatusType;
  created_at: string;
}

export interface ProxySummary {
  meeting_id: string;
  total_proxies: number;
  pending_count: number;
  confirmed_count: number;
  revoked_count: number;
}

export interface EligibleGrantee {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_board_member: boolean;
}

// STORY-074: Quorum Calculation types
export type QuorumStatus = 'reached' | 'not_reached';

export interface QuorumMemberDetail {
  user_id: string;
  user_name: string;
  unit_id?: string;
  unit_number?: string;
  share_percentage: number;
  attendance_type: 'present' | 'proxy';
  proxy_holder_name?: string;
}

export interface QuorumCalculation {
  meeting_id: string;
  total_shares: number;
  present_shares: number;
  proxy_shares: number;
  represented_shares: number;
  represented_percentage: number;
  required_percentage: number;
  quorum_status: QuorumStatus;
  is_quorum_reached: boolean;
  total_owners: number;
  present_count: number;
  proxy_count: number;
  represented_count: number;
  present_details: QuorumMemberDetail[];
  proxy_details: QuorumMemberDetail[];
  calculated_at: string;
}

// STORY-075: Meeting Minutes types
export type MinutesStatus = 'draft' | 'published' | 'approved';
export type DecisionType = 'besluit' | 'actiepunt' | 'aandachtspunt';

export interface MeetingMinutes {
  id: string;
  meeting_id: string;
  content?: string;
  status: MinutesStatus;
  created_by_id?: string;
  created_by_name?: string;
  published_at?: string;
  approved_at?: string;
  approved_by_id?: string;
  approved_by_name?: string;
  last_saved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MinutesCreate {
  content?: string;
}

export interface MinutesUpdate {
  content?: string;
  status?: MinutesStatus;
}

export interface MinutesTemplate {
  meeting_id: string;
  meeting_title: string;
  meeting_date: string;
  attendees: string[];
  agenda_items: string[];
  html_template: string;
}

export interface MeetingDecision {
  id: string;
  meeting_id: string;
  minutes_id?: string;
  decision_type: DecisionType;
  title: string;
  description?: string;
  agenda_item_id?: string;
  agenda_item_title?: string;
  assignee_id?: string;
  assignee_name?: string;
  due_date?: string;
  is_completed: boolean;
  completed_at?: string;
  created_by_id?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DecisionCreate {
  decision_type: DecisionType;
  title: string;
  description?: string;
  agenda_item_id?: string;
  assignee_id?: string;
  due_date?: string;
}

export interface DecisionUpdate {
  title?: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  is_completed?: boolean;
}

// STORY-076: Decision extraction response
export interface DecisionExtractResponse {
  extracted_count: number;
  message: string;
}

// EPIC-014: MJOP & Onderhoudsplanning types

// Maintenance Element Categories (STORY-062, STORY-063)
export type MaintenanceElementCategory =
  | 'roof'
  | 'facade'
  | 'foundation'
  | 'windows'
  | 'doors'
  | 'elevator'
  | 'heating'
  | 'plumbing'
  | 'electrical'
  | 'common_areas'
  | 'garden'
  | 'parking'
  | 'other';

export type MaintenanceStatus = 'planned' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';

// Maintenance Element (STORY-062, STORY-063)
export interface MaintenanceElement {
  id: string;
  vve_id: string;
  name: string;
  description?: string;
  category: MaintenanceElementCategory;
  location?: string;
  quantity: number;
  unit?: string;
  installation_year?: number;
  expected_lifespan_years?: number;
  last_maintenance_year?: number;
  next_maintenance_year?: number;
  estimated_cost?: number;
  priority: MaintenancePriority;
  import_batch_id?: string;
  import_row_number?: number;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceElementCreate {
  name: string;
  description?: string;
  category: MaintenanceElementCategory;
  location?: string;
  quantity?: number;
  unit?: string;
  installation_year?: number;
  expected_lifespan_years?: number;
  last_maintenance_year?: number;
  next_maintenance_year?: number;
  estimated_cost?: number;
  priority?: MaintenancePriority;
}

export interface MaintenanceElementUpdate {
  name?: string;
  description?: string;
  category?: MaintenanceElementCategory;
  location?: string;
  quantity?: number;
  unit?: string;
  installation_year?: number;
  expected_lifespan_years?: number;
  last_maintenance_year?: number;
  next_maintenance_year?: number;
  estimated_cost?: number;
  priority?: MaintenancePriority;
}

// Maintenance Task (STORY-067, STORY-068)
export interface MaintenanceTask {
  id: string;
  element_id: string;
  vve_id: string;
  title: string;
  description?: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  planned_year?: number;
  planned_date?: string;
  completed_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  assignee_id?: string;
  supplier_id?: string;
  notes?: string;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTaskCreate {
  element_id: string;
  title: string;
  description?: string;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  planned_year?: number;
  planned_date?: string;
  estimated_cost?: number;
  assignee_id?: string;
  supplier_id?: string;
  notes?: string;
}

export interface MaintenanceTaskUpdate {
  title?: string;
  description?: string;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  planned_year?: number;
  planned_date?: string;
  completed_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  assignee_id?: string;
  supplier_id?: string;
  notes?: string;
}

// MJOP Import (STORY-062)
export interface MJOPImportPreviewRow {
  row_number: number;
  data: Record<string, unknown>;
  errors: string[];
  is_valid: boolean;
}

export interface MJOPImportPreviewResponse {
  filename: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  preview_rows: MJOPImportPreviewRow[];
  detected_columns: string[];
  suggested_mapping: Record<string, string>;
}

export interface MJOPImportResponse {
  batch_id: string;
  filename: string;
  total_rows: number;
  imported_rows: number;
  failed_rows: number;
  errors: Array<{ row: number; errors: string[] }>;
}

export interface MJOPImportBatch {
  id: string;
  vve_id: string;
  filename: string;
  total_rows: number;
  imported_rows: number;
  failed_rows: number;
  is_completed: boolean;
  created_by_id?: string;
  created_at: string;
}

// Timeline Visualization (STORY-064)
export interface TimelineItem {
  element_id: string;
  element_name: string;
  category: MaintenanceElementCategory;
  year: number;
  estimated_cost?: number;
  priority: MaintenancePriority;
  has_task: boolean;
  task_status?: MaintenanceStatus;
}

export interface MJOPTimelineResponse {
  vve_id: string;
  start_year: number;
  end_year: number;
  items: TimelineItem[];
  total_by_year: Record<number, number>;
  total_by_category: Record<string, number>;
}

// Reserve Calculation (STORY-065, STORY-066)
export interface ReserveCalculationRequest {
  years_ahead?: number;
  include_contingency?: boolean;
  contingency_percentage?: number;
}

export interface ReserveCalculationResponse {
  vve_id: string;
  years_ahead: number;
  total_required: number;
  annual_contribution: number;
  by_year: Record<number, number>;
  by_category: Record<string, number>;
  contingency_amount?: number;
}

// ============================================================================
// Voting Proxy Types (STORY-117)
// ============================================================================

export type VotingProxyStatus = 'pending' | 'confirmed' | 'revoked' | 'used';

export interface VotingProxy {
  id: string;
  grantor_id: string;
  grantor_name: string;
  grantee_id: string;
  grantee_name: string;
  unit_id: string;
  unit_number: string;
  voting_id?: string;
  voting_title?: string;
  vve_id: string;
  status: VotingProxyStatus;
  notes?: string;
  confirmed_at?: string;
  revoked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VotingProxyCreate {
  grantee_id: string;
  unit_id: string;
  voting_id?: string;
  notes?: string;
}

export interface VotingProxyListItem {
  id: string;
  grantor_name: string;
  grantee_name: string;
  unit_number: string;
  voting_title?: string;
  status: VotingProxyStatus;
  created_at: string;
}

export interface VotingProxyConfirmation {
  proxy_id: string;
  message: string;
  status: VotingProxyStatus;
}

// ============================================================================
// Poll Types (STORY-116)
// ============================================================================

export type PollStatus = 'draft' | 'open' | 'closed';
export type PollResultsVisibility = 'all' | 'board_only' | 'after_vote';

export interface PollOption {
  id: string;
  text: string;
  vote_count: number;
  percentage: number;
  display_order: number;
}

export interface Poll {
  id: string;
  vve_id: string;
  title: string;
  description?: string;
  options: PollOption[];
  end_date: string;
  allow_multiple: boolean;
  is_anonymous: boolean;
  results_visibility: PollResultsVisibility;
  total_votes: number;
  total_participants: number;
  status: PollStatus;
  created_by_id?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  days_remaining?: number;
  has_voted?: boolean;
}

export interface PollCreate {
  title: string;
  description?: string;
  options: string[];
  end_date: string;
  allow_multiple?: boolean;
  is_anonymous?: boolean;
  results_visibility?: PollResultsVisibility;
}

export interface PollUpdate {
  title?: string;
  description?: string;
  end_date?: string;
  allow_multiple?: boolean;
  is_anonymous?: boolean;
  results_visibility?: PollResultsVisibility;
  status?: PollStatus;
}

export interface PollListItem {
  id: string;
  vve_id: string;
  title: string;
  status: PollStatus;
  end_date: string;
  total_participants: number;
  is_anonymous: boolean;
  is_active: boolean;
  days_remaining?: number;
}

export interface PollVoteCreate {
  option_ids: string[];
}

export interface PollVoteResponse {
  poll_id: string;
  poll_title: string;
  selected_options: string[];
  voted_at: string;
  message: string;
}

// ============================================================================
// Privacy Statement Types (STORY-080)
// ============================================================================

export type PrivacyStatementStatus = 'draft' | 'published' | 'archived';

export interface PrivacyStatement {
  id: string;
  vve_id: string;
  title: string;
  version: string;
  vve_name: string;
  vve_address?: string;
  contact_email?: string;
  contact_phone?: string;
  dpo_name?: string;
  dpo_email?: string;
  introduction?: string;
  data_collected?: string;
  data_purpose?: string;
  legal_basis?: string;
  data_sharing?: string;
  retention_period?: string;
  rights?: string;
  cookies?: string;
  security?: string;
  complaints?: string;
  changes?: string;
  status: PrivacyStatementStatus;
  published_at?: string;
  created_by_id?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface PrivacyStatementCreate {
  title?: string;
  version?: string;
  vve_name?: string;
  vve_address?: string;
  contact_email?: string;
  contact_phone?: string;
  dpo_name?: string;
  dpo_email?: string;
  introduction?: string;
  data_collected?: string;
  data_purpose?: string;
  legal_basis?: string;
  data_sharing?: string;
  retention_period?: string;
  rights?: string;
  cookies?: string;
  security?: string;
  complaints?: string;
  changes?: string;
}

export interface PrivacyStatementListItem {
  id: string;
  vve_id: string;
  title: string;
  version: string;
  status: PrivacyStatementStatus;
  published_at?: string;
  created_at: string;
}

export interface PrivacyStatementTemplate {
  introduction: string;
  data_collected: string;
  data_purpose: string;
  legal_basis: string;
  data_sharing: string;
  retention_period: string;
  rights: string;
  cookies: string;
  security: string;
  complaints: string;
  changes: string;
}

// ============================================================================
// Data Export Types (STORY-122)
// ============================================================================

export type DataExportStatus = 'pending' | 'processing' | 'completed' | 'expired' | 'failed';
export type DataExportFormat = 'json' | 'csv';

export interface DataExportRequest {
  id: string;
  user_id: string;
  vve_id?: string;
  status: DataExportStatus;
  export_format: DataExportFormat;
  file_size_bytes?: number;
  download_count: number;
  expires_at?: string;
  processing_started_at?: string;
  processing_completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  is_ready: boolean;
  is_expired: boolean;
  download_url?: string;
}

export interface DataExportRequestCreate {
  vve_id?: string;
  export_format?: DataExportFormat;
}

export interface DataExportListItem {
  id: string;
  vve_id?: string;
  vve_name?: string;
  status: DataExportStatus;
  export_format: DataExportFormat;
  file_size_bytes?: number;
  expires_at?: string;
  created_at: string;
  is_ready: boolean;
  is_expired: boolean;
}

export interface DataExportConfirmation {
  request_id: string;
  status: DataExportStatus;
  message: string;
  estimated_completion_minutes: number;
}
