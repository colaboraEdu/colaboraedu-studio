import React, { useState } from 'react';
import type { UserProfile } from '../../../types';
import { Header } from '../Header';
import { OrientadorSidebar } from './OrientadorSidebar';
import { OrientadorHome } from './OrientadorHome';
import { GerenciarAlunos } from './GerenciarAlunos';
import { Ocorrencias } from './Ocorrencias';
import { ChatDashboard } from '../chat/ChatDashboard';

interface OrientadorDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
}

export type OrientadorView =
  | 'dashboard'
  | 'alunos'
  | 'atendimentos'
  | 'ocorrencias'
  | 'agenda'
  | 'relatorios'
  | 'biblioteca'
  | 'perfil'
  | 'configuracoes'
  | 'notificacoes'
  | 'ajuda'
  | 'chat';

const viewTitles: Record<OrientadorView, string> = {
  dashboard: 'Dashboard',
  alunos: 'Gerenciar Alunos',
  atendimentos: 'Sessões de Orientação',
  ocorrencias: 'Registro de Ocorrências',
  agenda: 'Agenda',
  relatorios: 'Relatórios e Análises',
  biblioteca: 'Recursos Pedagógicos',
  perfil: 'Meu Perfil',
  configuracoes: 'Configurações do Sistema',
  notificacoes: 'Central de Notificações',
  ajuda: 'Suporte e Ajuda',
  chat: 'Comunicação',
};

export const OrientadorDashboard: React.FC<OrientadorDashboardProps> = ({ profile, onLogout }) => {
  const [activeView, setActiveView] = useState<OrientadorView>('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <OrientadorHome />;
      case 'alunos':
        return <GerenciarAlunos />;
      case 'ocorrencias':
        return <Ocorrencias />;
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
      <OrientadorSidebar activeView={activeView} setActiveView={setActiveView} />
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