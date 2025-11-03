import React, { useState } from 'react';
import { filhos, frequencias } from '../../../responsavelData';
import { StatCard } from '../StatCard';

export const Presenca: React.FC = () => {
    const [selectedFilhoId, setSelectedFilhoId] = useState(filhos[0]?.id || 0);
    const selectedFrequencia = frequencias.find(f => f.filhoId === selectedFilhoId);
    
    const frequenciaPercentual = selectedFrequencia && selectedFrequencia.totalAulas > 0 
        ? ((selectedFrequencia.presencas / selectedFrequencia.totalAulas) * 100).toFixed(1) 
        : 0;

    return (
        <div className="animate-fade-in">
             <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Frequência Escolar</h2>
                    <div className="w-full md:w-auto">
                        <label htmlFor="select-filho-presenca" className="sr-only">Selecionar Filho</label>
                        <select
                            id="select-filho-presenca"
                            value={selectedFilhoId}
                            onChange={(e) => setSelectedFilhoId(Number(e.target.value))}
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        >
                            {filhos.map(filho => (
                            <option key={filho.id} value={filho.id}>{filho.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {selectedFrequencia ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total de Aulas" 
                        value={selectedFrequencia.totalAulas.toString()}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        color="bg-gray-500"
                    />
                    <StatCard 
                        title="Presenças" 
                        value={selectedFrequencia.presencas.toString()}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="bg-green-500"
                    />
                    <StatCard 
                        title="Faltas" 
                        value={selectedFrequencia.faltas.toString()}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="bg-red-500"
                    />
                    <StatCard 
                        title="Frequência" 
                        value={`${frequenciaPercentual}%`}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>}
                        color="bg-blue-500"
                    />
                </div>
             ) : (
                <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-lg">
                    Nenhum dado de frequência encontrado para este aluno.
                </div>
            )}
        </div>
    );
};