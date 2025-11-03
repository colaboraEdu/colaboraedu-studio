import React from 'react';
import type { OrientadorView } from './OrientadorDashboard';

interface SidebarProps {
  activeView: OrientadorView;
  setActiveView: (view: OrientadorView) => void;
}

const iconClasses = "h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white";

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, description, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`group w-full flex items-center text-left px-3 py-3 rounded-md transition-colors duration-200 ease-in-out ${
      isActive
        ? 'bg-purple-600 text-white'
        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
    }`}
  >
    <div className="flex-shrink-0 w-6 flex justify-center">{icon}</div>
    <div className="ml-3">
        <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>{label}</p>
        <p className={`text-xs truncate ${isActive ? 'text-purple-200' : 'text-gray-400'}`}>{description}</p>
    </div>
  </button>
);

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="px-3 pt-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
);

export const OrientadorSidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <div className="flex flex-col w-64 bg-slate-800 text-white">
      <div className="flex items-center justify-center h-20 border-b border-slate-700 px-4">
        <div className="flex items-center space-x-2">
           <svg width="30" height="30" viewBox="0 0 100 100" className="flex-shrink-0">
            <path d="M0 20 L40 20 L40 0 L60 0 L60 60 L100 60 L100 80 L0 80 Z" fill="#3B82F6" />
            <path d="M40 40 L40 60 L20 60 L20 40 Z" fill="#10B981" />
           </svg>
          <div>
            <span className="text-xl font-bold tracking-tight">colabora</span>
            <span className="text-xl font-bold text-blue-500 tracking-tight">EDU</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        <SectionTitle title="Principal" />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} label="Dashboard" description="Visão geral" isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} label="Alunos" description="Gerenciar alunos" isActive={activeView === 'alunos'} onClick={() => setActiveView('alunos')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} label="Atendimentos" description="Sessões de orientação" isActive={activeView === 'atendimentos'} onClick={() => setActiveView('atendimentos')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} label="Comunicação" description="Mensagens diretas" isActive={activeView === 'chat'} onClick={() => setActiveView('chat')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Ocorrências" description="Registrar incidentes" isActive={activeView === 'ocorrencias'} onClick={() => setActiveView('ocorrencias')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label="Agenda" description="Calendário e compromissos" isActive={activeView === 'agenda'} onClick={() => setActiveView('agenda')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} label="Relatórios" description="Relatórios e análises" isActive={activeView === 'relatorios'} onClick={() => setActiveView('relatorios')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>} label="Biblioteca" description="Recursos pedagógicos" isActive={activeView === 'biblioteca'} onClick={() => setActiveView('biblioteca')} />
        
        <SectionTitle title="Secundário" />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>} label="Perfil" description="Meu perfil" isActive={activeView === 'perfil'} onClick={() => setActiveView('perfil')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} label="Configurações" description="Configurações do sistema" isActive={activeView === 'configuracoes'} onClick={() => setActiveView('configuracoes')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} label="Notificações" description="Central de notificações" isActive={activeView === 'notificacoes'} onClick={() => setActiveView('notificacoes')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.191.445-2.288 1.174-3.093l-1.428-1.428A6.974 6.974 0 004 13c0 3.866 3.134 7 7 7s7-3.134 7-7-3.134-7-7-7c-1.488 0-2.854.474-3.962 1.257L8.228 9z" /></svg>} label="Ajuda" description="Suporte e ajuda" isActive={activeView === 'ajuda'} onClick={() => setActiveView('ajuda')} />
      </nav>
      <div className="px-4 py-4 border-t border-slate-700">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} colaboraEDU</p>
      </div>
    </div>
  );
};