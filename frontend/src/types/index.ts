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

// STORY-035, STORY-044: Supplier types
export interface Supplier {
  id: string;
  vve_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
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
  specialty?: string;
  notes?: string;
  is_active?: boolean;
}

export interface SupplierUpdate {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
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
