import React, { useState, useEffect } from 'react';
import { assignmentsAPI, Assignment, AssignmentSubmission, authAPI } from '../../../src/services/api';

export const AlunoTarefas: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [mySubmissions, setMySubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [view, setView] = useState<'list' | 'submit'>('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state for submission
  const [submissionContent, setSubmissionContent] = useState('');

  useEffect(() => {
    loadMySubmissions();
  }, []);

  const loadMySubmissions = async () => {
    try {
      setLoading(true);
      const currentUser = authAPI.getCurrentUser();
      if (!currentUser) {
        setError('Usuário não autenticado');
        return;
      }

      // Get student submissions - assuming student_id is same as user_id
      // In production, you'd need to get the actual student record first
      const submissions = await assignmentsAPI.getStudentSubmissions(currentUser.id);
      setMySubmissions(submissions);

      // Get all active assignments
      const allAssignments = await assignmentsAPI.list({ status: 'published' });
      setAssignments(allAssignments);
    } catch (err: any) {
      console.error('Erro ao carregar tarefas:', err);
      setError(err.message || 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssignment) return;

    try {
      setLoading(true);
      setError(null);

      await assignmentsAPI.submit(selectedAssignment.id, {
        content: submissionContent
      });

      setSuccess('✅ Tarefa enviada com sucesso!');
      setView('list');
      setSelectedAssignment(null);
      setSubmissionContent('');
      
      // Reload submissions
      await loadMySubmissions();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionForAssignment = (assignmentId: number) => {
    return mySubmissions.find(sub => sub.assignment_id === assignmentId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'graded':
        return 'Corrigida';
      case 'submitted':
        return 'Enviada';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // List View
  if (view === 'list') {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Minhas Tarefas</h2>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && assignments.length === 0 && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <h3 className="text-sm font-medium text-gray-900">Nenhuma tarefa disponível</h3>
            <p className="mt-1 text-sm text-gray-500">Aguarde novas tarefas dos seus professores.</p>
          </div>
        )}

        {!loading && assignments.length > 0 && (
          <div className="grid gap-4">
            {assignments.map((assignment) => {
              const submission = getSubmissionForAssignment(assignment.id);
              const overdue = isOverdue(assignment.due_date) && !submission;

              return (
                <div 
                  key={assignment.id} 
                  className={`bg-white rounded-lg shadow p-6 ${overdue ? 'border-l-4 border-red-500' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{assignment.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          assignment.assignment_type === 'test' ? 'bg-red-100 text-red-800' :
                          assignment.assignment_type === 'project' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {assignment.assignment_type}
                        </span>
                        {overdue && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            ⚠️ Atrasada
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          📅 Entrega: {assignment.due_date ? new Date(assignment.due_date).toLocaleString('pt-BR') : 'Sem prazo'}
                        </span>
                        <span>📊 Nota Máx: {assignment.max_score}</span>
                        <span>🔄 Tentativas: {assignment.max_attempts || 'Ilimitadas'}</span>
                      </div>

                      {assignment.instructions && (
                        <div className="bg-gray-50 rounded p-3 mb-3">
                          <p className="text-sm text-gray-700">
                            <strong>Instruções:</strong> {assignment.instructions}
                          </p>
                        </div>
                      )}

                      {submission && (
                        <div className={`rounded p-4 ${
                          submission.status === 'graded' ? 'bg-green-50' : 'bg-blue-50'
                        }`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusColor(submission.status)}`}>
                              {getStatusLabel(submission.status)}
                            </span>
                            <span className="text-sm text-gray-600">
                              Enviado em: {new Date(submission.submission_date).toLocaleString('pt-BR')}
                            </span>
                          </div>

                          {submission.status === 'graded' && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-bold text-green-700">
                                  Nota: {submission.score}/{assignment.max_score}
                                </span>
                                <span className="text-xl font-bold text-green-600">
                                  {submission.percentage_score?.toFixed(1)}%
                                </span>
                              </div>
                              {submission.feedback && (
                                <div className="bg-white rounded p-3 mt-2">
                                  <p className="text-sm font-semibold text-gray-700 mb-1">Feedback do Professor:</p>
                                  <p className="text-sm text-gray-600">{submission.feedback}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {submission.status === 'submitted' && (
                            <p className="text-sm text-blue-700 mt-2">
                              ⏳ Aguardando correção do professor
                            </p>
                          )}

                          <p className="text-xs text-gray-500 mt-2">
                            Tentativa {submission.attempt_number} de {assignment.max_attempts || '∞'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      {!submission && (
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setView('submit');
                          }}
                          disabled={overdue && !assignment.allow_late_submission}
                          className={`px-4 py-2 rounded font-medium transition-colors ${
                            overdue && !assignment.allow_late_submission
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {overdue ? 'Prazo Expirado' : 'Enviar Tarefa'}
                        </button>
                      )}
                      {submission && submission.attempt_number < (assignment.max_attempts || Infinity) && (
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setView('submit');
                          }}
                          className="px-4 py-2 bg-yellow-500 text-white rounded font-medium hover:bg-yellow-600 transition-colors"
                        >
                          Reenviar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Submit Form View
  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <button
            onClick={() => {
              setView('list');
              setSelectedAssignment(null);
              setSubmissionContent('');
            }}
            className="text-gray-600 hover:text-gray-800 mb-2 flex items-center"
          >
            ← Voltar para lista
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Enviar Tarefa</h2>
          {selectedAssignment && (
            <h3 className="text-lg text-gray-600 mt-1">{selectedAssignment.title}</h3>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {selectedAssignment && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Informações da Tarefa:</h4>
              <div className="space-y-1 text-sm text-gray-700">
                {selectedAssignment.description && (
                  <p><strong>Descrição:</strong> {selectedAssignment.description}</p>
                )}
                <p><strong>Nota Máxima:</strong> {selectedAssignment.max_score}</p>
                <p><strong>Prazo:</strong> {selectedAssignment.due_date ? new Date(selectedAssignment.due_date).toLocaleString('pt-BR') : 'Sem prazo'}</p>
                {selectedAssignment.instructions && (
                  <div className="mt-3">
                    <p className="font-semibold">Instruções:</p>
                    <p className="whitespace-pre-wrap">{selectedAssignment.instructions}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sua Resposta *
              </label>
              <textarea
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                required
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite sua resposta aqui..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Caracteres: {submissionContent.length}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !submissionContent.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Enviando...' : '📤 Enviar Tarefa'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('list');
                  setSelectedAssignment(null);
                  setSubmissionContent('');
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
