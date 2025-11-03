import React from 'react';
import type { BibliotecarioView } from './BibliotecarioDashboard';

interface SidebarProps {
  activeView: BibliotecarioView;
  setActiveView: (view: BibliotecarioView) => void;
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
        ? 'bg-indigo-600 text-white'
        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-4 truncate">{label}</span>
  </button>
);

export const BibliotecarioSidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
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
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label="Empréstimos" isActive={activeView === 'emprestimos'} onClick={() => setActiveView('emprestimos')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>} label="Acervo" isActive={activeView === 'acervo'} onClick={() => setActiveView('acervo')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Devoluções" isActive={activeView === 'devolucoes'} onClick={() => setActiveView('devolucoes')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label="Reservas" isActive={activeView === 'reservas'} onClick={() => setActiveView('reservas')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} label="Comunicação" isActive={activeView === 'chat'} onClick={() => setActiveView('chat')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} label="Relatórios" isActive={activeView === 'relatorios'} onClick={() => setActiveView('relatorios')} />
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} label="Configurações" isActive={activeView === 'configuracoes'} onClick={() => setActiveView('configuracoes')} />

        <div className="border-t border-slate-700 my-2"></div>
        
        <NavLink icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>} label="Meu Perfil" isActive={activeView === 'meuPerfil'} onClick={() => setActiveView('meuPerfil')} />

      </nav>
      <div className="px-4 py-4 border-t border-slate-700">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} colaboraEDU</p>
      </div>
    </div>
  );
};