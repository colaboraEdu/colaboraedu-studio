import React, { useState } from 'react';
import type { UserProfile } from '../../../types';
import { Header } from '../Header';
import { AlunoSidebar } from './AlunoSidebar';
import { MinhasAulas } from './MinhasAulas';
import { AlunoNotas } from './AlunoNotas';
import { AlunoPresenca } from './AlunoPresenca';
import { ChatDashboard } from '../chat/ChatDashboard';

interface AlunoDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
}

export type AlunoView =
  | 'minhasAulas'
  | 'tarefas'
  | 'notas'
  | 'presenca'
  | 'calendario'
  | 'biblioteca'
  | 'mensagens'
  | 'meuPerfil'
  | 'chat';

const viewTitles: Record<AlunoView, string> = {
  minhasAulas: 'Minhas Aulas',
  tarefas: 'Tarefas',
  notas: 'Minhas Notas',
  presenca: 'Minha Presença',
  calendario: 'Calendário',
  biblioteca: 'Biblioteca',
  mensagens: 'Mensagens',
  meuPerfil: 'Meu Perfil',
  chat: 'Mensagens',
};

export const AlunoDashboard: React.FC<AlunoDashboardProps> = ({ profile, onLogout }) => {
  const [activeView, setActiveView] = useState<AlunoView>('minhasAulas');

  const renderContent = () => {
    switch (activeView) {
      case 'minhasAulas':
        return <MinhasAulas />;
      case 'notas':
        return <AlunoNotas />;
      case 'presenca':
        return <AlunoPresenca />;
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
      <AlunoSidebar activeView={activeView} setActiveView={setActiveView} />
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