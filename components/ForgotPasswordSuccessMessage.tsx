import React from 'react';
import type { UserProfile } from '../types';

interface ForgotPasswordSuccessMessageProps {
  profile: UserProfile;
  onBackToLogin: () => void;
}

export const ForgotPasswordSuccessMessage: React.FC<ForgotPasswordSuccessMessageProps> = ({ profile, onBackToLogin }) => {
  const { colorClasses } = profile;
  
  return (
    <div className="p-8 text-center animate-fade-in">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-green-100 mx-auto ring-4 ring-green-200`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Email Enviado!</h2>
      <p className="text-gray-600 mt-2">
        Um link para redefinir sua senha foi enviado para o endereço de e-mail fornecido. Por favor, verifique sua caixa de entrada e pasta de spam.
      </p>
      <div className="mt-8">
        <button
          type="button"
          onClick={onBackToLogin}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${colorClasses.button} ${colorClasses.buttonHover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClasses.ring} transition-transform transform hover:scale-105`}
        >
          Voltar para o Login
        </button>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};