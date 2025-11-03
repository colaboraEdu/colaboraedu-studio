/**
 * Authentication Service
 * Handles user authentication with the FastAPI backend
 */

import { api, LoginRequest, LoginResponse, ApiResponse } from './api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  institution_id: string;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {
    // Try to restore authentication state from localStorage
    this.restoreAuthState();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private restoreAuthState(): void {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('current_user');
    
    if (token && userData) {
      try {
        this.currentUser = JSON.parse(userData);
        api.setToken(token);
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        this.clearAuthState();
      }
    }
  }

  private saveAuthState(user: User, token: string): void {
    localStorage.setItem('access_token', token);
    localStorage.setItem('current_user', JSON.stringify(user));
    api.setToken(token);
    this.currentUser = user;
  }

  private clearAuthState(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    api.clearToken();
    this.currentUser = null;
  }

  public async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      // Create FormData for OAuth2 login
      const formData = new FormData();
      formData.append('username', email); // FastAPI OAuth2 expects 'username'
      formData.append('password', password);

      const response = await fetch(`${api['baseURL']}/auth/login`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.detail || 'Login failed'
        };
      }

      const loginData = await response.json();
      
      // Save authentication state
      this.saveAuthState(loginData.user, loginData.access_token);

      return {
        success: true,
        data: loginData
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error during login'
      };
    }
  }

  public async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      this.clearAuthState();
    }
  }

  public async getCurrentUser(): Promise<ApiResponse<User>> {
    if (!this.isAuthenticated()) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    try {
      const response = await api.get<User>('/users/me');
      
      if (response.success && response.data) {
        this.currentUser = response.data;
        localStorage.setItem('current_user', JSON.stringify(response.data));
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user info'
      };
    }
  }

  public async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    // If there's a refresh token endpoint, implement it here
    // For now, just check if current token is still valid
    return this.getCurrentUser() as any;
  }

  public isAuthenticated(): boolean {
    return !!(this.currentUser && api.getToken());
  }

  public getUser(): User | null {
    return this.currentUser;
  }

  public getUserRole(): string | null {
    return this.currentUser?.role || null;
  }

  public getUserInstitution(): string | null {
    return this.currentUser?.institution_id || null;
  }

  public hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  public hasAnyRole(roles: string[]): boolean {
    if (!this.currentUser?.role) return false;
    return roles.includes(this.currentUser.role);
  }

  // Role hierarchy check
  public hasMinimumRole(minimumRole: string): boolean {
    if (!this.currentUser?.role) return false;
    
    const roleHierarchy = {
      'aluno': 0,
      'responsavel': 1,
      'professor': 2,
      'bibliotecario': 3,
      'secretario': 4,
      'orientador': 5,
      'coordenador': 6,
      'admin': 7
    };

    const userRoleLevel = roleHierarchy[this.currentUser.role as keyof typeof roleHierarchy];
    const minimumRoleLevel = roleHierarchy[minimumRole as keyof typeof roleHierarchy];

    return userRoleLevel >= minimumRoleLevel;
  }
}

export const authService = AuthService.getInstance();