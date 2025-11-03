import React, { useState, useEffect } from 'react';
import { classesAPI, Class } from '../../../src/services/api';

const TurmaCard: React.FC<{ turma: Class }> = ({ turma }) => {
  const colors = {
    morning: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500', label: 'Manhã' },
    afternoon: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500', label: 'Tarde' },
    evening: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-500', label: 'Noite' },
    fulltime: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500', label: 'Integral' }
  };
  const period = turma.schedule?.period || 'morning';
  const color = colors[period as keyof typeof colors] || colors.morning;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-all hover:-translate-y-1 hover:shadow-xl border-l-4 ${color.border}`}>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{turma.name}</h3>
            <p className="text-gray-500">{turma.grade_level}</p>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color.bg} ${color.text}`}>
            {color.label}
          </span>
        </div>
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 004.77-2.764" />
            </svg>
            <span>{turma.student_count || 0} Alunos</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{turma.schedule?.time || turma.school_year}</span>
          </div>
        </div>
        {turma.capacity && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Capacidade</span>
              <span>{turma.student_count || 0}/{turma.capacity}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(((turma.student_count || 0) / turma.capacity) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <button className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors">
          Acessar Turma
        </button>
      </div>
    </div>
  );
};

export const MinhasTurmas: React.FC = () => {
  const [turmas, setTurmas] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTurmas();
  }, []);

  const loadTurmas = async () => {
    try {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      const data = await classesAPI.list({
        school_year: currentYear,
        status: 'active'
      });
      setTurmas(data);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar turmas:', err);
      setError(err.message || 'Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Minhas Turmas</h2>
         <button 
           className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
           onClick={() => alert('Funcionalidade de criar turma em desenvolvimento')}
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Criar Turma
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={loadTurmas}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && turmas.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma turma encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">Comece criando sua primeira turma.</p>
        </div>
      )}

      {!loading && !error && turmas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turmas.map(turma => (
            <TurmaCard key={turma.id} turma={turma} />
          ))}
        </div>
      )}
    </div>
  );
};
