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

// Audit Log types (STORY-010)
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
}

export interface AuditLogFilters {
  action?: string;
  entity_type?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  is_financial?: boolean;
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
