import React from 'react';
import type { UserProfile } from '../../types';

interface PlaceholderDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
}

export const PlaceholderDashboard: React.FC<PlaceholderDashboardProps> = ({ profile, onLogout }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <header className={`flex items-center justify-between p-4 text-white shadow-md ${profile.colorClasses.button}`}>
        <h1 className="text-2xl font-bold">Dashboard {profile.name}</h1>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline">Bem-vindo(a)!</span>
          <button
            onClick={onLogout}
            className="flex items-center px-4 py-2 font-semibold bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
             Sair
          </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="text-center bg-white p-8 sm:p-12 rounded-2xl shadow-xl max-w-2xl w-full">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 mx-auto ${profile.colorClasses.button} ring-4 ring-offset-4 ring-offset-white ${profile.colorClasses.ring}`}>
            {/* FIX: Cast profile.icon to React.ReactElement<any> to resolve overload error when cloning the element with a new className. */}
            {React.cloneElement(profile.icon as React.ReactElement<any>, { className: "h-12 w-12 text-white" })}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Bem-vindo, {profile.name}!</h2>
          <p className="text-base sm:text-lg text-gray-600">
            O dashboard completo para o seu perfil está em desenvolvimento.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Em breve, você terá acesso a todas as suas ferramentas e funcionalidades aqui.
          </p>
        </div>
      </main>
    </div>
  );
};