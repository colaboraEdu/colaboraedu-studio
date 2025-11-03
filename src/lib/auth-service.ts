/**
 * Authentication Service Layer
 * Integrates API client with Zustand store for complete auth management
 * Part of colaboraEDU integrated development plan
 */

import { authAPI, type User } from './api-client';
import { useAppStore, resetStore } from './store';
import { toast } from 'sonner';

// ============================================================================
// AUTH SERVICE CLASS
// ============================================================================

export class AuthService {
  private store: typeof useAppStore;

  constructor() {
    this.store = useAppStore;
  }

  // ========================================================================
  // AUTHENTICATION METHODS
  // ========================================================================

  /**
   * Initialize authentication from stored data
   */
  async initializeAuth(): Promise<void> {
    const { setLoading, setUser, setToken, setError } = this.store.getState();

    try {
      setLoading(true);
      setError(null);

      const storedToken = localStorage.getItem('auth_token');
      const storedUserData = localStorage.getItem('user_data');

      if (!storedToken || !storedUserData) {
        // No stored auth data - user needs to login
        return;
      }

      try {
        const user = JSON.parse(storedUserData);
        
        // Restore auth state from localStorage
        setUser(user);
        setToken(storedToken);
        
      } catch (parseError) {
        console.error('[AuthService] Error parsing stored user data:', parseError);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    } catch (error) {
      console.error('[AuthService] Error during auth initialization:', error);
      setError('Erro ao inicializar autenticação');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User | null> {
    const { setLoading, setError, setUser, setToken } = this.store.getState();
    
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(email, password);
      const { user, access_token } = response;

      // Update store state
      setUser(user);
      setToken(access_token);

      // Persist to localStorage
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(user));

      toast.success(`Login realizado com sucesso! Bem-vindo, ${user.full_name}`);
      
      return user;
    } catch (error: any) {
      console.error('AuthService: Login error:', error);
      const errorMsg = this.formatError(error);
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Logout user and cleanup
   */
  async logout(): Promise<void> {
    try {
      const { user } = this.store.getState();
      
      // Try to call logout endpoint
      try {
        await authAPI.logout();
      } catch (error) {
        console.warn('Logout API call failed:', error);
        // Continue with cleanup even if API call fails
      }

      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');

      // Reset store state
      resetStore();

      if (user) {
        toast.success(`Até logo, ${user.full_name}!`);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force cleanup even if there's an error
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      resetStore();
      
      toast.error('Erro durante logout, mas você foi desconectado.');
    }
  }

  /**
   * Refresh current user data
   */
  async refreshUser(): Promise<User | null> {
    const { setLoading, setError, setUser, token } = this.store.getState();

    if (!token) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const user = await authAPI.getCurrentUser();
      
      setUser(user);
      localStorage.setItem('user_data', JSON.stringify(user));
      
      return user;
    } catch (error) {
      const errorMsg = this.formatError(error);
      setError(errorMsg);
      
      // If user fetch fails with auth error, logout
      if (this.isAuthError(error)) {
        toast.error('Sessão expirada. Faça login novamente.');
        this.logout();
      } else {
        toast.error(`Erro ao atualizar dados: ${errorMsg}`);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Check if error is authentication-related
   */
  private isAuthError(error: any): boolean {
    if (error?.response?.status === 401) {
      return true;
    }
    if (error?.status === 401) {
      return true;
    }
    if (error?.message?.toLowerCase().includes('unauthorized')) {
      return true;
    }
    if (error?.message?.toLowerCase().includes('token')) {
      return true;
    }
    return false;
  }

  /**
   * Format error message for display
   */
  private formatError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.response?.data?.detail) {
      return error.response.data.detail;
    }
    
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.response?.statusText) {
      return error.response.statusText;
    }
    
    return 'Erro desconhecido';
  }

  /**
   * Get current authentication state
   */
  getAuthState() {
    const { user, token, isAuthenticated, isLoading, error } = this.store.getState();
    return {
      user,
      token,
      isAuthenticated,
      isLoading,
      error,
    };
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const { user } = this.store.getState();
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const { user } = this.store.getState();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if current user is authenticated
   */
  isAuthenticated(): boolean {
    return authAPI.isAuthenticated();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

// Create singleton instance
export const authService = new AuthService();

// ============================================================================
// REACT HOOKS FOR AUTHENTICATION
// ============================================================================

/**
 * Hook for authentication operations
 */
export const useAuthService = () => {
  // Use separate selectors to avoid recreating objects
  const user = useAppStore(state => state.user);
  const token = useAppStore(state => state.token);
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  const isLoading = useAppStore(state => state.isLoading);
  const error = useAppStore(state => state.error);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    refreshUser: authService.refreshUser.bind(authService),
    initializeAuth: authService.initializeAuth.bind(authService),
    
    // Utilities
    hasRole: authService.hasRole.bind(authService),
    hasAnyRole: authService.hasAnyRole.bind(authService),
    isAdmin: authService.isAdmin.bind(authService),
  };
};

/**
 * Hook for route protection
 */
export const useAuthGuard = (requiredRoles?: string[]) => {
  const { user, isAuthenticated, isLoading } = useAppStore(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
  }));

  const hasAccess = () => {
    if (!isAuthenticated || !user) {
      return false;
    }
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    return requiredRoles.includes(user.role);
  };

  return {
    isAuthenticated,
    isLoading,
    hasAccess: hasAccess(),
    user,
    needsLogin: !isAuthenticated && !isLoading,
    needsRole: isAuthenticated && requiredRoles && !hasAccess(),
  };
};

/**
 * Hook for protected API calls
 */
export const useProtectedApi = () => {
  const { token } = useAppStore(state => ({
    token: state.token,
  }));

  const callApi = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    if (!authAPI.isAuthenticated()) {
      toast.error('Você precisa estar logado');
      throw new Error('Not authenticated');
    }

    try {
      return await apiCall();
    } catch (error: any) {
      if (authService['isAuthError'](error)) {
        toast.error('Sessão expirada. Faça login novamente.');
        authService.logout();
        throw new Error('Session expired');
      }
      throw error;
    }
  };

  return {
    callApi,
    isAuthenticated: authAPI.isAuthenticated(),
  };
};

export default authService;