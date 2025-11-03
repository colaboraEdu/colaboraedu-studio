import React, { useState, useEffect } from 'react';
import { classesAPI, attendanceAPI, Class } from '../../../src/services/api';

interface StudentAttendance {
  student_id: string;
  student_name: string;
  enrollment: string;
  present: boolean;
  justified: boolean;
  justification?: string;
  recorded: boolean;
}

export const Presenca: React.FC = () => {
  const [turmas, setTurmas] = useState<Class[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('morning');
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTurmas();
  }, []);

  useEffect(() => {
    if (selectedTurma && selectedDate) {
      loadAttendanceData();
    }
  }, [selectedTurma, selectedDate, selectedPeriod]);

  const loadTurmas = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const data = await classesAPI.list({
        school_year: currentYear,
        status: 'active'
      });
      setTurmas(data);
      if (data.length > 0) {
        setSelectedTurma(data[0].id);
      }
    } catch (err: any) {
      console.error('Erro ao carregar turmas:', err);
      setError(err.message || 'Erro ao carregar turmas');
    }
  };

  const loadAttendanceData = async () => {
    if (!selectedTurma) return;

    try {
      setLoading(true);
      setError(null);

      const data = await attendanceAPI.getClassAttendanceByDate(
        selectedTurma,
        selectedDate,
        selectedPeriod
      );

      setStudents(data.students);
    } catch (err: any) {
      console.error('Erro ao carregar presença:', err);
      setError(err.message || 'Erro ao carregar dados de presença');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePresence = (studentId: string) => {
    setStudents(prev => prev.map(student => 
      student.student_id === studentId 
        ? { ...student, present: !student.present }
        : student
    ));
  };

  const handleToggleJustified = (studentId: string) => {
    setStudents(prev => prev.map(student => 
      student.student_id === studentId 
        ? { ...student, justified: !student.justified }
        : student
    ));
  };

  const handleJustificationChange = (studentId: string, justification: string) => {
    setStudents(prev => prev.map(student => 
      student.student_id === studentId 
        ? { ...student, justification }
        : student
    ));
  };

  const handleMarkAllPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, present: true })));
  };

  const handleMarkAllAbsent = () => {
    setStudents(prev => prev.map(student => ({ ...student, present: false })));
  };

  const handleSave = async () => {
    if (!selectedTurma) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const result = await attendanceAPI.createBulk({
        class_id: selectedTurma,
        date: selectedDate,
        period: selectedPeriod,
        attendances: students.map(student => ({
          student_id: student.student_id,
          present: student.present,
          justified: student.justified,
          justification: student.justification
        }))
      });

      setSuccess(`✅ Presença registrada com sucesso! ${result.created} criados, ${result.updated} atualizados.`);
      
      // Reload data to show updated status
      await loadAttendanceData();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('Erro ao salvar presença:', err);
      setError(err.message || 'Erro ao salvar presença');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => s.present).length;
  const absentCount = students.filter(s => !s.present).length;
  const justifiedCount = students.filter(s => !s.present && s.justified).length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Registro de Presença</h2>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Turma
            </label>
            <select
              value={selectedTurma || ''}
              onChange={(e) => setSelectedTurma(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {turmas.map(turma => (
                <option key={turma.id} value={turma.id}>
                  {turma.name} - {turma.grade_level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="morning">Manhã</option>
              <option value="afternoon">Tarde</option>
              <option value="evening">Noite</option>
              <option value="fulltime">Integral</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleMarkAllPresent}
            disabled={loading || students.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ✓ Marcar Todos Presentes
          </button>
          <button
            onClick={handleMarkAllAbsent}
            disabled={loading || students.length === 0}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ✗ Marcar Todos Ausentes
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || students.length === 0}
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? 'Salvando...' : '💾 Salvar Presença'}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Statistics */}
        {students.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-800">{students.length}</div>
              <div className="text-sm text-gray-600">Total de Alunos</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <div className="text-sm text-gray-600">Presentes</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              <div className="text-sm text-gray-600">Ausentes</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{justifiedCount}</div>
              <div className="text-sm text-gray-600">Justificadas</div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        )}

        {/* Student List */}
        {!loading && students.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matrícula
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Presença
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Justificada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Justificativa
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.student_id} className={student.recorded ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                      {student.recorded && (
                        <span className="text-xs text-blue-600">Já registrado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.enrollment}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleTogglePresence(student.student_id)}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                          student.present
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {student.present ? '✓ Presente' : '✗ Ausente'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {!student.present && (
                        <input
                          type="checkbox"
                          checked={student.justified}
                          onChange={() => handleToggleJustified(student.student_id)}
                          className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {!student.present && student.justified && (
                        <input
                          type="text"
                          value={student.justification || ''}
                          onChange={(e) => handleJustificationChange(student.student_id, e.target.value)}
                          placeholder="Motivo da falta..."
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && students.length === 0 && selectedTurma && (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhum aluno encontrado nesta turma.</p>
          </div>
        )}
      </div>
    </div>
  );
};
