/**
 * API Client for VVE Tooling Backend
 * Handles authentication and API requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge existing headers if present
    if (options.headers) {
      const existingHeaders = options.headers as Record<string, string>;
      Object.assign(headers, existingHeaders);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Try to get token from localStorage
      const storedToken = typeof window !== 'undefined' 
        ? localStorage.getItem('access_token') 
        : null;
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Een fout is opgetreden' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.fetch<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) {
    return this.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.fetch<import('@/types').User>('/auth/me');
  }

  async refreshToken(refreshToken: string) {
    return this.fetch<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // Transactions (STORY-001)
  async getTransactions(vveId: string, params?: { skip?: number; limit?: number; category?: string }) {
    const query = new URLSearchParams();
    if (params?.skip) query.set('skip', String(params.skip));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.category) query.set('category', params.category);
    
    const queryStr = query.toString() ? `?${query.toString()}` : '';
    return this.fetch<import('@/types').Transaction[]>(
      `/vves/${vveId}/transactions${queryStr}`
    );
  }

  async createTransaction(vveId: string, data: import('@/types').TransactionCreate) {
    return this.fetch<import('@/types').Transaction>(
      `/vves/${vveId}/transactions`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getTransactionSummary(vveId: string, year?: number) {
    const query = year ? `?year=${year}` : '';
    return this.fetch<import('@/types').TransactionSummary>(
      `/vves/${vveId}/transactions/summary${query}`
    );
  }

  // Units / Splitsingssleutel (STORY-002)
  async getUnits(vveId: string) {
    return this.fetch<import('@/types').Unit[]>(`/vves/${vveId}/units`);
  }

  async getSplitsingssleutel(vveId: string) {
    return this.fetch<import('@/types').SplitsingssleutelValidation>(
      `/vves/${vveId}/units/splitsingssleutel`
    );
  }

  async updateSplitsingssleutel(
    vveId: string,
    updates: import('@/types').SplitsingssleutelEntry[]
  ) {
    return this.fetch<import('@/types').SplitsingssleutelValidation>(
      `/vves/${vveId}/units/splitsingssleutel`,
      {
        method: 'PUT',
        body: JSON.stringify({ updates }),
      }
    );
  }

  // Contributions (STORY-003)
  async getBewonersStatus(vveId?: string) {
    const query = vveId ? `?vve_id=${vveId}` : '';
    return this.fetch<import('@/types').BewonersStatus>(
      `/bewoner/status${query}`
    );
  }

  async getContributions(vveId: string, params?: {
    year?: number;
    month?: number;
    unit_id?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.year) query.set('year', String(params.year));
    if (params?.month) query.set('month', String(params.month));
    if (params?.unit_id) query.set('unit_id', params.unit_id);
    
    const queryStr = query.toString() ? `?${query.toString()}` : '';
    return this.fetch<import('@/types').Contribution[]>(
      `/vves/${vveId}/contributions${queryStr}`
    );
  }

  // Documents (STORY-004)
  async getDocuments(vveId: string, params?: { category?: string }) {
    const query = params?.category ? `?category=${params.category}` : '';
    return this.fetch<import('@/types').Document[]>(
      `/vves/${vveId}/documents${query}`
    );
  }

  async uploadDocument(
    vveId: string,
    data: import('@/types').DocumentUpload
  ): Promise<import('@/types').Document> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.is_public !== undefined) formData.append('is_public', String(data.is_public));

    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') 
      : null;

    const response = await fetch(`${this.baseUrl}/vves/${vveId}/documents`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload mislukt' }));
      throw new Error(error.detail);
    }

    return response.json();
  }

  async getStorageUsage(vveId: string) {
    return this.fetch<import('@/types').StorageUsage>(
      `/vves/${vveId}/documents/storage`
    );
  }

  async deleteDocument(vveId: string, documentId: string) {
    return this.fetch(`/vves/${vveId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Document versions (STORY-018)
  async getDocumentVersions(vveId: string, documentId: string) {
    return this.fetch<import('@/types').DocumentVersion[]>(
      `/vves/${vveId}/documents/${documentId}/versions`
    );
  }

  async uploadDocumentVersion(
    vveId: string,
    documentId: string,
    file: File
  ): Promise<import('@/types').Document> {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') 
      : null;

    const response = await fetch(
      `${this.baseUrl}/vves/${vveId}/documents/${documentId}/versions`,
      {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Versie upload mislukt' }));
      throw new Error(error.detail);
    }

    return response.json();
  }

  async restoreDocumentVersion(vveId: string, documentId: string, versionId: string) {
    return this.fetch<import('@/types').Document>(
      `/vves/${vveId}/documents/${documentId}/versions/${versionId}/restore`,
      {
        method: 'POST',
      }
    );
  }

  // STORY-019: Document download links and share links
  async getDocumentDownloadUrl(vveId: string, documentId: string) {
    return this.fetch<import('@/types').DocumentDownloadUrl>(
      `/vves/${vveId}/documents/${documentId}/download`
    );
  }

  async createDocumentShareLink(
    vveId: string,
    documentId: string,
    data?: import('@/types').DocumentShareLinkRequest
  ) {
    return this.fetch<import('@/types').DocumentShareLink>(
      `/vves/${vveId}/documents/${documentId}/share-links`,
      {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }
    );
  }

  async getDocumentShareLinks(vveId: string, documentId: string) {
    return this.fetch<import('@/types').DocumentShareLink[]>(
      `/vves/${vveId}/documents/${documentId}/share-links`
    );
  }

  async revokeDocumentShareLink(vveId: string, documentId: string, linkToken: string) {
    return this.fetch(
      `/vves/${vveId}/documents/${documentId}/share-links/${linkToken}`,
      {
        method: 'DELETE',
      }
    );
  }

  // Budgets (STORY-006)
  async getBudgets(vveId: string) {
    return this.fetch<import('@/types').Budget[]>(
      `/vves/${vveId}/budgets`
    );
  }

  async getBudget(vveId: string, budgetId: string) {
    return this.fetch<import('@/types').Budget>(
      `/vves/${vveId}/budgets/${budgetId}`
    );
  }

  async createBudget(vveId: string, data: import('@/types').BudgetCreate) {
    return this.fetch<import('@/types').Budget>(
      `/vves/${vveId}/budgets`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async updateBudget(vveId: string, budgetId: string, data: import('@/types').BudgetUpdate) {
    return this.fetch<import('@/types').Budget>(
      `/vves/${vveId}/budgets/${budgetId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteBudget(vveId: string, budgetId: string) {
    return this.fetch(`/vves/${vveId}/budgets/${budgetId}`, {
      method: 'DELETE',
    });
  }

  async getBudgetSummary(vveId: string, budgetId: string) {
    return this.fetch<import('@/types').BudgetSummary>(
      `/vves/${vveId}/budgets/${budgetId}/summary`
    );
  }

  async exportBudgetPdf(vveId: string, budgetId: string): Promise<Blob> {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') 
      : null;

    const response = await fetch(
      `${this.baseUrl}/vves/${vveId}/budgets/${budgetId}/export/pdf`,
      {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Export mislukt' }));
      throw new Error(error.detail);
    }

    return response.blob();
  }

  // Tickets (STORY-029, STORY-030, STORY-037)
  async getTickets(vveId: string, params?: {
    status?: string;
    category?: string;
    priority?: string;
    skip?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status_filter', params.status);
    if (params?.category) query.set('category_filter', params.category);
    if (params?.priority) query.set('priority_filter', params.priority);
    if (params?.skip) query.set('skip', String(params.skip));
    if (params?.limit) query.set('limit', String(params.limit));
    
    const queryStr = query.toString() ? `?${query.toString()}` : '';
    return this.fetch<import('@/types').Ticket[]>(
      `/vves/${vveId}/tickets${queryStr}`
    );
  }

  async getTicket(vveId: string, ticketId: string) {
    return this.fetch<import('@/types').Ticket>(
      `/vves/${vveId}/tickets/${ticketId}`
    );
  }

  async createTicket(vveId: string, data: import('@/types').TicketCreate) {
    return this.fetch<import('@/types').Ticket>(
      `/vves/${vveId}/tickets`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async updateTicket(vveId: string, ticketId: string, data: import('@/types').TicketUpdate) {
    return this.fetch<import('@/types').Ticket>(
      `/vves/${vveId}/tickets/${ticketId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async getTicketTimeline(vveId: string, ticketId: string) {
    return this.fetch<import('@/types').TicketTimelineEntry[]>(
      `/vves/${vveId}/tickets/${ticketId}/timeline`
    );
  }

  // Ticket Attachments (STORY-030)
  async uploadTicketAttachment(
    vveId: string,
    ticketId: string,
    file: File,
    description?: string
  ): Promise<import('@/types').TicketAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);

    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') 
      : null;

    const response = await fetch(
      `${this.baseUrl}/vves/${vveId}/tickets/${ticketId}/attachments`,
      {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload mislukt' }));
      throw new Error(error.detail);
    }

    return response.json();
  }

  async getTicketAttachments(vveId: string, ticketId: string) {
    return this.fetch<import('@/types').TicketAttachment[]>(
      `/vves/${vveId}/tickets/${ticketId}/attachments`
    );
  }

  async updateTicketAttachment(
    vveId: string,
    ticketId: string,
    attachmentId: string,
    data: import('@/types').TicketAttachmentUpdate
  ) {
    return this.fetch<import('@/types').TicketAttachment>(
      `/vves/${vveId}/tickets/${ticketId}/attachments/${attachmentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  // Ticket Comments (STORY-037)
  async addTicketComment(
    vveId: string,
    ticketId: string,
    data: import('@/types').TicketCommentCreate
  ) {
    return this.fetch<import('@/types').TicketComment>(
      `/vves/${vveId}/tickets/${ticketId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getTicketComments(vveId: string, ticketId: string) {
    return this.fetch<import('@/types').TicketComment[]>(
      `/vves/${vveId}/tickets/${ticketId}/comments`
    );
  }

  async updateTicketComment(
    vveId: string,
    ticketId: string,
    commentId: string,
    data: import('@/types').TicketCommentUpdate
  ) {
    return this.fetch<import('@/types').TicketComment>(
      `/vves/${vveId}/tickets/${ticketId}/comments/${commentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  // STORY-044: Ticket Supplier Status
  async updateTicketSupplierStatus(
    vveId: string,
    ticketId: string,
    data: import('@/types').TicketSupplierStatusUpdate
  ) {
    return this.fetch<import('@/types').Ticket>(
      `/vves/${vveId}/tickets/${ticketId}/supplier-status`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  // Suppliers (STORY-035, STORY-044)
  async getSuppliers(vveId: string, activeOnly = true) {
    const query = activeOnly ? '?active_only=true' : '?active_only=false';
    return this.fetch<import('@/types').Supplier[]>(
      `/vves/${vveId}/suppliers${query}`
    );
  }

  async createSupplier(vveId: string, data: import('@/types').SupplierCreate) {
    return this.fetch<import('@/types').Supplier>(
      `/vves/${vveId}/suppliers`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getSupplier(vveId: string, supplierId: string) {
    return this.fetch<import('@/types').Supplier>(
      `/vves/${vveId}/suppliers/${supplierId}`
    );
  }

  async updateSupplier(vveId: string, supplierId: string, data: import('@/types').SupplierUpdate) {
    return this.fetch<import('@/types').Supplier>(
      `/vves/${vveId}/suppliers/${supplierId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  // STORY-036: Supplier Follow-ups
  async getSupplierFollowUps(vveId: string, ticketId: string) {
    return this.fetch<import('@/types').SupplierFollowUp[]>(
      `/vves/${vveId}/tickets/${ticketId}/follow-ups`
    );
  }

  async createSupplierFollowUp(
    vveId: string, 
    ticketId: string, 
    data: import('@/types').SupplierFollowUpCreate
  ) {
    return this.fetch<import('@/types').SupplierFollowUp>(
      `/vves/${vveId}/tickets/${ticketId}/follow-ups`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  // STORY-061: Supplier Evaluations
  async getSupplierEvaluations(vveId: string, supplierId: string) {
    return this.fetch<import('@/types').SupplierEvaluation[]>(
      `/vves/${vveId}/suppliers/${supplierId}/evaluations`
    );
  }

  async createSupplierEvaluation(
    vveId: string,
    supplierId: string,
    data: import('@/types').SupplierEvaluationCreate
  ) {
    return this.fetch<import('@/types').SupplierEvaluation>(
      `/vves/${vveId}/suppliers/${supplierId}/evaluations`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getSupplierEvaluationSummary(vveId: string, supplierId: string) {
    return this.fetch<import('@/types').SupplierEvaluationSummary>(
      `/vves/${vveId}/suppliers/${supplierId}/evaluation-summary`
    );
  }

  async deleteSupplierEvaluation(vveId: string, supplierId: string, evaluationId: string) {
    return this.fetch<void>(
      `/vves/${vveId}/suppliers/${supplierId}/evaluations/${evaluationId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // STORY-041: Splitsingsakte Versions
  async getSplitsingsakteVersions(vveId: string, includeArchived = false) {
    const query = includeArchived ? '?include_archived=true' : '';
    return this.fetch<import('@/types').SplitsingsakteVersionListItem[]>(
      `/vves/${vveId}/splitsingsakte-versions${query}`
    );
  }

  async createSplitsingsakteVersion(vveId: string, data: import('@/types').SplitsingsakteVersionCreate) {
    return this.fetch<import('@/types').SplitsingsakteVersion>(
      `/vves/${vveId}/splitsingsakte-versions`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getSplitsingsakteVersion(vveId: string, versionId: string) {
    return this.fetch<import('@/types').SplitsingsakteVersion>(
      `/vves/${vveId}/splitsingsakte-versions/${versionId}`
    );
  }

  async updateSplitsingsakteVersion(
    vveId: string, 
    versionId: string, 
    data: import('@/types').SplitsingsakteVersionUpdate
  ) {
    return this.fetch<import('@/types').SplitsingsakteVersion>(
      `/vves/${vveId}/splitsingsakte-versions/${versionId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async activateSplitsingsakteVersion(vveId: string, versionId: string) {
    return this.fetch<import('@/types').SplitsingsakteVersion>(
      `/vves/${vveId}/splitsingsakte-versions/${versionId}/activate`,
      {
        method: 'POST',
      }
    );
  }

  async archiveSplitsingsakteVersion(vveId: string, versionId: string) {
    return this.fetch<import('@/types').SplitsingsakteVersion>(
      `/vves/${vveId}/splitsingsakte-versions/${versionId}/archive`,
      {
        method: 'POST',
      }
    );
  }

  // STORY-023: Audit log export
  async getAuditLogs(vveId: string, params?: import('@/types').AuditLogFilters) {
    const query = new URLSearchParams();
    if (params?.action) query.set('action', params.action);
    if (params?.entity_type) query.set('entity_type', params.entity_type);
    if (params?.user_id) query.set('user_id', params.user_id);
    if (params?.start_date) query.set('start_date', params.start_date);
    if (params?.end_date) query.set('end_date', params.end_date);
    if (params?.is_financial !== undefined) query.set('is_financial', String(params.is_financial));
    
    const queryStr = query.toString() ? `?${query.toString()}` : '';
    return this.fetch<import('@/types').AuditLogListResponse>(
      `/vves/${vveId}/audit-logs${queryStr}`
    );
  }

  async getAuditLogActionTypes(vveId: string) {
    return this.fetch<string[]>(`/vves/${vveId}/audit-logs/actions`);
  }

  async getAuditLogEntityTypes(vveId: string) {
    return this.fetch<string[]>(`/vves/${vveId}/audit-logs/entity-types`);
  }

  async prepareAuditLogExport(vveId: string, params?: import('@/types').AuditLogFilters) {
    const query = new URLSearchParams();
    if (params?.action) query.set('action', params.action);
    if (params?.entity_type) query.set('entity_type', params.entity_type);
    if (params?.start_date) query.set('start_date', params.start_date);
    if (params?.end_date) query.set('end_date', params.end_date);
    if (params?.is_financial !== undefined) query.set('is_financial', String(params.is_financial));
    
    const queryStr = query.toString() ? `?${query.toString()}` : '';
    return this.fetch<import('@/types').AuditLogExportSummary>(
      `/vves/${vveId}/audit-logs/export/summary${queryStr}`
    );
  }

  getAuditLogExportUrl(vveId: string, params?: import('@/types').AuditLogFilters): string {
    const query = new URLSearchParams();
    if (params?.action) query.set('action', params.action);
    if (params?.entity_type) query.set('entity_type', params.entity_type);
    if (params?.start_date) query.set('start_date', params.start_date);
    if (params?.end_date) query.set('end_date', params.end_date);
    if (params?.is_financial !== undefined) query.set('is_financial', String(params.is_financial));
    
    const queryStr = query.toString() ? `?${query.toString()}` : '';
    return `${this.baseUrl}/vves/${vveId}/audit-logs/export/csv${queryStr}`;
  }

  // Contracts (EPIC-013, STORY-055, STORY-057)
  async getContracts(vveId: string, params?: {
    search?: string;
    contract_type?: import('@/types').ContractType;
    is_active?: boolean;
    skip?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.contract_type) query.set('contract_type', params.contract_type);
    if (params?.is_active !== undefined) query.set('is_active', String(params.is_active));
    if (params?.skip) query.set('skip', String(params.skip));
    if (params?.limit) query.set('limit', String(params.limit));
    
    const queryStr = query.toString() ? `?${query.toString()}` : '';
    return this.fetch<import('@/types').ContractListItem[]>(
      `/vves/${vveId}/contracts${queryStr}`
    );
  }

  async getContract(vveId: string, contractId: string) {
    return this.fetch<import('@/types').Contract>(
      `/vves/${vveId}/contracts/${contractId}`
    );
  }

  async getContractSummary(vveId: string) {
    return this.fetch<import('@/types').ContractSummary>(
      `/vves/${vveId}/contracts/summary`
    );
  }

  // STORY-058: Contract alerts
  async getContractAlerts(vveId: string, includePast = false) {
    const query = includePast ? '?include_past=true' : '';
    return this.fetch<import('@/types').ContractAlertResponse[]>(
      `/vves/${vveId}/contracts/alerts${query}`
    );
  }

  async createContract(vveId: string, data: import('@/types').ContractCreate) {
    return this.fetch<import('@/types').Contract>(
      `/vves/${vveId}/contracts`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async updateContract(vveId: string, contractId: string, data: import('@/types').ContractUpdate) {
    return this.fetch<import('@/types').Contract>(
      `/vves/${vveId}/contracts/${contractId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteContract(vveId: string, contractId: string) {
    return this.fetch(`/vves/${vveId}/contracts/${contractId}`, {
      method: 'DELETE',
    });
  }

  // STORY-056: Contract document upload
  async uploadContractDocument(
    vveId: string,
    contractId: string,
    file: File,
    description?: string
  ): Promise<import('@/types').ContractDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);

    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') 
      : null;

    const response = await fetch(
      `${this.baseUrl}/vves/${vveId}/contracts/${contractId}/document`,
      {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload mislukt' }));
      throw new Error(error.detail);
    }

    return response.json();
  }

  async linkDocumentToContract(vveId: string, contractId: string, documentId: string) {
    return this.fetch<import('@/types').Contract>(
      `/vves/${vveId}/contracts/${contractId}/document/${documentId}`,
      {
        method: 'PUT',
      }
    );
  }

  async unlinkDocumentFromContract(vveId: string, contractId: string) {
    return this.fetch(`/vves/${vveId}/contracts/${contractId}/document`, {
      method: 'DELETE',
    });
  }

  // STORY-069: ALV/Meetings API
  async getMeetings(vveId: string, params?: {
    status?: import('@/types').MeetingStatus;
    upcoming_only?: boolean;
    skip?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status_filter', params.status);
    if (params?.upcoming_only !== undefined) query.set('upcoming_only', String(params.upcoming_only));
    if (params?.skip) query.set('skip', String(params.skip));
    if (params?.limit) query.set('limit', String(params.limit));
    
    const queryStr = query.toString() ? `?${query.toString()}` : '';
    return this.fetch<import('@/types').MeetingListItem[]>(
      `/vves/${vveId}/meetings${queryStr}`
    );
  }

  async getMeeting(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').Meeting>(
      `/vves/${vveId}/meetings/${meetingId}`
    );
  }

  async createMeeting(vveId: string, data: import('@/types').MeetingCreate) {
    return this.fetch<import('@/types').Meeting>(
      `/vves/${vveId}/meetings`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async updateMeeting(vveId: string, meetingId: string, data: import('@/types').MeetingUpdate) {
    return this.fetch<import('@/types').Meeting>(
      `/vves/${vveId}/meetings/${meetingId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteMeeting(vveId: string, meetingId: string) {
    return this.fetch(`/vves/${vveId}/meetings/${meetingId}`, {
      method: 'DELETE',
    });
  }

  // STORY-070: Agenda Items
  async getAgendaItems(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').AgendaItem[]>(
      `/vves/${vveId}/meetings/${meetingId}/agenda`
    );
  }

  async createAgendaItem(vveId: string, meetingId: string, data: import('@/types').AgendaItemCreate) {
    return this.fetch<import('@/types').AgendaItem>(
      `/vves/${vveId}/meetings/${meetingId}/agenda`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async createStandardAgenda(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').AgendaItem[]>(
      `/vves/${vveId}/meetings/${meetingId}/agenda/template`,
      {
        method: 'POST',
      }
    );
  }

  async updateAgendaItem(vveId: string, meetingId: string, itemId: string, data: import('@/types').AgendaItemUpdate) {
    return this.fetch<import('@/types').AgendaItem>(
      `/vves/${vveId}/meetings/${meetingId}/agenda/${itemId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  }

  async reorderAgendaItems(vveId: string, meetingId: string, data: import('@/types').AgendaItemReorder) {
    return this.fetch<import('@/types').AgendaItem[]>(
      `/vves/${vveId}/meetings/${meetingId}/agenda/reorder`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteAgendaItem(vveId: string, meetingId: string, itemId: string) {
    return this.fetch(`/vves/${vveId}/meetings/${meetingId}/agenda/${itemId}`, {
      method: 'DELETE',
    });
  }

  async deleteAllAgendaItems(vveId: string, meetingId: string) {
    return this.fetch(`/vves/${vveId}/meetings/${meetingId}/agenda`, {
      method: 'DELETE',
    });
  }

  // STORY-071: ALV Invitations
  async previewInvitation(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').MeetingInvitationPreview>(
      `/vves/${vveId}/meetings/${meetingId}/invitation/preview`
    );
  }

  async sendInvitation(vveId: string, meetingId: string, data: import('@/types').MeetingInvitationCreate) {
    return this.fetch<import('@/types').MeetingInvitationResponse>(
      `/vves/${vveId}/meetings/${meetingId}/invitation/send`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  // STORY-072: RSVP
  async createOrUpdateRsvp(vveId: string, meetingId: string, data: import('@/types').RsvpCreate) {
    return this.fetch<import('@/types').MeetingRsvp>(
      `/vves/${vveId}/meetings/${meetingId}/rsvp`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getMyRsvp(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').MeetingRsvp | null>(
      `/vves/${vveId}/meetings/${meetingId}/rsvp`
    );
  }

  async listRsvps(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').MeetingRsvp[]>(
      `/vves/${vveId}/meetings/${meetingId}/rsvps`
    );
  }

  async getRsvpSummary(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').RsvpSummary>(
      `/vves/${vveId}/meetings/${meetingId}/rsvps/summary`
    );
  }

  // STORY-073: Proxy (Volmacht) methods
  async getEligibleGrantees(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').EligibleGrantee[]>(
      `/vves/${vveId}/meetings/${meetingId}/proxies/eligible-grantees`
    );
  }

  async createProxy(vveId: string, meetingId: string, data: import('@/types').ProxyCreate) {
    return this.fetch<import('@/types').MeetingProxy>(
      `/vves/${vveId}/meetings/${meetingId}/proxies`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getMyProxy(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').MeetingProxy | null>(
      `/vves/${vveId}/meetings/${meetingId}/proxies/my`
    );
  }

  async getReceivedProxies(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').ProxyListItem[]>(
      `/vves/${vveId}/meetings/${meetingId}/proxies/received`
    );
  }

  async listProxies(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').ProxyListItem[]>(
      `/vves/${vveId}/meetings/${meetingId}/proxies`
    );
  }

  async confirmProxy(vveId: string, meetingId: string, proxyId: string) {
    return this.fetch<import('@/types').MeetingProxy>(
      `/vves/${vveId}/meetings/${meetingId}/proxies/${proxyId}/confirm`,
      {
        method: 'PATCH',
      }
    );
  }

  async revokeProxy(vveId: string, meetingId: string, proxyId: string) {
    return this.fetch<import('@/types').MeetingProxy>(
      `/vves/${vveId}/meetings/${meetingId}/proxies/${proxyId}/revoke`,
      {
        method: 'PATCH',
      }
    );
  }

  async getProxySummary(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').ProxySummary>(
      `/vves/${vveId}/meetings/${meetingId}/proxies/summary`
    );
  }

  // STORY-074: Quorum Calculation methods
  async getQuorum(vveId: string, meetingId: string, requiredPercentage: number = 50.0) {
    return this.fetch<import('@/types').QuorumCalculation>(
      `/vves/${vveId}/meetings/${meetingId}/quorum?required_percentage=${requiredPercentage}`
    );
  }

  // STORY-075: Meeting Minutes methods
  async getMinutesTemplate(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').MinutesTemplate>(
      `/vves/${vveId}/meetings/${meetingId}/minutes/template`
    );
  }

  async createMinutes(vveId: string, meetingId: string, data: import('@/types').MinutesCreate) {
    return this.fetch<import('@/types').MeetingMinutes>(
      `/vves/${vveId}/meetings/${meetingId}/minutes`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getMinutes(vveId: string, meetingId: string) {
    return this.fetch<import('@/types').MeetingMinutes | null>(
      `/vves/${vveId}/meetings/${meetingId}/minutes`
    );
  }

  async updateMinutes(vveId: string, meetingId: string, data: import('@/types').MinutesUpdate) {
    return this.fetch<import('@/types').MeetingMinutes>(
      `/vves/${vveId}/meetings/${meetingId}/minutes`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  }

  // STORY-075: Decision methods
  async createDecision(vveId: string, meetingId: string, data: import('@/types').DecisionCreate) {
    return this.fetch<import('@/types').MeetingDecision>(
      `/vves/${vveId}/meetings/${meetingId}/decisions`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async listDecisions(vveId: string, meetingId: string, decisionType?: import('@/types').DecisionType) {
    const params = decisionType ? `?decision_type=${decisionType}` : '';
    return this.fetch<import('@/types').MeetingDecision[]>(
      `/vves/${vveId}/meetings/${meetingId}/decisions${params}`
    );
  }

  async updateDecision(vveId: string, meetingId: string, decisionId: string, data: import('@/types').DecisionUpdate) {
    return this.fetch<import('@/types').MeetingDecision>(
      `/vves/${vveId}/meetings/${meetingId}/decisions/${decisionId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  }

  // STORY-076: Extract decisions to register
  async extractDecisions(vveId: string, meetingId: string, decisionIds?: string[]) {
    return this.fetch<import('@/types').DecisionExtractResponse>(
      `/vves/${vveId}/meetings/${meetingId}/decisions/extract`,
      {
        method: 'POST',
        body: JSON.stringify({ decision_ids: decisionIds || null }),
      }
    );
  }

  // ============================================================================
  // Digital Voting Methods (STORY-113, STORY-114, STORY-115)
  // ============================================================================

  // STORY-113: Create voting
  async createVoting(vveId: string, data: import('@/types').VotingCreate) {
    return this.fetch<import('@/types').Voting>(
      `/vves/${vveId}/voting`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async listVotings(vveId: string, params?: { status?: string }) {
    const query = params?.status ? `?status=${params.status}` : '';
    return this.fetch<import('@/types').VotingListItem[]>(
      `/vves/${vveId}/voting${query}`
    );
  }

  async getVoting(vveId: string, votingId: string) {
    return this.fetch<import('@/types').Voting>(
      `/vves/${vveId}/voting/${votingId}`
    );
  }

  async openVoting(vveId: string, votingId: string) {
    return this.fetch<import('@/types').Voting>(
      `/vves/${vveId}/voting/${votingId}/open`,
      { method: 'POST' }
    );
  }

  async closeVoting(vveId: string, votingId: string) {
    return this.fetch<import('@/types').Voting>(
      `/vves/${vveId}/voting/${votingId}/close`,
      { method: 'POST' }
    );
  }

  // STORY-114: Cast vote
  async castVote(vveId: string, votingId: string, choice: import('@/types').VoteChoice) {
    return this.fetch<import('@/types').Vote>(
      `/vves/${vveId}/voting/${votingId}/vote`,
      {
        method: 'POST',
        body: JSON.stringify({ choice }),
      }
    );
  }

  async getMyVote(vveId: string, votingId: string) {
    return this.fetch<import('@/types').Vote | null>(
      `/vves/${vveId}/voting/${votingId}/vote/me`
    );
  }

  // STORY-115: Get voting results
  async getVotingResults(vveId: string, votingId: string) {
    return this.fetch<import('@/types').VotingResults>(
      `/vves/${vveId}/voting/${votingId}/results`
    );
  }

  // ============================================================================
  // Voting Proxy Methods (STORY-117)
  // ============================================================================

  async createVotingProxy(vveId: string, data: import('@/types').VotingProxyCreate) {
    return this.fetch<import('@/types').VotingProxy>(
      `/vves/${vveId}/voting/proxies`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async listVotingProxies(vveId: string, params?: { status?: string; voting_id?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.voting_id) queryParams.append('voting_id', params.voting_id);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.fetch<import('@/types').VotingProxyListItem[]>(
      `/vves/${vveId}/voting/proxies${query}`
    );
  }

  async getVotingProxy(vveId: string, proxyId: string) {
    return this.fetch<import('@/types').VotingProxy>(
      `/vves/${vveId}/voting/proxies/${proxyId}`
    );
  }

  async confirmVotingProxy(vveId: string, proxyId: string) {
    return this.fetch<import('@/types').VotingProxyConfirmation>(
      `/vves/${vveId}/voting/proxies/${proxyId}/confirm`,
      { method: 'POST' }
    );
  }

  async revokeVotingProxy(vveId: string, proxyId: string) {
    return this.fetch<import('@/types').VotingProxyConfirmation>(
      `/vves/${vveId}/voting/proxies/${proxyId}/revoke`,
      { method: 'POST' }
    );
  }

  async deleteVotingProxy(vveId: string, proxyId: string) {
    return this.fetch<void>(
      `/vves/${vveId}/voting/proxies/${proxyId}`,
      { method: 'DELETE' }
    );
  }

  async getMyGrantedProxies(vveId: string) {
    return this.fetch<import('@/types').VotingProxyListItem[]>(
      `/vves/${vveId}/voting/proxies/my-proxies/granted`
    );
  }

  async getMyReceivedProxies(vveId: string) {
    return this.fetch<import('@/types').VotingProxyListItem[]>(
      `/vves/${vveId}/voting/proxies/my-proxies/received`
    );
  }

  // ============================================================================
  // Poll Methods (STORY-116)
  // ============================================================================

  async createPoll(vveId: string, data: import('@/types').PollCreate) {
    return this.fetch<import('@/types').Poll>(
      `/vves/${vveId}/voting/polls`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async listPolls(vveId: string, status?: import('@/types').PollStatus) {
    const query = status ? `?status=${status}` : '';
    return this.fetch<import('@/types').PollListItem[]>(
      `/vves/${vveId}/voting/polls${query}`
    );
  }

  async getPoll(vveId: string, pollId: string) {
    return this.fetch<import('@/types').Poll>(
      `/vves/${vveId}/voting/polls/${pollId}`
    );
  }

  async updatePoll(vveId: string, pollId: string, data: import('@/types').PollUpdate) {
    return this.fetch<import('@/types').Poll>(
      `/vves/${vveId}/voting/polls/${pollId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async openPoll(vveId: string, pollId: string) {
    return this.fetch<import('@/types').Poll>(
      `/vves/${vveId}/voting/polls/${pollId}/open`,
      { method: 'POST' }
    );
  }

  async closePoll(vveId: string, pollId: string) {
    return this.fetch<import('@/types').Poll>(
      `/vves/${vveId}/voting/polls/${pollId}/close`,
      { method: 'POST' }
    );
  }

  async deletePoll(vveId: string, pollId: string) {
    return this.fetch<void>(
      `/vves/${vveId}/voting/polls/${pollId}`,
      { method: 'DELETE' }
    );
  }

  async votePoll(vveId: string, pollId: string, data: import('@/types').PollVoteCreate) {
    return this.fetch<import('@/types').PollVoteResponse>(
      `/vves/${vveId}/voting/polls/${pollId}/vote`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  // ============================================================================
  // Privacy Statement Methods (STORY-080)
  // ============================================================================

  async createPrivacyStatement(vveId: string, data: import('@/types').PrivacyStatementCreate) {
    return this.fetch<import('@/types').PrivacyStatement>(
      `/vves/${vveId}/privacy/statements`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async listPrivacyStatements(vveId: string, status?: import('@/types').PrivacyStatementStatus) {
    const query = status ? `?status=${status}` : '';
    return this.fetch<import('@/types').PrivacyStatementListItem[]>(
      `/vves/${vveId}/privacy/statements${query}`
    );
  }

  async getCurrentPrivacyStatement(vveId: string) {
    return this.fetch<import('@/types').PrivacyStatement | null>(
      `/vves/${vveId}/privacy/statements/current`
    );
  }

  async getPrivacyStatement(vveId: string, statementId: string) {
    return this.fetch<import('@/types').PrivacyStatement>(
      `/vves/${vveId}/privacy/statements/${statementId}`
    );
  }

  async updatePrivacyStatement(vveId: string, statementId: string, data: Partial<import('@/types').PrivacyStatementCreate>) {
    return this.fetch<import('@/types').PrivacyStatement>(
      `/vves/${vveId}/privacy/statements/${statementId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  async publishPrivacyStatement(vveId: string, statementId: string) {
    return this.fetch<import('@/types').PrivacyStatement>(
      `/vves/${vveId}/privacy/statements/${statementId}/publish`,
      { method: 'POST' }
    );
  }

  async archivePrivacyStatement(vveId: string, statementId: string) {
    return this.fetch<import('@/types').PrivacyStatement>(
      `/vves/${vveId}/privacy/statements/${statementId}/archive`,
      { method: 'POST' }
    );
  }

  async deletePrivacyStatement(vveId: string, statementId: string) {
    return this.fetch<void>(
      `/vves/${vveId}/privacy/statements/${statementId}`,
      { method: 'DELETE' }
    );
  }

  async getPrivacyStatementTemplate(vveId: string) {
    return this.fetch<import('@/types').PrivacyStatementTemplate>(
      `/vves/${vveId}/privacy/template`
    );
  }

  // ============================================================================
  // Data Export Methods (STORY-122)
  // ============================================================================

  async requestDataExport(vveId: string, data: import('@/types').DataExportRequestCreate) {
    return this.fetch<import('@/types').DataExportConfirmation>(
      `/vves/${vveId}/privacy/data-export`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async listDataExports(vveId: string) {
    return this.fetch<import('@/types').DataExportListItem[]>(
      `/vves/${vveId}/privacy/data-export`
    );
  }

  async getDataExport(vveId: string, requestId: string) {
    return this.fetch<import('@/types').DataExportRequest>(
      `/vves/${vveId}/privacy/data-export/${requestId}`
    );
  }

  async cancelDataExport(vveId: string, requestId: string) {
    return this.fetch<void>(
      `/vves/${vveId}/privacy/data-export/${requestId}`,
      { method: 'DELETE' }
    );
  }
}

export const api = new ApiClient(API_BASE_URL);
