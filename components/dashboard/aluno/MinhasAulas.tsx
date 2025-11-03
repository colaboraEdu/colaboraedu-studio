import React from 'react';
import { alunoAulas, AlunoAula } from '../../../alunoData';

const AulaCard: React.FC<{ aula: AlunoAula }> = ({ aula }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-all hover:-translate-y-1 hover:shadow-xl border-l-4 border-blue-500`}>
       <div className={`h-2 ${aula.cor}`}></div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800">{aula.nome}</h3>
        <p className="text-gray-500 text-sm mt-1">{aula.professor}</p>
        
        <div className="mt-4 flex items-center text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{aula.horario}</span>
        </div>
      </div>
       <div className="bg-gray-50 px-5 py-3">
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          Acessar Aula
        </button>
      </div>
    </div>
  );
};

export const MinhasAulas: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Minhas Aulas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alunoAulas.map(aula => (
          <AulaCard key={aula.id} aula={aula} />
        ))}
      </div>
    </div>
  );
};