import React from 'react';
import { StatCard } from './StatCard';
import { mockUsers } from '../../data';

export const DashboardHome: React.FC = () => {
    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => u.status === 'Ativo').length;
    const totalProfessors = mockUsers.filter(u => u.role === 'Professor').length;

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total de Usuários" 
                    value={totalUsers.toString()}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    color="bg-blue-500"
                />
                <StatCard 
                    title="Usuários Ativos" 
                    value={activeUsers.toString()}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="bg-green-500"
                />
                <StatCard 
                    title="Total de Cursos" 
                    value="42"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" /></svg>}
                    color="bg-orange-500"
                />
                 <StatCard 
                    title="Professores" 
                    value={totalProfessors.toString()}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
                    color="bg-purple-500"
                />
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                 <h2 className="text-xl font-bold text-gray-700 mb-4">Bem-vindo ao Painel do Administrador</h2>
                 <p className="text-gray-600">
                    Utilize o menu lateral para navegar pelas diferentes seções. Você pode gerenciar usuários, visualizar relatórios, configurar o sistema e muito mais. Este painel central oferece uma visão geral e acesso rápido às principais funcionalidades da plataforma colaboraEDU.
                </p>
            </div>
        </div>
    );
};
