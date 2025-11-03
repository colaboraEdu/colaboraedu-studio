import React, { useState } from 'react';
import type { UserProfile } from '../../types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardHome } from './DashboardHome';
import { UserManagement } from './UserManagement';
import { Institutions } from './Institutions';
import { PDFProcessor } from './PDFProcessor';
import { SystemSettings } from './SystemSettings';
import { ChatDashboard } from './chat/ChatDashboard';
import { Permissions } from './Permissions';
import { AccessLogs } from './AccessLogs';
import { Statistics } from './Statistics';
import { GeneralReports } from './GeneralReports';
import { ExportData } from './ExportData';
import { Alerts } from './Alerts';
import { MyProfile } from './MyProfile';
import { RulesAndPolicies } from './RulesAndPolicies';
import AcademicParameters from './AcademicParameters';
import Integrations from './Integrations';

interface AdminDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
}

export type AdminView = 
  | 'home'
  | 'institutions'
  | 'pdfProcessor'
  | 'manageUsers'
  | 'permissions'
  | 'accessLogs'
  | 'generalReports'
  | 'statistics'
  | 'exportData'
  | 'alerts'
  | 'systemSettings'
  | 'rulesAndPolicies'
  | 'academicParameters'
  | 'integrations'
  | 'myProfile'
  | 'chat';


const viewTitles: Record<AdminView, string> = {
  home: 'Início',
  institutions: 'Instituições',
  pdfProcessor: 'Processador de PDF',
  manageUsers: 'Gerenciar Usuários',
  permissions: 'Permissões',
  accessLogs: 'Logs de Acesso',
  generalReports: 'Relatórios Gerais',
  statistics: 'Estatísticas',
  exportData: 'Exportar Dados',
  alerts: 'Alertas',
  systemSettings: 'Configurações do Sistema',
  rulesAndPolicies: 'Regras e Políticas',
  academicParameters: 'Parâmetros Acadêmicos',
  integrations: 'Integrações',
  myProfile: 'Meu Perfil',
  chat: 'Comunicação',
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ profile, onLogout }) => {
  const [activeView, setActiveView] = useState<AdminView>('home');

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <DashboardHome />;
      case 'manageUsers':
        return <UserManagement />;
      case 'institutions':
        return <Institutions />;
      case 'pdfProcessor':
        return <PDFProcessor />;
      case 'permissions':
        return <Permissions />;
      case 'accessLogs':
        return <AccessLogs />;
      case 'statistics':
        return <Statistics />;
      case 'generalReports':
        return <GeneralReports />;
      case 'exportData':
        return <ExportData />;
      case 'alerts':
        return <Alerts />;
      case 'myProfile':
        return <MyProfile />;
      case 'systemSettings':
        return <SystemSettings />;
      case 'rulesAndPolicies':
        return <RulesAndPolicies />;
      case 'academicParameters':
        return <AcademicParameters />;
      case 'integrations':
        return <Integrations />;
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
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
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