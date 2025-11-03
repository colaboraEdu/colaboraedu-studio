import React from 'react';
import { filhos, Filho } from '../../../responsavelData';

const FilhoCard: React.FC<{ filho: Filho }> = ({ filho }) => {
    const desempenhoColors = {
        Bom: { bg: 'bg-green-100', text: 'text-green-800' },
        Regular: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        Atenção: { bg: 'bg-red-100', text: 'text-red-800' },
    };
    const color = desempenhoColors[filho.desempenho];

    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-all hover:-translate-y-1 hover:shadow-xl border-l-4 ${filho.cor}`}>
            <div className="p-5 flex items-center space-x-4">
                <img className="h-20 w-20 rounded-full object-cover" src={filho.avatar} alt={filho.nome} />
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{filho.nome}</h3>
                    <p className="text-gray-500">{filho.serie}</p>
                    <div className="mt-2">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color.bg} ${color.text}`}>
                            Desempenho: {filho.desempenho}
                        </span>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
                <button className="text-sm font-semibold text-cyan-600 hover:text-cyan-800 transition-colors">
                    Ver Detalhes
                </button>
            </div>
        </div>
    );
};

export const MeusFilhos: React.FC = () => {
    return (
        <div className="animate-fade-in">
             <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-bold text-gray-700 mb-2">Portal do Responsável</h2>
                <p className="text-gray-600">
                    Bem-vindo(a)! Aqui você pode acompanhar de perto a vida acadêmica dos seus filhos, visualizar notas, frequência, comunicados e informações financeiras.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filhos.map(filho => (
                    <FilhoCard key={filho.id} filho={filho} />
                ))}
            </div>
        </div>
    );
};