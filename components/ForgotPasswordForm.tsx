import React from 'react';
import type { UserProfile } from '../types';

interface ForgotPasswordFormProps {
  profile: UserProfile;
  onSubmit: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ profile, onSubmit, onBackToLogin }) => {
  const { name, icon, colorClasses } = profile;

  return (
    <div className="p-8 pt-10">
      <div className="text-center mb-8">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${colorClasses.button} mx-auto shadow-lg ${colorClasses.ring} ring-4 ring-opacity-30`}>
          {/* FIX: Cast icon to React.ReactElement<any> to resolve overload error when cloning the element with a new className. */}
          {React.cloneElement(icon as React.ReactElement<any>, { className: "h-10 w-10 text-white" })}
        </div>
        <h2 className={`text-2xl font-bold ${colorClasses.text}`}>Recuperar Senha</h2>
        <p className="text-sm text-gray-500 mt-1">Acesso como {name}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="email-forgot" className="block text-sm font-medium text-gray-700">
            Email de Cadastro
          </label>
          <div className="mt-1">
            <input
              id="email-forgot"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClasses.ring} sm:text-sm`}
              placeholder="seu.email@exemplo.com"
            />
          </div>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
            Enviaremos um link de recuperação para o seu email para que você possa criar uma nova senha.
        </p>

        <div>
          <button
            type="submit"
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${colorClasses.button} ${colorClasses.buttonHover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClasses.ring} transition-transform transform hover:scale-105`}
          >
            Enviar Link de Recuperação
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className={`text-sm font-medium ${colorClasses.text} ${colorClasses.buttonHover} hover:underline focus:outline-none focus:underline`}
        >
          &larr; Voltar para o login
        </button>
      </div>
    </div>
  );
};