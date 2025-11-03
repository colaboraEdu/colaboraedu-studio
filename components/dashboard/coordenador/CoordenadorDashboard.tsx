import React, { useState } from 'react';
import type { UserProfile } from '../../../types';
import { Header } from '../Header';
import { CoordenadorSidebar } from './CoordenadorSidebar';
import { CoordenadorHome } from './CoordenadorHome';
import { GerenciarProfessores } from './GerenciarProfessores';
import { ChatDashboard } from '../chat/ChatDashboard';


interface CoordenadorDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
}

export type CoordenadorView =
  | 'departamentos'
  | 'professores'
  | 'curriculo'
  | 'projetos'
  | 'relatorios'
  | 'reunioes'
  | 'configuracoes'
  | 'meuPerfil'
  | 'chat';

const viewTitles: Record<CoordenadorView, string> = {
  departamentos: 'Departamentos',
  professores: 'Gerenciar Professores',
  curriculo: 'Currículo',
  projetos: 'Projetos',
  relatorios: 'Relatórios',
  reunioes: 'Reuniões',
  configuracoes: 'Configurações',
  meuPerfil: 'Meu Perfil',
  chat: 'Comunicação',
};

export const CoordenadorDashboard: React.FC<CoordenadorDashboardProps> = ({ profile, onLogout }) => {
  const [activeView, setActiveView] = useState<CoordenadorView>('departamentos');

  const renderContent = () => {
    switch (activeView) {
      case 'departamentos':
        return <CoordenadorHome />;
      case 'professores':
        return <GerenciarProfessores />;
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
      <CoordenadorSidebar activeView={activeView} setActiveView={setActiveView} />
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