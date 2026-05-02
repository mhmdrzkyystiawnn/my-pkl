/**
 * API Client untuk komunikasi dengan backend FastAPI
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// --- BAGIAN YANG DIPERBAIKI: EXPORT INTERFACE ---
export interface LogbookEntry {
  id: string | number;
  title: string;
  description?: string;
  mood?: string;
  created_at: string;
  image?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          error: data?.detail || `HTTP ${response.status}`,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; token_type: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.data?.access_token) {
      this.setToken(response.data.access_token);
    }

    return response;
  }

  async register(email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Attendance methods
  async getAttendance() {
    return this.request('/attendance/');
  }

  async getTodayAttendance() {
    return this.request('/attendance/today');
  }

  async createAttendance(attendance: {
    date: string;
    check_in_time: string;
    check_out_time?: string;
    total_hours: number;
  }) {
    return this.request('/attendance/', {
      method: 'POST',
      body: JSON.stringify(attendance),
    });
  }

  // --- BAGIAN YANG DIPERBAIKI: PENGGUNAAN GENERICS ---
  async getLogbook() {
    return this.request<LogbookEntry[]>('/logbook/');
  }

  async createLogbookEntry(entry: {
    title: string;
    description?: string;
    mood?: string;
    image?: string;
  }) {
    return this.request<LogbookEntry>('/logbook/', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  // Documents methods
  async getDocuments() {
    return this.request('/documents/');
  }

  async createDocument(doc: {
    name: string;
    type?: string;
    link?: string;
    notes?: string;
  }) {
    return this.request('/documents/', {
      method: 'POST',
      body: JSON.stringify(doc),
    });
  }

  async deleteDocument(docId: string) {
    return this.request(`/documents/${docId}`, {
      method: 'DELETE',
    });
  }

  // Settings methods
  async getSettings() {
    return this.request('/settings/');
  }

  async updateSettings(settings: {
    start_date?: string;
    end_date?: string;
    company_name?: string;
    supervisor_name?: string;
  }) {
    return this.request('/settings/', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Token management
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);