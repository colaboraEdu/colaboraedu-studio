import React, { useState } from 'react';
import type { UserProfile } from '../../../types';
import { Header } from '../Header';
import { ResponsavelSidebar } from './ResponsavelSidebar';
import { MeusFilhos } from './MeusFilhos';
import { Boletins } from './Boletins';
import { Presenca } from './Presenca';
import { Pagamentos } from './Pagamentos';
import { ChatDashboard } from '../chat/ChatDashboard';

interface ResponsavelDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
}

export type ResponsavelView =
  | 'meusFilhos'
  | 'boletins'
  | 'presenca'
  | 'chat'
  | 'pagamentos'
  | 'reunioes'
  | 'meuPerfil';

const viewTitles: Record<ResponsavelView, string> = {
  meusFilhos: 'Meus Filhos',
  boletins: 'Boletins',
  presenca: 'Presença',
  chat: 'Comunicação',
  pagamentos: 'Pagamentos',
  reunioes: 'Reuniões',
  meuPerfil: 'Meu Perfil',
};

export const ResponsavelDashboard: React.FC<ResponsavelDashboardProps> = ({ profile, onLogout }) => {
  const [activeView, setActiveView] = useState<ResponsavelView>('meusFilhos');

  const renderContent = () => {
    switch (activeView) {
      case 'meusFilhos':
        return <MeusFilhos />;
      case 'boletins':
        return <Boletins />;
      case 'presenca':
        return <Presenca />;
      case 'pagamentos':
        return <Pagamentos />;
      case 'chat':
        return <ChatDashboard currentUserProfile={profile} />;
      default:
        return (
          <div className="p-8 bg-white rounded-lg shadow animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-700">{viewTitles[activeView]}</h2>
            <p className="mt-4 text-gray-500">Esta funcionalidade está em desenvolvimento.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <ResponsavelSidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={viewTitles[activeView]} user={profile} onLogout={onLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
          {renderContent()}
        </main>
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