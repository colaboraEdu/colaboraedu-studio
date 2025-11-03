import { authAPI, User } from './src/services/api';

export const mockCredentials = {
  admin: { email: 'admin@colaboraedu.com', password: 'admin123' },
  professor: { email: 'professor@colaboraedu.com', password: 'senha123' },
  aluno: { email: 'aluno@colaboraedu.com', password: 'senha123' },
  coordenador: { email: 'coordenador@colaboraedu.com', password: 'senha123' },
  secretario: { email: 'secretario@colaboraedu.com', password: 'senha123' },
  orientador: { email: 'orientador@colaboraedu.com', password: 'senha123' },
  bibliotecario: { email: 'bibliotecario@colaboraedu.com', password: 'senha123' },
  responsavel: { email: 'responsavel@colaboraedu.com', password: 'senha123' },
};

type ProfileId = keyof typeof mockCredentials;

/**
 * Validate credentials using the real backend API
 */
export const validateCredentials = async (profileId: string, email: string, password: string): Promise<boolean> => {
  try {
    // Authenticate with the real backend API
    const response = await authAPI.login(email, password);
    
    console.log('✅ Login bem-sucedido:', response.user);
    return true;
    
  } catch (error: any) {
    console.error('❌ Erro no login:', error);
    
    // Se for erro de rede, pode tentar fallback mock (apenas para desenvolvimento)
    if (error.type === 'network_error') {
      console.warn('⚠️ Usando validação mock (erro de rede)');
      const id = profileId as ProfileId;
      if (mockCredentials[id]) {
        return mockCredentials[id].email.toLowerCase() === email.toLowerCase() && 
               mockCredentials[id].password === password;
      }
    }
    
    return false;
  }
};

/**
 * Login function that integrates with real backend
 */
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await authAPI.login(email, password);
    console.log('✅ Usuário autenticado:', response.user);
    return response.user;
  } catch (error: any) {
    console.error('❌ Erro no login:', error);
    throw new Error(error.message || 'Falha ao fazer login');
  }
};

/**
 * Logout function
 */
export const logout = (): void => {
  authAPI.logout();
  console.log('✅ Logout realizado');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return authAPI.isAuthenticated();
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return authAPI.getCurrentUser();
};

/**
 * Get user profile from backend
 */
export const getProfile = async (): Promise<User> => {
  try {
    const user = await authAPI.getProfile();
    console.log('✅ Perfil carregado:', user);
    return user;
  } catch (error: any) {
    console.error('❌ Erro ao buscar perfil:', error);
    throw error;
  }
};