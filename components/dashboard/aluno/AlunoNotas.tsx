import React, { useState, useEffect } from 'react';
import { gradesAPI, StudentReportCard, authAPI } from '../../../src/services/api';

export const AlunoNotas: React.FC = () => {
  const [reportCard, setReportCard] = useState<StudentReportCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadReportCard();
  }, [selectedYear]);

  const loadReportCard = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = authAPI.getCurrentUser();
      if (!currentUser) {
        setError('Usuário não autenticado');
        return;
      }

      // Get report card for current student
      // In production, you'd need to get the actual student record first
      const data = await gradesAPI.getStudentReportCard(currentUser.id, {
        school_year: selectedYear
      });
      
      setReportCard(data);
    } catch (err: any) {
      console.error('Erro ao carregar boletim:', err);
      setError(err.message || 'Erro ao carregar boletim');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'reprovado':
        return 'bg-red-100 text-red-800';
      case 'recuperação':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Minhas Notas</h2>
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600">Ano Letivo:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={loadReportCard}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && !error && reportCard && (
        <>
          {/* Student Info Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-blue-100 text-sm">Nome</p>
                <p className="font-bold text-lg">{reportCard.student.name}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Matrícula</p>
                <p className="font-bold text-lg">{reportCard.student.enrollment}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Série</p>
                <p className="font-bold text-lg">{reportCard.student.grade}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Ano Letivo</p>
                <p className="font-bold text-lg">{reportCard.school_year}</p>
              </div>
            </div>
          </div>

          {/* Overall Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Média Geral</p>
                  <p className="text-4xl font-bold text-blue-600">{reportCard.general_average.toFixed(1)}</p>
                </div>
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Status Geral</p>
                  <span className={`inline-block mt-2 px-4 py-2 text-lg font-bold rounded-full ${getStatusColor(reportCard.status)}`}>
                    {reportCard.status}
                  </span>
                </div>
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-3xl">{reportCard.status === 'Aprovado' ? '✅' : '⚠️'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Semester Reports */}
          {reportCard.report.map((semesterReport) => (
            <div key={semesterReport.semester} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {semesterReport.semester}º Semestre
                </h3>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Média do Semestre</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {semesterReport.semester_average.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Disciplina
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nº Avaliações
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Média
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {semesterReport.subjects.map((subject, index) => (
                      <tr key={index} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {subject.subject_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-500">
                            {subject.grades.length} avaliação(ões)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-sm font-bold ${
                            subject.average >= 7 ? 'text-blue-600' : 
                            subject.average >= 5 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {subject.average.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(subject.status)}`}>
                            {subject.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Semester Statistics */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {semesterReport.subjects.filter(s => s.status === 'Aprovado').length}
                  </p>
                  <p className="text-xs text-gray-600">Aprovado(s)</p>
                </div>
                <div className="bg-yellow-50 rounded p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {semesterReport.subjects.filter(s => s.status === 'Recuperação').length}
                  </p>
                  <p className="text-xs text-gray-600">Recuperação</p>
                </div>
                <div className="bg-red-50 rounded p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {semesterReport.subjects.filter(s => s.status === 'Reprovado').length}
                  </p>
                  <p className="text-xs text-gray-600">Reprovado(s)</p>
                </div>
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2">Legenda:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-gray-600">Aprovado: Média ≥ 7.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-600">Recuperação: 5.0 ≤ Média &lt; 7.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-gray-600">Reprovado: Média &lt; 5.0</span>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !error && !reportCard && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <h3 className="text-sm font-medium text-gray-900">Nenhum boletim encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">Não há notas registradas para o ano selecionado.</p>
        </div>
      )}
    </div>
  );
};