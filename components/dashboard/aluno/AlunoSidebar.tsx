import React from 'react';
import type { AlunoView } from './AlunoDashboard';

interface SidebarProps {
  activeView: AlunoView;
  setActiveView: (view: AlunoView) => void;
}

const iconClasses = "h-5 w-5 flex-shrink-0";

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center text-left px-4 py-3 text-sm font-medium transition-colors duration-200 ease-in-out ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-4 truncate">{label}</span>
  </button>
);

export const AlunoSidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
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
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>} label="Minhas Aulas" isActive={activeView === 'minhasAulas'} onClick={() => setActiveView('minhasAulas')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} label="Tarefas" isActive={activeView === 'tarefas'} onClick={() => setActiveView('tarefas')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} label="Notas" isActive={activeView === 'notas'} onClick={() => setActiveView('notas')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Presença" isActive={activeView === 'presenca'} onClick={() => setActiveView('presenca')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label="Calendário" isActive={activeView === 'calendario'} onClick={() => setActiveView('calendario')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>} label="Biblioteca" isActive={activeView === 'biblioteca'} onClick={() => setActiveView('biblioteca')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} label="Mensagens" isActive={activeView === 'chat'} onClick={() => setActiveView('chat')} />

        <div className="border-t border-slate-700 my-2"></div>
        
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>} label="Meu Perfil" isActive={activeView === 'meuPerfil'} onClick={() => setActiveView('meuPerfil')} />

      </nav>
      <div className="px-4 py-4 border-t border-slate-700">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} colaboraEDU</p>
      </div>
    </div>
  );
};