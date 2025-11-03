/**
 * API Service - Camada de integração com o backend
 * 
 * Configuração centralizada do axios com:
 * - BaseURL do backend
 * - Interceptors para autenticação automática
 * - Tratamento de erros
 * - Métodos tipados para cada endpoint
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Configuração base da API
const API_BASE_URL = 'http://192.168.10.178:8004/api/v1';
const WS_BASE_URL = 'ws://192.168.10.178:8004';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// ============================================================================
// INTERCEPTORS
// ============================================================================

/**
 * Request Interceptor
 * Adiciona token JWT automaticamente em todas as requisições
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Trata erros globalmente
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Erro de rede ou timeout
    if (!error.response) {
      console.error('❌ Erro de rede:', error.message);
      return Promise.reject({
        message: 'Erro de conexão com o servidor. Verifique sua internet.',
        type: 'network_error',
      });
    }

    const status = error.response.status;

    // 401 - Token inválido ou expirado
    if (status === 401) {
      console.warn('⚠️ Token inválido ou expirado');
      
      // Limpar dados de autenticação
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Redirecionar para login (se não estiver já na página de login)
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
      
      return Promise.reject({
        message: 'Sessão expirada. Faça login novamente.',
        type: 'unauthorized',
      });
    }

    // 403 - Sem permissão
    if (status === 403) {
      console.warn('⚠️ Acesso negado');
      return Promise.reject({
        message: 'Você não tem permissão para acessar este recurso.',
        type: 'forbidden',
      });
    }

    // 404 - Recurso não encontrado
    if (status === 404) {
      return Promise.reject({
        message: 'Recurso não encontrado.',
        type: 'not_found',
      });
    }

    // 422 - Erro de validação
    if (status === 422) {
      const detail = (error.response.data as any)?.detail || 'Dados inválidos';
      return Promise.reject({
        message: Array.isArray(detail) ? detail[0].msg : detail,
        type: 'validation_error',
        details: detail,
      });
    }

    // 500 - Erro interno do servidor
    if (status >= 500) {
      console.error('❌ Erro no servidor:', error.response.data);
      return Promise.reject({
        message: 'Erro interno do servidor. Tente novamente mais tarde.',
        type: 'server_error',
      });
    }

    // Outros erros
    return Promise.reject(error);
  }
);

// ============================================================================
// TIPOS
// ============================================================================

export interface User {
  id: string; // UUID
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string; // Propriedade computada (opcional)
  role: string;
  institution_id: string; // UUID
  status: string; // 'active' | 'inactive'
  created_at: string;
  updated_at: string;
  last_login?: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Student {
  id: number;
  user_id: number;
  enrollment_number: string;
  student_name: string;
  birth_date: string;
  parent_name?: string;
  parent_phone?: string;
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  recipient_name?: string;
}

export interface Occurrence {
  id: number;
  student_id: number;
  reported_by: number;
  occurrence_type: string;
  severity: string;
  description: string;
  date: string;
  action_taken?: string;
  created_at: string;
  student_name?: string;
  reporter_name?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface Institution {
  id: string; // UUID
  name: string;
  cnpj?: string;
  city?: string;
  state?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  logo?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export const authAPI = {
  /**
   * Login - Autentica usuário e retorna token JWT
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Salvar token e dados do usuário
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  /**
   * Get Profile - Busca dados do usuário autenticado
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Logout - Remove token e dados do usuário
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Retorna dados do usuário do localStorage
   */
  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },
};

// ============================================================================
// USERS ENDPOINTS
// ============================================================================

