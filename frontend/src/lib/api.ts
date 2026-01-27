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
}

export const api = new ApiClient(API_BASE_URL);
