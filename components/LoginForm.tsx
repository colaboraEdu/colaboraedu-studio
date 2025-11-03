import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuthService } from '../src/lib/auth-service';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from '../src/components/ui/alert';
import { cn } from '../lib/utils';

interface LoginFormProps {
  onSuccess?: () => void;
  onShowForgotPassword?: () => void;
}

const REMEMBER_ME_KEY = 'colaboraEDU_remembered_email';

// Demo credentials for testing
const DEMO_CREDENTIALS = {
  admin: { email: 'admin@colaboraedu.com', password: 'admin123' },
  professor: { email: 'professor@colaboraedu.com', password: 'professor123' },
  aluno: { email: 'aluno@colaboraedu.com', password: 'aluno123' },
  coordenador: { email: 'coordenador@colaboraedu.com', password: 'coord123' },
};

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  onShowForgotPassword 
}) => {
  const { 
    login, 
    isLoading, 
    error: authError, 
    user,
    isAuthenticated 
  } = useAuthService();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<keyof typeof DEMO_CREDENTIALS>('admin');

  useEffect(() => {
    // Check for a remembered email in localStorage
    const rememberedEmail = localStorage.getItem(REMEMBER_ME_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    } else {
      // Pre-fill with demo credentials
      setEmail(DEMO_CREDENTIALS[selectedRole].email);
      setPassword(DEMO_CREDENTIALS[selectedRole].password);
    }
  }, [selectedRole]);

  const handleRoleChange = (role: keyof typeof DEMO_CREDENTIALS) => {
    setSelectedRole(role);
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword(DEMO_CREDENTIALS[role].password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      const loginResult = await login(email.trim(), password);
      
      if (loginResult) {
        // On successful login, handle 'Remember Me' preference
        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_KEY, email);
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
        }
        
        // Call success callback
        onSuccess?.();
      }
    } catch (err) {
      console.error('Login error:', err);
      // Error is handled by the auth service and displayed via authError
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4 mx-auto shadow-xl"
        >
          <FiLock size={40} color="white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo!
        </h2>
        <p className="text-sm text-slate-500">
          Faça login para acessar o sistema colaboraEDU
        </p>
      </motion.div>

      {/* Demo Role Selector */}
      <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <Label className="text-sm font-semibold text-blue-900 mb-3 block">
          🎭 Demo - Selecione um perfil:
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(DEMO_CREDENTIALS).map((role) => (
            <Button
              key={role}
              type="button"
              variant={selectedRole === role ? "default" : "outline"}
              size="sm"
              onClick={() => handleRoleChange(role as keyof typeof DEMO_CREDENTIALS)}
              className="text-xs capitalize"
            >
              {role}
            </Button>
          ))}
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Alert */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-medium">{authError}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Email Field */}
        <div>
          <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Email
          </Label>
          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiMail size={16} color="#94a3b8" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "pl-11 pr-4 py-3 rounded-xl border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                authError && "border-red-300 focus:ring-red-200 focus:border-red-500"
              )}
              placeholder="seu.email@exemplo.com"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
            Senha
          </Label>
          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiLock size={16} color="#94a3b8" />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "pl-11 pr-12 py-3 rounded-xl border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                authError && "border-red-300 focus:ring-red-200 focus:border-red-500"
              )}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember me and forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer group">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
              Lembrar-me
            </span>
          </label>
          {onShowForgotPassword && (
            <button
              type="button"
              onClick={onShowForgotPassword}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline focus:outline-none transition-all"
              disabled={isLoading}
            >
              Esqueceu a senha?
            </button>
          )}
        </div>

        {/* Submit Button */}
        <motion.div
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          <Button
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Entrando...</span>
              </>
            ) : (
              'Entrar no Sistema'
            )}
          </Button>
        </motion.div>

        {/* Demo credentials info */}
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-800 text-center leading-relaxed">
            💡 <strong>Modo Demo:</strong> Credenciais pré-configuradas para teste.<br />
            <span className="font-mono text-[10px]">
              {DEMO_CREDENTIALS[selectedRole].email} / {DEMO_CREDENTIALS[selectedRole].password}
            </span>
          </p>
        </div>

        {/* Current user info (if authenticated) */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200"
          >
            <p className="text-sm text-green-800 text-center">
              ✅ Logado como: <strong>{user.full_name}</strong> ({user.role})
            </p>
          </motion.div>
        )}
      </form>
    </div>
  );
};