export const usersAPI = {
  /**
   * Lista todos os usuários (com paginação)
   */
  async list(params?: {
    skip?: number;
    limit?: number;
    role?: string;
  }): Promise<User[]> {
    const response = await api.get<{status: string; data: User[]}>('/users', { params });
    return response.data.data; // Retorna o array de dentro do objeto
  },

  /**
   * Busca um usuário por ID
   */
  async get(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Cria um novo usuário
   */
  async create(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    institution_id: string; // UUID
  }): Promise<User> {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  /**
   * Atualiza um usuário
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Deleta um usuário
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

// ============================================================================
// STUDENTS ENDPOINTS
// ============================================================================

export const studentsAPI = {
  /**
   * Lista todos os alunos (com paginação)
   */
  async list(params?: {
    skip?: number;
    limit?: number;
  }): Promise<Student[]> {
    const response = await api.get<Student[]>('/students', { params });
    return response.data;
  },

  /**
   * Busca um aluno por ID
   */
  async get(id: number): Promise<Student> {
    const response = await api.get<Student>(`/students/${id}`);
    return response.data;
  },

  /**
   * Cria um novo aluno
   */
  async create(data: {
    user_id: number;
    enrollment_number: string;
    student_name: string;
    birth_date: string;
    parent_name?: string;
    parent_phone?: string;
  }): Promise<Student> {
    const response = await api.post<Student>('/students', data);
    return response.data;
  },

  /**
   * Atualiza um aluno
   */
  async update(id: number, data: Partial<Student>): Promise<Student> {
    const response = await api.put<Student>(`/students/${id}`, data);
    return response.data;
  },

  /**
   * Dashboard do aluno
   */
  async getDashboard(id: number): Promise<any> {
    const response = await api.get(`/students/${id}/dashboard`);
    return response.data;
  },
};

// ============================================================================
// MESSAGES ENDPOINTS
// ============================================================================

export const messagesAPI = {
  /**
   * Envia uma mensagem
   */
  async send(data: {
    recipient_id: number;
    subject: string;
    content: string;
  }): Promise<Message> {
    const response = await api.post<Message>('/messages', data);
    return response.data;
  },

  /**
   * Lista mensagens (inbox/sent/archived)
   */
  async list(params?: {
    message_type?: 'inbox' | 'sent' | 'archived';
    is_read?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Message>> {
    const response = await api.get<PaginatedResponse<Message>>('/messages', { params });
    return response.data;
  },

  /**
   * Busca uma mensagem por ID
   */
  async get(id: number): Promise<Message> {
    const response = await api.get<Message>(`/messages/${id}`);
    return response.data;
  },

  /**
   * Marca mensagem como lida
   */
  async markAsRead(id: number): Promise<Message> {
    const response = await api.patch<Message>(`/messages/${id}/read`);
    return response.data;
  },

  /**
   * Deleta uma mensagem
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/messages/${id}`);
  },

  /**
   * Lista conversas
   */
  async getConversations(): Promise<any[]> {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  /**
   * Estatísticas de mensagens
   */
  async getStats(): Promise<any> {
    const response = await api.get('/messages/stats');
    return response.data;
  },
};

// ============================================================================
// INSTITUTIONS ENDPOINTS
// ============================================================================

export const institutionsAPI = {
  /**
   * Lista todas as instituições
   */
  async list(): Promise<Institution[]> {
    const response = await api.get<Institution[]>('/institutions');
    return response.data;
  },

  /**
   * Busca uma instituição por ID
   */
  async get(id: string): Promise<Institution> {
    const response = await api.get<Institution>(`/institutions/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova instituição
   */
  async create(data: {
    name: string;
    cnpj: string;
    city: string;
    state: string;
    address?: string;
    phone?: string;
    email?: string;
  }): Promise<Institution> {
    const response = await api.post<Institution>('/institutions', data);
    return response.data;
  },

  /**
   * Atualiza uma instituição existente
   */
  async update(id: string | number, data: {
    name?: string;
    cnpj?: string;
    city?: string;
    state?: string;
    address?: string;
    phone?: string;
    email?: string;
    is_active?: boolean;
  }): Promise<Institution> {
    const response = await api.put<Institution>(`/institutions/${id}`, data);
    return response.data;
  },

  /**
   * Deleta uma instituição
   */
  async delete(id: string | number): Promise<void> {
    await api.delete(`/institutions/${id}`);
  },
};

// ============================================================================
// OCCURRENCES ENDPOINTS
// ============================================================================

export const occurrencesAPI = {
  /**
   * Lista ocorrências (com filtros)
   */
  async list(params?: {
    student_id?: number;
    occurrence_type?: string;
    severity?: string;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Occurrence>> {
    const response = await api.get<PaginatedResponse<Occurrence>>('/occurrences', { params });
    return response.data;
  },

  /**
   * Busca uma ocorrência por ID
   */
  async get(id: number): Promise<Occurrence> {
    const response = await api.get<Occurrence>(`/occurrences/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova ocorrência
   */
  async create(data: {
    student_id: number;
    occurrence_type: string;
    severity: string;
    description: string;
    date: string;
    action_taken?: string;
  }): Promise<Occurrence> {
    const response = await api.post<Occurrence>('/occurrences', data);
    return response.data;
  },

  /**
   * Atualiza uma ocorrência
   */
  async update(id: number, data: Partial<Occurrence>): Promise<Occurrence> {
    const response = await api.put<Occurrence>(`/occurrences/${id}`, data);
    return response.data;
  },

  /**
   * Deleta uma ocorrência
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/occurrences/${id}`);
  },

  /**
   * Analytics - Visão geral
   */
  async getOverview(): Promise<any> {
    const response = await api.get('/occurrences/analytics/overview');
    return response.data;
  },

  /**
   * Analytics - Por tipo
   */
  async getByType(): Promise<any> {
    const response = await api.get('/occurrences/analytics/by-type');
    return response.data;
  },

  /**
   * Analytics - Por severidade
   */
  async getBySeverity(): Promise<any> {
    const response = await api.get('/occurrences/analytics/by-severity');
    return response.data;
  },
};

// ============================================================================
// SETTINGS ENDPOINTS
// ============================================================================

export interface SystemSettings {
  id: string;
  // General
  platform_name: string;
  platform_email: string;
  timezone: string;
  language: string;
  date_format: string;
  // Appearance
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  // Security
  maintenance_mode: boolean;
  two_factor_required: boolean;
  session_timeout: number;
  password_min_length: number;
  password_require_special_chars: boolean;
  // Notifications
  email_notifications: boolean;
  system_notifications: boolean;
  security_alerts: boolean;
  weekly_reports: boolean;
  // Integrations
  api_key?: string;
  webhooks: string[];
  // Metadata
  created_at: string;
  updated_at: string;
}

export const settingsAPI = {
  /**
   * Get system settings
   */
  async get(): Promise<SystemSettings> {
    const response = await api.get<SystemSettings>('/settings');
    return response.data;
  },

  /**
   * Update general settings
   */
  async updateGeneral(data: {
    platform_name: string;
    platform_email: string;
    timezone: string;
    language: string;
    date_format: string;
  }): Promise<SystemSettings> {
    const response = await api.put<SystemSettings>('/settings/general', data);
    return response.data;
  },

  /**
   * Update appearance settings
   */
  async updateAppearance(data: {
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
  }): Promise<SystemSettings> {
    const response = await api.put<SystemSettings>('/settings/appearance', data);
    return response.data;
  },

  /**
   * Update security settings
   */
  async updateSecurity(data: {
    maintenance_mode: boolean;
    two_factor_required: boolean;
    session_timeout: number;
    password_min_length: number;
    password_require_special_chars: boolean;
  }): Promise<SystemSettings> {
    const response = await api.put<SystemSettings>('/settings/security', data);
    return response.data;
  },

  /**
   * Update notification settings
   */
  async updateNotifications(data: {
    email_notifications: boolean;
    system_notifications: boolean;
    security_alerts: boolean;
    weekly_reports: boolean;
  }): Promise<SystemSettings> {
    const response = await api.put<SystemSettings>('/settings/notifications', data);
    return response.data;
  },

  /**
   * Update integration settings
   */
  async updateIntegrations(data: {
    webhooks: string[];
  }): Promise<SystemSettings> {
    const response = await api.put<SystemSettings>('/settings/integrations', data);
    return response.data;
  },

  /**
   * Regenerate API key
   */
  async regenerateApiKey(): Promise<{ status: string; message: string; api_key: string }> {
    const response = await api.post<{ status: string; message: string; api_key: string }>('/settings/api-key/regenerate');
    return response.data;
  },
};

// ============================================================================
// RULES AND POLICIES API
// ============================================================================

export interface RulePolicy {
  id: string;
  category: string;
  title: string;
  description?: string;
  content: string;
  status: string;
  is_mandatory: boolean;
  applies_to: string[];
  version: string;
  effective_date?: string;
  expiry_date?: string;
  order: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  extra_data?: any;
}

export interface PolicyStatistics {
  policy_id: string;
  title: string;
  total_applicable_users: number;
  total_acceptances: number;
  acceptance_rate: number;
  pending_users: number;
}

export interface RulesPoliciesStats {
  total_policies: number;
  active_policies: number;
  mandatory_policies: number;
  by_category: Record<string, number>;
  recent_updates: number;
}

export interface RulePolicyListResponse {
  status: string;
  data: RulePolicy[];
  pagination: {
    total: number;
    skip: number;
    limit: number;
    has_more: boolean;
  };
}

export const rulesPoliciesAPI = {
  /**
   * List all policies with optional filters
   */
  async list(filters?: {
    category?: string;
    status?: string;
    is_mandatory?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<RulePolicyListResponse> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.is_mandatory !== undefined) params.append('is_mandatory', String(filters.is_mandatory));
    if (filters?.skip) params.append('skip', String(filters.skip));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await api.get<RulePolicyListResponse>(`/rules-policies?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single policy by ID
   */
  async get(id: string): Promise<RulePolicy> {
    const response = await api.get<RulePolicy>(`/rules-policies/${id}`);
    return response.data;
  },

  /**
   * Create a new policy
   */
  async create(data: Partial<RulePolicy>): Promise<RulePolicy> {
    const response = await api.post<RulePolicy>('/rules-policies', data);
    return response.data;
  },

  /**
   * Update an existing policy
   */
  async update(id: string, data: Partial<RulePolicy>): Promise<RulePolicy> {
    const response = await api.put<RulePolicy>(`/rules-policies/${id}`, data);
    return response.data;
  },

  /**
   * Delete a policy
   */
  async delete(id: string): Promise<{ status: string; message: string }> {
    const response = await api.delete<{ status: string; message: string }>(`/rules-policies/${id}`);
    return response.data;
  },

  /**
   * Get policy statistics
   */
  async getPolicyStats(id: string): Promise<PolicyStatistics> {
    const response = await api.get<PolicyStatistics>(`/rules-policies/${id}/stats`);
    return response.data;
  },

  /**
   * Get general statistics
   */
  async getStats(): Promise<RulesPoliciesStats> {
    const response = await api.get<RulesPoliciesStats>('/rules-policies/stats/overview');
    return response.data;
  },

  /**
   * Reorder policies
   */
  async reorder(orders: Array<{ id: string; order: number }>): Promise<{ status: string; message: string }> {
    const response = await api.post<{ status: string; message: string }>('/rules-policies/reorder', orders);
    return response.data;
  },

  /**
   * Accept a policy (for users)
   */
  async acceptPolicy(policyId: string, data?: { ip_address?: string; user_agent?: string }): Promise<any> {
    const response = await api.post(`/rules-policies/${policyId}/accept`, data || {});
    return response.data;
  },

  /**
   * Get policy acceptances (admin only)
   */
  async getAcceptances(policyId: string): Promise<any[]> {
    const response = await api.get(`/rules-policies/${policyId}/acceptances`);
    return response.data;
  },
};

// ============================================================================
// CLASSES/TURMAS ENDPOINTS
// ============================================================================

export interface Class {
  id: number;
  institution_id: string;
  name: string;
  description?: string;
  grade_level: string;
  school_year: number;
  semester?: number;
  capacity?: number;
  schedule?: any;
  status: string;
  created_at: string;
  updated_at: string;
  students?: any[];
  teachers?: any[];
  student_count?: number;
  teacher_count?: number;
}

export interface ClassStatistics {
  class_id: number;
  class_name: string;
  grade_level: string;
  school_year: number;
  total_students: number;
  total_teachers: number;
  capacity: number;
  capacity_percentage: number;
  available_spots: number;
  avg_grade?: number;
  avg_attendance_rate?: number;
  total_assignments: number;
}

export const classesAPI = {
  /**
   * Lista todas as turmas
   */
  async list(params?: {
    skip?: number;
    limit?: number;
    grade_level?: string;
    school_year?: number;
    status?: string;
  }): Promise<Class[]> {
    const response = await api.get<Class[]>('/classes', { params });
    return response.data;
  },

  /**
   * Busca uma turma por ID
   */
  async get(id: number): Promise<Class> {
    const response = await api.get<Class>(`/classes/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova turma
   */
  async create(data: {
    name: string;
    description?: string;
    grade_level: string;
    school_year: number;
    semester?: number;
    capacity?: number;
    schedule?: any;
  }): Promise<Class> {
    const response = await api.post<Class>('/classes', data);
    return response.data;
  },

  /**
   * Atualiza uma turma
   */
  async update(id: number, data: Partial<Class>): Promise<Class> {
    const response = await api.put<Class>(`/classes/${id}`, data);
    return response.data;
  },

  /**
   * Deleta uma turma
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/classes/${id}`);
  },

  /**
   * Adiciona um aluno à turma
   */
  async addStudent(classId: number, studentId: string): Promise<any> {
    const response = await api.post(`/classes/${classId}/students/${studentId}`);
    return response.data;
  },

  /**
   * Remove um aluno da turma
   */
  async removeStudent(classId: number, studentId: string): Promise<any> {
    const response = await api.delete(`/classes/${classId}/students/${studentId}`);
    return response.data;
  },

  /**
   * Lista alunos de uma turma
   */
  async getStudents(classId: number): Promise<any[]> {
    const response = await api.get(`/classes/${classId}/students`);
    return response.data;
  },

  /**
   * Adiciona um professor à turma
   */
  async addTeacher(classId: number, teacherId: string): Promise<any> {
    const response = await api.post(`/classes/${classId}/teachers/${teacherId}`);
    return response.data;
  },

  /**
   * Remove um professor da turma
   */
  async removeTeacher(classId: number, teacherId: string): Promise<any> {
    const response = await api.delete(`/classes/${classId}/teachers/${teacherId}`);
    return response.data;
  },

  /**
   * Lista professores de uma turma
   */
  async getTeachers(classId: number): Promise<any[]> {
    const response = await api.get(`/classes/${classId}/teachers`);
    return response.data;
  },

  /**
   * Estatísticas da turma
   */
  async getStatistics(classId: number): Promise<ClassStatistics> {
    const response = await api.get<ClassStatistics>(`/classes/${classId}/statistics`);
    return response.data;
  },
};

// ============================================================================
// ASSIGNMENTS/TAREFAS ENDPOINTS
// ============================================================================

export interface Assignment {
  id: number;
  institution_id: string;
  class_id: number;
  created_by: string;
  title: string;
  description?: string;
  due_date?: string;
  max_score?: number;
  weight?: number;
  assignment_type?: string;
  status: string;
  attachments?: any;
  instructions?: string;
  rubric?: any;
  allow_late_submission: boolean;
  max_attempts?: number;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  student_id: string;
  submission_date: string;
  content?: string;
  attachments?: any;
  score?: number;
  percentage_score?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  status: string;
  attempt_number: number;
  created_at: string;
  updated_at: string;
}

export interface AssignmentStatistics {
  assignment_id: number;
  assignment_title: string;
  class_name: string;
  due_date?: string;
  total_students: number;
  submitted: number;
  graded: number;
  pending: number;
  not_submitted: number;
  submission_rate: number;
  avg_score?: number;
  max_score?: number;
  min_score?: number;
}

export const assignmentsAPI = {
  /**
   * Lista tarefas
   */
  async list(params?: {
    class_id?: number;
    status?: string;
    assignment_type?: string;
    skip?: number;
    limit?: number;
  }): Promise<Assignment[]> {
    const response = await api.get<Assignment[]>('/assignments', { params });
    return response.data;
  },

  /**
   * Busca uma tarefa por ID
   */
  async get(id: number): Promise<Assignment> {
    const response = await api.get<Assignment>(`/assignments/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova tarefa
   */
  async create(data: {
    class_id: number;
    title: string;
    description?: string;
    due_date?: string;
    max_score?: number;
    weight?: number;
    assignment_type?: string;
    instructions?: string;
    allow_late_submission?: boolean;
    max_attempts?: number;
  }): Promise<Assignment> {
    const response = await api.post<Assignment>('/assignments', data);
    return response.data;
  },

  /**
   * Atualiza uma tarefa
   */
  async update(id: number, data: Partial<Assignment>): Promise<Assignment> {
    const response = await api.put<Assignment>(`/assignments/${id}`, data);
    return response.data;
  },

  /**
   * Deleta uma tarefa
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/assignments/${id}`);
  },

  /**
   * Submete uma tarefa (aluno)
   */
  async submit(assignmentId: number, data: {
    content?: string;
    attachments?: any;
  }): Promise<AssignmentSubmission> {
    const response = await api.post<AssignmentSubmission>(`/assignments/${assignmentId}/submit`, data);
    return response.data;
  },

  /**
   * Lista submissões de uma tarefa
   */
  async getSubmissions(assignmentId: number, params?: {
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<AssignmentSubmission[]> {
    const response = await api.get<AssignmentSubmission[]>(`/assignments/${assignmentId}/submissions`, { params });
    return response.data;
  },

  /**
   * Busca uma submissão específica
   */
  async getSubmission(submissionId: number): Promise<AssignmentSubmission> {
    const response = await api.get<AssignmentSubmission>(`/assignments/submissions/${submissionId}`);
    return response.data;
  },

  /**
   * Corrige uma submissão (professor)
   */
  async gradeSubmission(submissionId: number, data: {
    score: number;
    feedback?: string;
  }): Promise<AssignmentSubmission> {
    const response = await api.put<AssignmentSubmission>(`/assignments/submissions/${submissionId}/grade`, data);
    return response.data;
  },

  /**
   * Lista submissões de um aluno em todas as tarefas
   */
  async getStudentSubmissions(studentId: string, params?: {
    class_id?: number;
    status?: string;
  }): Promise<AssignmentSubmission[]> {
    const response = await api.get<AssignmentSubmission[]>(`/assignments/student/${studentId}/submissions`, { params });
    return response.data;
  },

  /**
   * Estatísticas de uma tarefa
   */
  async getStatistics(assignmentId: number): Promise<AssignmentStatistics> {
    const response = await api.get<AssignmentStatistics>(`/assignments/${assignmentId}/statistics`);
    return response.data;
  },

  /**
   * Reabre tarefa para reenvio
   */
  async reopenForStudent(submissionId: number): Promise<any> {
    const response = await api.post(`/assignments/submissions/${submissionId}/reopen`);
    return response.data;
  },

  /**
   * Publica/despublica uma tarefa
   */
  async togglePublish(assignmentId: number): Promise<Assignment> {
    const response = await api.post<Assignment>(`/assignments/${assignmentId}/toggle-publish`);
    return response.data;
  },
};

// ============================================================================
// GRADES/NOTAS ENDPOINTS
// ============================================================================

export interface Grade {
  id: number;
  institution_id: string;
  student_id: string;
  subject_id: string;
  class_id?: number;
  grade_level_id: string;
  assessment_type: string;
  grade_value: number;
  max_grade: number;
  weight?: number;
  semester?: number;
  school_year: number;
  assessment_date?: string;
  comments?: string;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

export interface StudentReportCard {
  student: {
    id: string;
    name: string;
    enrollment: string;
    grade: string;
  };
  school_year: number;
  report: {
    semester: number;
    subjects: Array<{
      subject_id: string;
      subject_name: string;
      grades: Grade[];
      average: number;
      status: string;
    }>;
    semester_average: number;
  }[];
  general_average: number;
  status: string;
}

export interface ClassGradesResponse {
  class_id: number;
  class_name: string;
  school_year: number;
  semester?: number;
  students: Array<{
    student_id: string;
    student_name: string;
    enrollment: string;
    grades: Grade[];
    average: number;
  }>;
  class_average: number;
}

export interface GradeStatistics {
  class_id: number;
  class_name: string;
  school_year: number;
  semester?: number;
  total_students: number;
  avg_grade: number;
  max_grade: number;
  min_grade: number;
  approval_rate: number;
  approved: number;
  failed: number;
  grade_distribution: {
    range: string;
    count: number;
  }[];
}

export const gradesAPI = {
  /**
   * Lista notas
   */
  async list(params?: {
    student_id?: string;
    subject_id?: string;
    class_id?: number;
    school_year?: number;
    semester?: number;
    skip?: number;
    limit?: number;
  }): Promise<Grade[]> {
    const response = await api.get<Grade[]>('/grades', { params });
    return response.data;
  },

  /**
   * Busca uma nota por ID
   */
  async get(id: number): Promise<Grade> {
    const response = await api.get<Grade>(`/grades/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova nota
   */
  async create(data: {
    student_id: string;
    subject_id: string;
    class_id?: number;
    grade_level_id: string;
    assessment_type: string;
    grade_value: number;
    max_grade: number;
    weight?: number;
    semester?: number;
    school_year: number;
    assessment_date?: string;
    comments?: string;
  }): Promise<Grade> {
    const response = await api.post<Grade>('/grades', data);
    return response.data;
  },

  /**
   * Atualiza uma nota
   */
  async update(id: number, data: Partial<Grade>): Promise<Grade> {
    const response = await api.put<Grade>(`/grades/${id}`, data);
    return response.data;
  },

  /**
   * Deleta uma nota
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/grades/${id}`);
  },

  /**
   * Boletim completo do aluno
   */
  async getStudentReportCard(studentId: string, params?: {
    school_year?: number;
  }): Promise<StudentReportCard> {
    const response = await api.get<StudentReportCard>(`/grades/student/${studentId}/report-card`, { params });
    return response.data;
  },

  /**
   * Notas de uma turma
   */
  async getClassGrades(classId: number, params?: {
    semester?: number;
    subject_id?: string;
  }): Promise<ClassGradesResponse> {
    const response = await api.get<ClassGradesResponse>(`/grades/class/${classId}/grades`, { params });
    return response.data;
  },

  /**
   * Criação em massa de notas
   */
  async createBulk(classId: number, data: {
    subject_id: string;
    grade_level_id: string;
    assessment_type: string;
    max_grade: number;
    semester?: number;
    school_year: number;
    grades: Array<{
      student_id: string;
      grade_value: number;
      comments?: string;
    }>;
  }): Promise<any> {
    const response = await api.post(`/grades/class/${classId}/bulk`, data);
    return response.data;
  },

  /**
   * Estatísticas de uma turma
   */
  async getClassStatistics(classId: number, params?: {
    semester?: number;
    subject_id?: string;
  }): Promise<GradeStatistics> {
    const response = await api.get<GradeStatistics>(`/grades/statistics/class/${classId}`, { params });
    return response.data;
  },
};

// ============================================================================
// ATTENDANCE/PRESENÇA ENDPOINTS
// ============================================================================

export interface Attendance {
  id: string;
  institution_id: string;
  student_id: string;
  class_id: number;
  date: string;
  period?: string;
  present: boolean;
  justified: boolean;
  justification?: string;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

export interface ClassAttendanceByDate {
  class_id: number;
  class_name: string;
  date: string;
  period?: string;
  total_students: number;
  recorded: number;
  present: number;
  absent: number;
  not_recorded: number;
  students: Array<{
    student_id: string;
    student_name: string;
    enrollment: string;
    present?: boolean;
    justified: boolean;
    justification?: string;
    recorded: boolean;
  }>;
}

export interface StudentAttendanceReport {
  student: {
    id: string;
    name: string;
    enrollment: string;
    grade: string;
  };
  period: {
    start: string;
    end: string;
  };
  summary: {
    total: number;
    present: number;
    absent: number;
    justified_absences: number;
    unjustified_absences: number;
    attendance_rate: number;
  };
  by_month: Record<string, {
    total: number;
    present: number;
    absent: number;
  }>;
  status: string;
}

export interface ClassAttendanceStatistics {
  class_id: number;
  class_name: string;
  period: {
    start: string;
    end: string;
  };
  overall: {
    total_records: number;
    present: number;
    absent: number;
    attendance_rate: number;
  };
  students_tracked: number;
  students_low_attendance: number;
  low_attendance_details: Array<{
    student_id: string;
    student_name: string;
    attendance_rate: number;
    total: number;
    present: number;
    absent: number;
  }>;
}

export const attendanceAPI = {
  /**
   * Registra presença individual
   */
  async create(data: {
    student_id: string;
    class_id: number;
    date: string;
    present: boolean;
    period?: string;
    justified?: boolean;
    justification?: string;
  }): Promise<Attendance> {
    const response = await api.post<Attendance>('/attendance', data);
    return response.data;
  },

  /**
   * Registro em massa de presença
   */
  async createBulk(data: {
    class_id: number;
    date: string;
    period?: string;
    attendances: Array<{
      student_id: string;
      present: boolean;
      justified?: boolean;
      justification?: string;
    }>;
  }): Promise<any> {
    const response = await api.post('/attendance/bulk', data);
    return response.data;
  },

  /**
   * Busca presença de uma turma em uma data
   */
  async getClassAttendanceByDate(
    classId: number,
    date: string,
    period?: string
  ): Promise<ClassAttendanceByDate> {
    const params = period ? { period } : {};
    const response = await api.get<ClassAttendanceByDate>(`/attendance/class/${classId}/date/${date}`, { params });
    return response.data;
  },

  /**
   * Relatório de presença de um aluno
   */
  async getStudentReport(studentId: string, params?: {
    start_date?: string;
    end_date?: string;
    class_id?: number;
  }): Promise<StudentAttendanceReport> {
    const response = await api.get<StudentAttendanceReport>(`/attendance/student/${studentId}/report`, { params });
    return response.data;
  },

  /**
   * Estatísticas de presença de uma turma
   */
  async getClassStatistics(classId: number, params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ClassAttendanceStatistics> {
    const response = await api.get<ClassAttendanceStatistics>(`/attendance/class/${classId}/statistics`, { params });
    return response.data;
  },

  /**
   * Deleta registro de presença
   */
  async delete(attendanceId: string): Promise<void> {
    await api.delete(`/attendance/${attendanceId}`);
  },
};

// ============================================================================
// EXPORT
// ============================================================================

export default api;

export {
  API_BASE_URL,
  WS_BASE_URL,
};
