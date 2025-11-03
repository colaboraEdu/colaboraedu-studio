/**
 * API Client - Robust HTTP client with authentication, error handling, and TypeScript support
 * Part of colaboraEDU integrated development plan
 */

import { toast } from 'sonner';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_CONFIG = {
  BASE_URL: 'http://192.168.10.178:8004/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  status?: number;
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  retry?: boolean;
  showErrorToast?: boolean;
}

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  institution_id: number;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  last_login?: string;
}

export type UserRole = 
  | 'admin' 
  | 'professor' 
  | 'aluno' 
  | 'coordenador' 
  | 'secretario' 
  | 'orientador' 
  | 'bibliotecario' 
  | 'responsavel';

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalInstitutions: number;
  usersByRole: Array<{ role: UserRole; count: number }>;
}

export interface RecentActivity {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  action: string;
  created_at: string;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config = API_CONFIG) {
    this.baseURL = config.BASE_URL;
    this.timeout = config.TIMEOUT;
  }

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private clearAuthToken(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  // ============================================================================
  // REQUEST CONFIGURATION
  // ============================================================================

  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async createRequest(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<Request> {
    const {
      timeout = this.timeout,
      headers: customHeaders = {},
      ...restConfig
    } = config;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const headers = this.getHeaders(
      typeof customHeaders === 'object' && customHeaders !== null && !Array.isArray(customHeaders)
        ? customHeaders as Record<string, string>
        : {}
    );

    return new Request(url, {
      ...restConfig,
      headers,
    });
  }

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch {
      // Fallback for non-JSON error responses
      errorData = { message: response.statusText || 'Unknown error occurred' };
    }

    const apiError: ApiError = {
      message: errorData.detail || errorData.message || 'Request failed',
      code: errorData.code,
      details: errorData.details,
      status: response.status,
    };

    // Handle specific error cases
    switch (response.status) {
      case 401:
        this.clearAuthToken();
        apiError.message = 'Authentication expired. Please login again.';
        // Redirect to login if not already there
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        break;
      
      case 403:
        apiError.message = 'You do not have permission to perform this action.';
        break;
      
      case 404:
        apiError.message = 'The requested resource was not found.';
        break;
      
      case 422:
        if (Array.isArray(errorData.detail)) {
          apiError.message = errorData.detail[0]?.msg || 'Validation error';
        }
        break;
      
      case 500:
        apiError.message = 'Internal server error. Please try again later.';
        break;
    }

    throw apiError;
  }

  // ============================================================================
  // RETRY LOGIC
  // ============================================================================

  private async withRetry<T>(
    requestFn: () => Promise<T>,
    attempts: number = API_CONFIG.RETRY_ATTEMPTS
  ): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i < attempts; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on authentication or client errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as ApiError).status;
          if (status && (status < 500 || status === 401 || status === 403)) {
            throw error;
          }
        }

        if (i < attempts - 1) {
          await this.delay(API_CONFIG.RETRY_DELAY * (i + 1));
        }
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // CORE REQUEST METHODS
  // ============================================================================

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      timeout = this.timeout,
      retry = true,
      showErrorToast = true,
      ...restConfig
    } = config;

    const requestFn = async (): Promise<T> => {
      const request = await this.createRequest(endpoint, restConfig);
      
      const abortController = new AbortController();
      const requestId = `${request.method}-${request.url}`;
      
      // Cancel previous request with same ID
      if (this.abortControllers.has(requestId)) {
        this.abortControllers.get(requestId)?.abort();
      }
      
      this.abortControllers.set(requestId, abortController);

      // Set timeout
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeout);

      try {
        const response = await fetch(request, {
          ...restConfig,
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);
        this.abortControllers.delete(requestId);

        return await this.handleResponse<T>(response);
      } catch (error) {
        clearTimeout(timeoutId);
        this.abortControllers.delete(requestId);

        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout or cancelled');
        }

        throw error;
      }
    };

    try {
      return retry ? await this.withRetry(requestFn) : await requestFn();
    } catch (error) {
      if (showErrorToast && error instanceof Error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || 'Request failed');
      }
      throw error;
    }
  }

  // ============================================================================
  // HTTP METHODS
  // ============================================================================

  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // ============================================================================
  // FORM DATA / FILE UPLOAD
  // ============================================================================

  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    config: RequestConfig = {}
  ): Promise<T> {
    const { headers = {}, ...restConfig } = config;
    
    // Remove Content-Type to let browser set it with boundary
    const formHeaders = { ...headers };
    delete formHeaders['Content-Type'];

    return this.request<T>(endpoint, {
      ...restConfig,
      method: 'POST',
      headers: formHeaders,
      body: formData,
    });
  }

  // ============================================================================
  // AUTHENTICATION API
  // ============================================================================

  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await this.postFormData<LoginResponse>(
      '/auth/login',
      formData,
      { showErrorToast: false } // Handle login errors manually
    );

    // Save authentication data
    this.setAuthToken(response.access_token);
    localStorage.setItem('user_data', JSON.stringify(response.user));

    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.get<User>('/auth/me');
  }

  logout(): void {
    this.clearAuthToken();
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  getCurrentUserFromStorage(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // ============================================================================
  // DASHBOARD API
  // ============================================================================

  async getDashboardStats(): Promise<DashboardStats> {
    return this.get<DashboardStats>('/dashboard/stats');
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    return this.get<RecentActivity[]>('/dashboard/recent-activity');
  }

  // ============================================================================
  // USERS API
  // ============================================================================

  async getUsers(params?: {
    skip?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
  }): Promise<User[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.skip) queryParams.set('skip', params.skip.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.role) queryParams.set('role', params.role);
    if (params?.search) queryParams.set('search', params.search);

    const query = queryParams.toString();
    return this.get<User[]>(`/users${query ? `?${query}` : ''}`);
  }

  async getUserById(id: number): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }

  async createUser(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: UserRole;
  }): Promise<User> {
    return this.post<User>('/users', userData);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.put<User>(`/users/${id}`, userData);
  }

  async deleteUser(id: number): Promise<void> {
    return this.delete<void>(`/users/${id}`);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  setBaseURL(url: string): void {
    this.baseURL = url;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const apiClient = new ApiClient();

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const authAPI = {
  login: (email: string, password: string) => apiClient.login(email, password),
  getCurrentUser: () => apiClient.getCurrentUser(),
  logout: () => apiClient.logout(),
  isAuthenticated: () => apiClient.isAuthenticated(),
  getCurrentUserFromStorage: () => apiClient.getCurrentUserFromStorage(),
};

export const dashboardAPI = {
  getStats: () => apiClient.getDashboardStats(),
  getRecentActivity: () => apiClient.getRecentActivity(),
};

export const usersAPI = {
  getAll: (params?: Parameters<typeof apiClient.getUsers>[0]) => 
    apiClient.getUsers(params),
  getById: (id: number) => apiClient.getUserById(id),
  create: (userData: Parameters<typeof apiClient.createUser>[0]) => 
    apiClient.createUser(userData),
  update: (id: number, userData: Partial<User>) => 
    apiClient.updateUser(id, userData),
  delete: (id: number) => apiClient.deleteUser(id),
};

export default apiClient;