import React, { useState } from 'react';
import type { UserProfile } from '../../../types';
import { Header } from '../Header';
import { ProfessorSidebar } from './ProfessorSidebar';
import { MinhasTurmas } from './MinhasTurmas';
import { Presenca } from './Presenca';
import { ChatDashboard } from '../chat/ChatDashboard';

interface ProfessorDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
}

export type ProfessorView = 
  | 'minhasTurmas'
  | 'criarAula'
  | 'minhasAulas'
  | 'rascunhos'
  | 'tarefas'
  | 'correcoes'
  | 'presenca'
  | 'diarioDeClasse'
  | 'relatorios'
  | 'meuPerfil'
  | 'chat';

const viewTitles: Record<ProfessorView, string> = {
  minhasTurmas: 'Minhas Turmas',
  criarAula: 'Criar Aula',
  minhasAulas: 'Minhas Aulas',
  rascunhos: 'Rascunhos',
  tarefas: 'Tarefas',
  correcoes: 'Correções',
  presenca: 'Presença',
  diarioDeClasse: 'Diário de Classe',
  relatorios: 'Relatórios',
  meuPerfil: 'Meu Perfil',
  chat: 'Comunicação',
};

export const ProfessorDashboard: React.FC<ProfessorDashboardProps> = ({ profile, onLogout }) => {
  const [activeView, setActiveView] = useState<ProfessorView>('minhasTurmas');

  const renderContent = () => {
    switch (activeView) {
      case 'minhasTurmas':
        return <MinhasTurmas />;
      case 'presenca':
        return <Presenca />;
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
      <ProfessorSidebar activeView={activeView} setActiveView={setActiveView} />
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