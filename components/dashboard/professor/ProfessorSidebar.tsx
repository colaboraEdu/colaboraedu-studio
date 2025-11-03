import React, { useState } from 'react';
import type { ProfessorView } from './ProfessorDashboard';

interface SidebarProps {
  activeView: ProfessorView;
  setActiveView: (view: ProfessorView) => void;
}

const iconClasses = "h-5 w-5 flex-shrink-0";

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isSubmenu?: boolean;
}> = ({ icon, label, isActive, onClick, isSubmenu = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center text-left px-4 py-3 text-sm font-medium transition-colors duration-200 ease-in-out ${
      isSubmenu ? 'pl-12' : 'pl-4'
    } ${
      isActive
        ? 'bg-green-600 text-white'
        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-4 truncate">{label}</span>
  </button>
);

const CollapsibleNavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ icon, label, isOpen, onClick, children }) => (
  <div>
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between pl-4 pr-3 py-3 text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 ease-in-out"
    >
      <div className="flex items-center">
        {icon}
        <span className="ml-4">{label}</span>
      </div>
      <svg
        className={`h-5 w-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isOpen && <div className="bg-slate-900/50">{children}</div>}
  </div>
);


export const ProfessorSidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const [openMenu, setOpenMenu] = useState<string | null>('aulas');

  const handleMenuClick = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };
  
  const handleLinkClick = (view: ProfessorView) => {
    setActiveView(view);
  }

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
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.07 1.916l-7.5 4.25a2.25 2.25 0 01-2.36 0L3.32 15.219a2.25 2.25 0 01-1.07-1.916V9.61a2.25 2.25 0 011.07-1.916l7.5-4.25a2.25 2.25 0 012.36 0L19.5 7.382z" /></svg>} label="Minhas Turmas" isActive={activeView === 'minhasTurmas'} onClick={() => handleLinkClick('minhasTurmas')} />
        
        <CollapsibleNavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>} label="Aulas" isOpen={openMenu === 'aulas'} onClick={() => handleMenuClick('aulas')}>
          <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Criar Aula" isActive={activeView === 'criarAula'} onClick={() => handleLinkClick('criarAula')} isSubmenu />
          <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} label="Minhas Aulas" isActive={activeView === 'minhasAulas'} onClick={() => handleLinkClick('minhasAulas')} isSubmenu />
          <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} label="Rascunhos" isActive={activeView === 'rascunhos'} onClick={() => handleLinkClick('rascunhos')} isSubmenu />
        </CollapsibleNavLink>

        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} label="Tarefas" isActive={activeView === 'tarefas'} onClick={() => handleLinkClick('tarefas')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Correções" isActive={activeView === 'correcoes'} onClick={() => handleLinkClick('correcoes')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} label="Presença" isActive={activeView === 'presenca'} onClick={() => handleLinkClick('presenca')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} label="Diário de Classe" isActive={activeView === 'diarioDeClasse'} onClick={() => handleLinkClick('diarioDeClasse')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} label="Relatórios" isActive={activeView === 'relatorios'} onClick={() => handleLinkClick('relatorios')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} label="Comunicação" isActive={activeView === 'chat'} onClick={() => handleLinkClick('chat')} />

        <div className="border-t border-slate-700 my-2"></div>
        
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>} label="Meu Perfil" isActive={activeView === 'meuPerfil'} onClick={() => handleLinkClick('meuPerfil')} />

      </nav>
      <div className="px-4 py-4 border-t border-slate-700">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} colaboraEDU</p>
      </div>
    </div>
  );
};