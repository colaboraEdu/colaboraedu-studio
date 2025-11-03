import React, { useState, useEffect } from 'react';
import { assignmentsAPI, classesAPI, Assignment, AssignmentSubmission, Class } from '../../../src/services/api';

export const GerenciarTarefas: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'submissions'>('list');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [turmas, setTurmas] = useState<Class[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    class_id: 0,
    title: '',
    description: '',
    due_date: '',
    max_score: 10,
    weight: 1,
    assignment_type: 'homework',
    instructions: '',
    allow_late_submission: true,
    max_attempts: 1
  });

  useEffect(() => {
    loadTurmas();
    loadAssignments();
  }, []);

  const loadTurmas = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const data = await classesAPI.list({
        school_year: currentYear,
        status: 'active'
      });
      setTurmas(data);
    } catch (err: any) {
      console.error('Erro ao carregar turmas:', err);
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await assignmentsAPI.list({ status: 'active' });
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId: number) => {
    try {
      setLoading(true);
      const data = await assignmentsAPI.getSubmissions(assignmentId);
      setSubmissions(data);
      setView('submissions');
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar submissões');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      if (view === 'edit' && selectedAssignment) {
        await assignmentsAPI.update(selectedAssignment.id, formData);
        setSuccess('✅ Tarefa atualizada com sucesso!');
      } else {
        await assignmentsAPI.create(formData);
        setSuccess('✅ Tarefa criada com sucesso!');
      }

      await loadAssignments();
      setView('list');
      resetForm();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId: number, score: number, feedback: string) => {
    try {
      await assignmentsAPI.gradeSubmission(submissionId, { score, feedback });
      setSuccess('✅ Nota atribuída com sucesso!');
      if (selectedAssignment) {
        await loadSubmissions(selectedAssignment.id);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atribuir nota');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

    try {
      await assignmentsAPI.delete(id);
      setSuccess('✅ Tarefa deletada com sucesso!');
      await loadAssignments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar tarefa');
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      await assignmentsAPI.togglePublish(id);
      setSuccess('✅ Status da tarefa atualizado!');
      await loadAssignments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setFormData({
      class_id: 0,
      title: '',
      description: '',
      due_date: '',
      max_score: 10,
      weight: 1,
      assignment_type: 'homework',
      instructions: '',
      allow_late_submission: true,
      max_attempts: 1
    });
    setSelectedAssignment(null);
  };

  const handleEdit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      class_id: assignment.class_id,
      title: assignment.title,
      description: assignment.description || '',
      due_date: assignment.due_date || '',
      max_score: assignment.max_score || 10,
      weight: assignment.weight || 1,
      assignment_type: assignment.assignment_type || 'homework',
      instructions: assignment.instructions || '',
      allow_late_submission: assignment.allow_late_submission,
      max_attempts: assignment.max_attempts || 1
    });
    setView('edit');
  };

  // List View
  if (view === 'list') {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Tarefas</h2>
          <button
            onClick={() => setView('create')}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nova Tarefa
          </button>
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        )}

        {!loading && assignments.length === 0 && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <h3 className="text-sm font-medium text-gray-900">Nenhuma tarefa encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">Comece criando sua primeira tarefa.</p>
          </div>
        )}

        {!loading && assignments.length > 0 && (
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-800">{assignment.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        assignment.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.status === 'published' ? 'Publicada' : 'Rascunho'}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {assignment.assignment_type}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{assignment.description}</p>
                    <div className="mt-3 flex gap-4 text-sm text-gray-500">
                      <span>📅 Entrega: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString('pt-BR') : 'Sem prazo'}</span>
                      <span>📊 Nota Máx: {assignment.max_score}</span>
                      <span>🔄 Tentativas: {assignment.max_attempts || 'Ilimitadas'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        loadSubmissions(assignment.id);
                      }}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Ver Submissões
                    </button>
                    <button
                      onClick={() => handleEdit(assignment)}
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleTogglePublish(assignment.id)}
                      className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      {assignment.status === 'published' ? 'Despublicar' : 'Publicar'}
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Submissions View
  if (view === 'submissions' && selectedAssignment) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={() => setView('list')}
              className="text-gray-600 hover:text-gray-800 mb-2 flex items-center"
            >
              ← Voltar
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{selectedAssignment.title}</h2>
            <p className="text-gray-600">Submissões dos alunos</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        )}

        {!loading && submissions.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">Nenhuma submissão encontrada.</p>
          </div>
        )}

        {!loading && submissions.length > 0 && (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-800">Aluno: {submission.student_id}</h4>
                    <p className="text-sm text-gray-500">
                      Enviado em: {new Date(submission.submission_date).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-500">Tentativa: {submission.attempt_number}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    submission.status === 'graded' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {submission.status === 'graded' ? 'Corrigida' : 'Pendente'}
                  </span>
                </div>

                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Conteúdo:</h5>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">{submission.content || 'Sem conteúdo textual'}</p>
                </div>

                {submission.status === 'graded' ? (
                  <div className="bg-blue-50 p-4 rounded">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Nota: {submission.score}/{selectedAssignment.max_score}</span>
                      <span className="text-blue-600">{submission.percentage_score?.toFixed(1)}%</span>
                    </div>
                    {submission.feedback && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Feedback:</p>
                        <p className="text-sm text-gray-600">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Nota"
                      max={selectedAssignment.max_score}
                      min={0}
                      step={0.5}
                      id={`score-${submission.id}`}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Feedback (opcional)"
                      id={`feedback-${submission.id}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={() => {
                        const score = parseFloat((document.getElementById(`score-${submission.id}`) as HTMLInputElement).value);
                        const feedback = (document.getElementById(`feedback-${submission.id}`) as HTMLInputElement).value;
                        if (!isNaN(score)) {
                          handleGrade(submission.id, score, feedback);
                        } else {
                          alert('Por favor, insira uma nota válida');
                        }
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Corrigir
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Create/Edit Form
  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => {
                setView('list');
                resetForm();
              }}
              className="text-gray-600 hover:text-gray-800 mb-2 flex items-center"
            >
              ← Voltar
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {view === 'edit' ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turma *
              </label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={0}>Selecione uma turma</option>
                {turmas.map(turma => (
                  <option key={turma.id} value={turma.id}>
                    {turma.name} - {turma.grade_level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Tarefa
              </label>
              <select
                value={formData.assignment_type}
                onChange={(e) => setFormData({ ...formData, assignment_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="homework">Lição de Casa</option>
                <option value="test">Prova</option>
                <option value="project">Projeto</option>
                <option value="essay">Redação</option>
                <option value="presentation">Apresentação</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: Trabalho sobre a Revolução Francesa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Breve descrição da tarefa..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instruções
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Instruções detalhadas para os alunos..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Entrega
              </label>
              <input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota Máxima
              </label>
              <input
                type="number"
                value={formData.max_score}
                onChange={(e) => setFormData({ ...formData, max_score: Number(e.target.value) })}
                min={1}
                step={0.5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                min={0.1}
                step={0.1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allow_late_submission}
                onChange={(e) => setFormData({ ...formData, allow_late_submission: e.target.checked })}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Permitir envio atrasado</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Máx. tentativas:</label>
              <input
                type="number"
                value={formData.max_attempts}
                onChange={(e) => setFormData({ ...formData, max_attempts: Number(e.target.value) })}
                min={1}
                max={10}
                className="w-20 px-3 py-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Salvando...' : view === 'edit' ? '✓ Atualizar Tarefa' : '✓ Criar Tarefa'}
            </button>
            <button
              type="button"
              onClick={() => {
                setView('list');
                resetForm();
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
