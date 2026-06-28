/**
 * SupportMind — Centralized API Client
 * All backend communication goes through this module.
 */

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const BASE_URL = configuredApiUrl && !configuredApiUrl.includes('your_')
  ? configuredApiUrl.replace(/\/$/, '')
  : '/api';

// ─── Token Management ──────────────────────────────────────────────────────

export const tokenStorage = {
  get: (): string | null => localStorage.getItem('supportmind_token'),
  set: (token: string): void => localStorage.setItem('supportmind_token', token),
  clear: (): void => localStorage.removeItem('supportmind_token'),
};

// ─── Base Fetch Wrapper ────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStorage.get();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    tokenStorage.clear();
    window.location.href = '/login';
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `API Error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Auth API ──────────────────────────────────────────────────────────────

export const authApi = {
  /** Exchange Google credential for JWT */
  googleLogin: (credential: string) =>
    apiFetch<{ access_token: string; token_type: string; user: UserProfile }>(
      '/auth/google',
      { method: 'POST', body: JSON.stringify({ credential }) }
    ),

  /** Authenticate user via Email/Password */
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string; token_type: string; user: UserProfile }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  /** Register user via Email/Password */
  signup: (name: string, email: string, password: string) =>
    apiFetch<{ access_token: string; token_type: string; user: UserProfile }>(
      '/auth/signup',
      { method: 'POST', body: JSON.stringify({ name, email, password }) }
    ),

  /** Get current authenticated user */
  getMe: () => apiFetch<UserProfile>('/auth/me'),

  /** Logout */
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
};

// ─── Analytics API ─────────────────────────────────────────────────────────

export const analyticsApi = {
  getDashboard: () => apiFetch<DashboardAnalytics>('/analytics/dashboard'),
  getCustomers: () => apiFetch<CustomerData[]>('/analytics/customers'),
  createCustomer: (customer: CustomerCreateRequest) =>
    apiFetch<CustomerData>('/analytics/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    }),
};

// ─── Support AI API ────────────────────────────────────────────────────────

export const supportApi = {
  resolve: (req: SupportResolveRequest) =>
    apiFetch<SupportResolveResponse>('/tickets/analyze', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
};

// ─── Memory API ────────────────────────────────────────────────────────────

export const memoryApi = {
  getHistory: (customerId: string) =>
    apiFetch<MemoryEntry[]>(`/memory/history/${customerId}`),

  add: (entry: {
    customer_id: string;
    previous_complaint: string;
    previous_resolution: string;
    issue_category?: string;
    priority?: string;
    sentiment?: string;
  }) => apiFetch<MemoryEntry>('/memory/add', { method: 'POST', body: JSON.stringify(entry) }),

  delete: (memoryId: string) =>
    apiFetch(`/memory/${memoryId}`, { method: 'DELETE' }),
};

// ─── Tickets API ───────────────────────────────────────────────────────────

export const ticketsApi = {
  getHistory: (customerId: string) =>
    apiFetch<TicketData[]>(`/tickets/history/${customerId}`),
};

// ─── TypeScript Interfaces ─────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
  created_at?: string;
}

export interface MemoryEntry {
  id: string;
  customer_id: string;
  previous_complaint: string;
  previous_resolution: string;
  historical_context?: string;
  issue_category?: string;
  priority: string;
  sentiment: string;
  repeat_issue_flag: boolean;
  last_interaction_date?: string;
}

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  plan: string;
  order_id?: string;
  avatar_url?: string;
  created_at?: string;
  history: MemoryEntry[];
}

export interface CustomerCreateRequest {
  name: string;
  email: string;
  phone?: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  order_id?: string;
  avatar_url?: string;
}

export interface TicketData {
  id: string;
  customer_id: string;
  issue_text: string;
  issue_category: string;
  priority: string;
  status: string;
  created_at?: string;
  customer_name?: string;
}

export interface SupportResolveRequest {
  customer_id: string;
  customer_name: string;
  order_id?: string;
  issue_text: string;
  issue_category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface AIResponseData {
  id: string;
  ticket_id: string;
  llm_model_used: string;
  generated_response: string;
  memory_context_used?: string;
  recommended_resolution?: string;
  confidence_score: number;
  urgency_score: number;
  escalation_required: boolean;
  tokens_used: number;
  cost_usd: number;
  cascade_level: number;
  created_at?: string;
}

export interface SupportResolveResponse {
  ticket: TicketData;
  ai_response: AIResponseData;
  memory_found: boolean;
  processing_time_ms: number;
}

export interface DashboardAnalytics {
  resolved_today: number;
  pending_cases: number;
  escalated_tickets: number;
  avg_response_time_ms: number;
  csat_score: number;
  total_tickets: number;
  total_customers: number;
  memory_entries: number;
  cascade_savings_percent: number;
  cost_without_routing: number;
  cost_with_cascade: number;
  query_count: number;
  recent_tickets: TicketData[];
}
