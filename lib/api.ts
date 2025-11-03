/**
 * API Configuration and Base Service
 * Handles HTTP requests to the FastAPI backend
 */

export const API_BASE_URL = 'http://192.168.10.178:8004/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface LoginRequest {
  username: string; // FastAPI OAuth2 expects 'username' field
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    institution_id: string;
    is_active: boolean;
  };
}

export class ApiService {
  private static instance: ApiService;
  private baseURL: string;
  private token: string | null = null;

  private constructor() {
    this.baseURL = API_BASE_URL;
    // Try to load token from localStorage
    this.token = localStorage.getItem('access_token');
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public setToken(token: string): void {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  public clearToken(): void {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  public getToken(): string | null {
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.clearToken();
          throw new Error('Authentication expired. Please login again.');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseURL}${endpoint}`);
      
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key].toString());
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  public async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  public async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Form data upload
  public async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }
}

export const api = ApiService.getInstance();

// Academic Parameters API
export const academicParametersAPI = {
  getParameters: async (institution_id?: string) => {
    const params = institution_id ? `?institution_id=${institution_id}` : '';
    return api.get(`/academic/parameters${params}`);
  },
  
  getParameter: async (id: string) => {
    return api.get(`/academic/parameters/${id}`);
  },
  
  create: async (data: any) => {
    return api.post('/academic/parameters', data);
  },
  
  update: async (id: string, data: any) => {
    return api.put(`/academic/parameters/${id}`, data);
  },
  
  delete: async (id: string) => {
    return api.delete(`/academic/parameters/${id}`);
  }
};

// Grade Levels API
export const gradeLevelsAPI = {
  list: async (institution_id?: string, education_level?: string) => {
    const params = new URLSearchParams();
    if (institution_id) params.append('institution_id', institution_id);
    if (education_level) params.append('education_level', education_level);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/academic/grade-levels${query}`);
  },
  
  get: async (id: string) => {
    return api.get(`/academic/grade-levels/${id}`);
  },
  
  create: async (data: any) => {
    return api.post('/academic/grade-levels', data);
  },
  
  update: async (id: string, data: any) => {
    return api.put(`/academic/grade-levels/${id}`, data);
  },
  
  delete: async (id: string) => {
    return api.delete(`/academic/grade-levels/${id}`);
  }
};

// Subjects API
export const subjectsAPI = {
  list: async (institution_id?: string, is_mandatory?: boolean) => {
    const params = new URLSearchParams();
    if (institution_id) params.append('institution_id', institution_id);
    if (is_mandatory !== undefined) params.append('is_mandatory', is_mandatory.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/academic/subjects${query}`);
  },
  
  get: async (id: string) => {
    return api.get(`/academic/subjects/${id}`);
  },
  
  create: async (data: any) => {
    return api.post('/academic/subjects', data);
  },
  
  update: async (id: string, data: any) => {
    return api.put(`/academic/subjects/${id}`, data);
  },
  
  delete: async (id: string) => {
    return api.delete(`/academic/subjects/${id}`);
  }
};