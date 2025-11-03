import React, { useState } from 'react';
import type { UserProfile } from '../../../types';
import { Header } from '../Header';
import { SecretarioSidebar } from './SecretarioSidebar';
import { SecretarioHome } from './SecretarioHome';
import { GerenciarDocumentos } from './GerenciarDocumentos';
import { ChatDashboard } from '../chat/ChatDashboard';

interface SecretarioDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
}

export type SecretarioView =
  | 'matriculas'
  | 'documentos'
  | 'certificados'
  | 'chat'
  | 'relatorios'
  | 'arquivo'
  | 'meuPerfil';

const viewTitles: Record<SecretarioView, string> = {
  matriculas: 'Matrículas',
  documentos: 'Gerenciar Documentos',
  certificados: 'Certificados',
  chat: 'Comunicação',
  relatorios: 'Relatórios',
  arquivo: 'Arquivo Morto',
  meuPerfil: 'Meu Perfil',
};

export const SecretarioDashboard: React.FC<SecretarioDashboardProps> = ({ profile, onLogout }) => {
  const [activeView, setActiveView] = useState<SecretarioView>('matriculas');

  const renderContent = () => {
    switch (activeView) {
      case 'matriculas':
        return <SecretarioHome />;
      case 'documentos':
        return <GerenciarDocumentos />;
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
      <SecretarioSidebar activeView={activeView} setActiveView={setActiveView} />
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