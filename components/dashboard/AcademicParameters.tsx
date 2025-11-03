import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  BookOpen,
  GraduationCap,
  Calendar,
  Users,
  Award,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Save,
  X
} from 'lucide-react';

// shadcn/ui components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

import { academicParametersAPI, gradeLevelsAPI, subjectsAPI } from '../../lib/api';

interface AcademicParameter {
  id: string;
  institution_id: string;
  grading_scale: string;
  passing_grade: number;
  max_grade: number;
  min_grade: number;
  decimal_places: number;
  allow_grade_rounding: boolean;
  min_attendance_percentage: number;
  max_absences_allowed: number | null;
  count_late_as_absent: boolean;
  late_minutes_threshold: number;
  school_year_start_month: number;
  school_year_end_month: number;
  number_of_terms: number;
  term_names: string[] | null;
  allow_recovery_exams: boolean;
  recovery_passing_grade: number | null;
  max_recovery_attempts: number | null;
  min_subjects_per_term: number | null;
  max_subjects_per_term: number | null;
  allow_subject_dependencies: boolean;
  min_class_size: number | null;
  max_class_size: number | null;
  allow_mixed_grades: boolean;
  promotion_criteria: any;
  require_min_attendance: boolean;
  automatic_promotion: boolean;
  weight_config: any;
  calculation_formula: string | null;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface GradeLevel {
  id: string;
  institution_id: string;
  name: string;
  code: string | null;
  level: number;
  education_level: string;
  min_age: number | null;
  max_age: number | null;
  active: boolean;
}

interface Subject {
  id: string;
  institution_id: string;
  name: string;
  code: string | null;
  description: string | null;
  workload_hours: number | null;
  credits: number | null;
  is_mandatory: boolean;
  allows_substitution: boolean;
  prerequisites: string[] | null;
  active: boolean;
}

export default function AcademicParameters() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Academic Parameters state
  const [parameters, setParameters] = useState<AcademicParameter | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Grade Levels state
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [gradeLevelDialog, setGradeLevelDialog] = useState(false);
  const [editingGradeLevel, setEditingGradeLevel] = useState<GradeLevel | null>(null);
  
  // Subjects state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectDialog, setSubjectDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadParameters(),
        loadGradeLevels(),
        loadSubjects()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados acadêmicos');
    } finally {
      setLoading(false);
    }
  };

  const loadParameters = async () => {
    try {
      const response: any = await academicParametersAPI.getParameters();
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao carregar parâmetros');
      }
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setParameters(response.data[0]);
      } else {
        // Initialize with default parameters if none exist
        const defaultParams: Partial<AcademicParameter> = {
          institution_id: '1', // TODO: Get from context
          grading_scale: '0-10',
          passing_grade: 6.0,
          max_grade: 10.0,
          min_grade: 0.0,
          decimal_places: 1,
          allow_grade_rounding: true,
          min_attendance_percentage: 75.0,
          max_absences_allowed: null,
          count_late_as_absent: false,
          late_minutes_threshold: 15,
          school_year_start_month: 2,
          school_year_end_month: 12,
          number_of_terms: 4,
          term_names: null,
          allow_recovery_exams: true,
          recovery_passing_grade: 6.0,
          max_recovery_attempts: 1,
          min_subjects_per_term: null,
          max_subjects_per_term: null,
          allow_subject_dependencies: true,
          min_class_size: 10,
          max_class_size: 40,
          allow_mixed_grades: false,
          promotion_criteria: null,
          require_min_attendance: true,
          automatic_promotion: false,
          weight_config: null,
          calculation_formula: null,
          active: true,
          notes: null
        };
        setParameters(defaultParams as AcademicParameter);
      }
    } catch (error: any) {
      console.error('Erro ao carregar parâmetros:', error);
      const errorMsg = error?.message || 'Erro ao carregar parâmetros acadêmicos';
      toast.error(errorMsg);
    }
  };

  const loadGradeLevels = async () => {
    try {
      const response: any = await gradeLevelsAPI.list();
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao carregar níveis');
      }
      
      setGradeLevels(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar níveis:', error);
      toast.error(error?.message || 'Erro ao carregar níveis escolares');
    }
  };

  const loadSubjects = async () => {
    try {
      const response: any = await subjectsAPI.list();
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao carregar disciplinas');
      }
      
      setSubjects(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar disciplinas:', error);
      toast.error(error?.message || 'Erro ao carregar disciplinas');
    }
  };

  const handleSaveParameters = async () => {
    console.log('🔵 handleSaveParameters chamado');
    console.log('📊 Parameters:', parameters);
    
    if (!parameters) {
      toast.error('Nenhum parâmetro para salvar');
      return;
    }
    
    try {
      setSaving(true);
      console.log('💾 Iniciando salvamento...');
      
      // Prepare data for API (remove frontend-only fields)
      const dataToSave = {
        institution_id: parameters.institution_id,
        grading_scale: parameters.grading_scale,
        passing_grade: parameters.passing_grade,
        max_grade: parameters.max_grade,
        min_grade: parameters.min_grade,
        decimal_places: parameters.decimal_places,
        allow_grade_rounding: parameters.allow_grade_rounding,
        min_attendance_percentage: parameters.min_attendance_percentage,
        max_absences_allowed: parameters.max_absences_allowed,
        count_late_as_absent: parameters.count_late_as_absent,
        late_minutes_threshold: parameters.late_minutes_threshold,
        school_year_start_month: parameters.school_year_start_month,
        school_year_end_month: parameters.school_year_end_month,
        number_of_terms: parameters.number_of_terms,
        term_names: parameters.term_names,
        allow_recovery_exams: parameters.allow_recovery_exams,
        recovery_passing_grade: parameters.recovery_passing_grade,
        max_recovery_attempts: parameters.max_recovery_attempts,
        min_subjects_per_term: parameters.min_subjects_per_term,
        max_subjects_per_term: parameters.max_subjects_per_term,
        allow_subject_dependencies: parameters.allow_subject_dependencies,
        min_class_size: parameters.min_class_size,
        max_class_size: parameters.max_class_size,
        allow_mixed_grades: parameters.allow_mixed_grades,
        promotion_criteria: parameters.promotion_criteria,
        require_min_attendance: parameters.require_min_attendance,
        automatic_promotion: parameters.automatic_promotion,
        weight_config: parameters.weight_config,
        calculation_formula: parameters.calculation_formula,
        active: parameters.active,
        notes: parameters.notes
      };
      
      console.log('📤 Dados a enviar:', dataToSave);
      
      let response;
      if (parameters.id) {
        console.log('✏️ Atualizando parâmetro existente, ID:', parameters.id);
        response = await academicParametersAPI.update(parameters.id, dataToSave);
        
        console.log('📥 Resposta da atualização:', response);
        
        if (!response.success) {
          throw new Error(response.error || 'Erro ao atualizar parâmetros');
        }
        
        toast.success('Parâmetros atualizados com sucesso!');
      } else {
        console.log('➕ Criando novo parâmetro');
        response = await academicParametersAPI.create(dataToSave);
        
        console.log('📥 Resposta da criação:', response);
        
        if (!response.success) {
          throw new Error(response.error || 'Erro ao criar parâmetros');
        }
        
        toast.success('Parâmetros criados com sucesso!');
      }
      
      console.log('✅ Salvamento concluído com sucesso');
      setEditMode(false);
      await loadParameters();
    } catch (error: any) {
      console.error('❌ Erro ao salvar parâmetros:', error);
      const errorMessage = error?.message || 'Erro ao salvar parâmetros acadêmicos';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
      console.log('🔚 Finalizando salvamento');
    }
  };

  const handleSaveGradeLevel = async (gradeLevel: Partial<GradeLevel>) => {
    try {
      let response;
      
      if (editingGradeLevel?.id) {
        response = await gradeLevelsAPI.update(editingGradeLevel.id, gradeLevel);
        
        if (!response.success) {
          throw new Error(response.error || 'Erro ao atualizar nível');
        }
        
        toast.success('Nível escolar atualizado!');
      } else {
        response = await gradeLevelsAPI.create(gradeLevel as any);
        
        if (!response.success) {
          throw new Error(response.error || 'Erro ao criar nível');
        }
        
        toast.success('Nível escolar criado!');
      }
      
      setGradeLevelDialog(false);
      setEditingGradeLevel(null);
      await loadGradeLevels();
    } catch (error: any) {
      console.error('Erro ao salvar nível:', error);
      toast.error(error?.message || 'Erro ao salvar nível escolar');
    }
  };

  const handleDeleteGradeLevel = async (id: string) => {
    if (!confirm('Deseja realmente excluir este nível?')) return;
    
    try {
      const response = await gradeLevelsAPI.delete(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao excluir nível');
      }
      
      toast.success('Nível escolar excluído!');
      await loadGradeLevels();
    } catch (error: any) {
      console.error('Erro ao excluir nível:', error);
      toast.error(error?.message || 'Erro ao excluir nível escolar');
    }
  };

  const handleSaveSubject = async (subject: Partial<Subject>) => {
    try {
      let response;
      
      if (editingSubject?.id) {
        response = await subjectsAPI.update(editingSubject.id, subject);
        
        if (!response.success) {
          throw new Error(response.error || 'Erro ao atualizar disciplina');
        }
        
        toast.success('Disciplina atualizada!');
      } else {
        response = await subjectsAPI.create(subject as any);
        
        if (!response.success) {
          throw new Error(response.error || 'Erro ao criar disciplina');
        }
        
        toast.success('Disciplina criada!');
      }
      
      setSubjectDialog(false);
      setEditingSubject(null);
      await loadSubjects();
    } catch (error: any) {
      console.error('Erro ao salvar disciplina:', error);
      toast.error(error?.message || 'Erro ao salvar disciplina');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta disciplina?')) return;
    
    try {
      const response = await subjectsAPI.delete(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao excluir disciplina');
      }
      
      toast.success('Disciplina excluída!');
      await loadSubjects();
    } catch (error: any) {
      console.error('Erro ao excluir disciplina:', error);
      toast.error(error?.message || 'Erro ao excluir disciplina');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando parâmetros acadêmicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parâmetros Acadêmicos</h1>
          <p className="text-gray-600 mt-1">Configure os parâmetros do sistema acadêmico</p>
        </div>
        <Settings className="h-8 w-8 text-blue-600" />
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="grading">
            <Award className="h-4 w-4 mr-2" />
            Notas
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Users className="h-4 w-4 mr-2" />
            Frequência
          </TabsTrigger>
          <TabsTrigger value="grade-levels">
            <GraduationCap className="h-4 w-4 mr-2" />
            Níveis
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <BookOpen className="h-4 w-4 mr-2" />
            Disciplinas
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Parâmetros gerais do sistema acadêmico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="year-start">Mês de Início do Ano Letivo</Label>
                  <Select
                    value={parameters?.school_year_start_month?.toString() || '2'}
                    onValueChange={(value) =>
                      setParameters(prev => prev ? { ...prev, school_year_start_month: parseInt(value) } : null)
                    }
                    disabled={!editMode}
                  >
                    <SelectTrigger id="year-start">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((month, idx) => (
                        <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year-end">Mês de Término do Ano Letivo</Label>
                  <Select
                    value={parameters?.school_year_end_month?.toString() || '12'}
                    onValueChange={(value) =>
                      setParameters(prev => prev ? { ...prev, school_year_end_month: parseInt(value) } : null)
                    }
                    disabled={!editMode}
                  >
                    <SelectTrigger id="year-end">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((month, idx) => (
                        <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms">Número de Períodos</Label>
                  <Select
                    value={parameters?.number_of_terms?.toString() || '4'}
                    onValueChange={(value) =>
                      setParameters(prev => prev ? { ...prev, number_of_terms: parseInt(value) } : null)
                    }
                    disabled={!editMode}
                  >
                    <SelectTrigger id="terms">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 (Semestres)</SelectItem>
                      <SelectItem value="3">3 (Trimestres)</SelectItem>
                      <SelectItem value="4">4 (Bimestres)</SelectItem>
                      <SelectItem value="6">6 (Unidades)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-class">Tamanho Mínimo da Turma</Label>
                  <Input
                    id="min-class"
                    type="number"
                    value={parameters?.min_class_size || 10}
                    onChange={(e) =>
                      setParameters(prev => prev ? { ...prev, min_class_size: parseInt(e.target.value) } : null)
                    }
                    disabled={!editMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-class">Tamanho Máximo da Turma</Label>
                  <Input
                    id="max-class"
                    type="number"
                    value={parameters?.max_class_size || 40}
                    onChange={(e) =>
                      setParameters(prev => prev ? { ...prev, max_class_size: parseInt(e.target.value) } : null)
                    }
                    disabled={!editMode}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mixed-grades">Permitir Séries Mistas</Label>
                    <p className="text-sm text-gray-500">Permite alunos de diferentes séries na mesma turma</p>
                  </div>
                  <Switch
                    id="mixed-grades"
                    checked={parameters?.allow_mixed_grades || false}
                    onCheckedChange={(checked) =>
                      setParameters(prev => prev ? { ...prev, allow_mixed_grades: checked } : null)
                    }
                    disabled={!editMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-promotion">Promoção Automática</Label>
                    <p className="text-sm text-gray-500">Promove automaticamente alunos aprovados</p>
                  </div>
                  <Switch
                    id="auto-promotion"
                    checked={parameters?.automatic_promotion || false}
                    onCheckedChange={(checked) =>
                      setParameters(prev => prev ? { ...prev, automatic_promotion: checked } : null)
                    }
                    disabled={!editMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-attendance">Exigir Frequência Mínima</Label>
                    <p className="text-sm text-gray-500">Requer frequência mínima para aprovação</p>
                  </div>
                  <Switch
                    id="require-attendance"
                    checked={parameters?.require_min_attendance || true}
                    onCheckedChange={(checked) =>
                      setParameters(prev => prev ? { ...prev, require_min_attendance: checked } : null)
                    }
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={parameters?.notes || ''}
                  onChange={(e) =>
                    setParameters(prev => prev ? { ...prev, notes: e.target.value } : null)
                  }
                  disabled={!editMode}
                  placeholder="Observações adicionais sobre os parâmetros..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                {!editMode ? (
                  <Button onClick={() => setEditMode(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => { setEditMode(false); loadParameters(); }}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveParameters} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grading Tab */}
        <TabsContent value="grading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notas</CardTitle>
              <CardDescription>Configure a escala e regras de avaliação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="grading-scale">Escala de Notas</Label>
                  <Select
                    value={parameters?.grading_scale || '0-10'}
                    onValueChange={(value) =>
                      setParameters(prev => prev ? { ...prev, grading_scale: value } : null)
                    }
                    disabled={!editMode}
                  >
                    <SelectTrigger id="grading-scale">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-10">0 a 10</SelectItem>
                      <SelectItem value="0-100">0 a 100</SelectItem>
                      <SelectItem value="A-F">A a F (Letras)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passing-grade">Nota Mínima para Aprovação</Label>
                  <Input
                    id="passing-grade"
                    type="number"
                    step="0.1"
                    value={parameters?.passing_grade || 6.0}
                    onChange={(e) =>
                      setParameters(prev => prev ? { ...prev, passing_grade: parseFloat(e.target.value) } : null)
                    }
                    disabled={!editMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-grade">Nota Máxima</Label>
                  <Input
                    id="max-grade"
                    type="number"
                    step="0.1"
                    value={parameters?.max_grade || 10.0}
                    onChange={(e) =>
                      setParameters(prev => prev ? { ...prev, max_grade: parseFloat(e.target.value) } : null)
                    }
                    disabled={!editMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-grade">Nota Mínima</Label>
                  <Input
                    id="min-grade"
                    type="number"
                    step="0.1"
                    value={parameters?.min_grade || 0.0}
                    onChange={(e) =>
                      setParameters(prev => prev ? { ...prev, min_grade: parseFloat(e.target.value) } : null)
                    }
                    disabled={!editMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decimal-places">Casas Decimais</Label>
                  <Select
                    value={parameters?.decimal_places?.toString() || '1'}
                    onValueChange={(value) =>
                      setParameters(prev => prev ? { ...prev, decimal_places: parseInt(value) } : null)
                    }
                    disabled={!editMode}
                  >
                    <SelectTrigger id="decimal-places">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 (Inteiro)</SelectItem>
                      <SelectItem value="1">1 (Ex: 7.5)</SelectItem>
                      <SelectItem value="2">2 (Ex: 7.50)</SelectItem>
                      <SelectItem value="3">3 (Ex: 7.500)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-rounding">Permitir Arredondamento</Label>
                    <p className="text-sm text-gray-500">Arredondar notas automaticamente</p>
                  </div>
                  <Switch
                    id="allow-rounding"
                    checked={parameters?.allow_grade_rounding || true}
                    onCheckedChange={(checked) =>
                      setParameters(prev => prev ? { ...prev, allow_grade_rounding: checked } : null)
                    }
                    disabled={!editMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="recovery-exams">Permitir Recuperação</Label>
                    <p className="text-sm text-gray-500">Permite provas de recuperação</p>
                  </div>
                  <Switch
                    id="recovery-exams"
                    checked={parameters?.allow_recovery_exams || true}
                    onCheckedChange={(checked) =>
                      setParameters(prev => prev ? { ...prev, allow_recovery_exams: checked } : null)
                    }
                    disabled={!editMode}
                  />
                </div>

                {parameters?.allow_recovery_exams && (
                  <>
                    <div className="space-y-2 ml-8">
                      <Label htmlFor="recovery-grade">Nota Mínima para Recuperação</Label>
                      <Input
                        id="recovery-grade"
                        type="number"
                        step="0.1"
                        value={parameters?.recovery_passing_grade || 6.0}
                        onChange={(e) =>
                          setParameters(prev => prev ? { ...prev, recovery_passing_grade: parseFloat(e.target.value) } : null)
                        }
                        disabled={!editMode}
                      />
                    </div>

                    <div className="space-y-2 ml-8">
                      <Label htmlFor="recovery-attempts">Máximo de Tentativas</Label>
                      <Input
                        id="recovery-attempts"
                        type="number"
                        value={parameters?.max_recovery_attempts || 1}
                        onChange={(e) =>
                          setParameters(prev => prev ? { ...prev, max_recovery_attempts: parseInt(e.target.value) } : null)
                        }
                        disabled={!editMode}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2">
                {!editMode ? (
                  <Button onClick={() => setEditMode(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => { setEditMode(false); loadParameters(); }}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveParameters} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Frequência</CardTitle>
              <CardDescription>Configure regras de presença e faltas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="min-attendance">Frequência Mínima (%)</Label>
                  <Input
                    id="min-attendance"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={parameters?.min_attendance_percentage || 75.0}
                    onChange={(e) =>
                      setParameters(prev => prev ? { ...prev, min_attendance_percentage: parseFloat(e.target.value) } : null)
                    }
                    disabled={!editMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-absences">Máximo de Faltas Permitidas</Label>
                  <Input
                    id="max-absences"
                    type="number"
                    value={parameters?.max_absences_allowed || ''}
                    onChange={(e) =>
                      setParameters(prev => prev ? { ...prev, max_absences_allowed: e.target.value ? parseInt(e.target.value) : null } : null)
                    }
                    disabled={!editMode}
                    placeholder="Deixe vazio para ilimitado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="late-threshold">Minutos para Considerar Atraso</Label>
                  <Input
                    id="late-threshold"
                    type="number"
                    value={parameters?.late_minutes_threshold || 15}
                    onChange={(e) =>
                      setParameters(prev => prev ? { ...prev, late_minutes_threshold: parseInt(e.target.value) } : null)
                    }
                    disabled={!editMode}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="late-as-absent">Contar Atraso como Falta</Label>
                    <p className="text-sm text-gray-500">Considerar atraso como ausência</p>
                  </div>
                  <Switch
                    id="late-as-absent"
                    checked={parameters?.count_late_as_absent || false}
                    onCheckedChange={(checked) =>
                      setParameters(prev => prev ? { ...prev, count_late_as_absent: checked } : null)
                    }
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {!editMode ? (
                  <Button onClick={() => setEditMode(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => { setEditMode(false); loadParameters(); }}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveParameters} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grade Levels Tab */}
        <TabsContent value="grade-levels" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Níveis Escolares</CardTitle>
                  <CardDescription>Gerencie séries e anos letivos</CardDescription>
                </div>
                <Button onClick={() => { setEditingGradeLevel(null); setGradeLevelDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Nível
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Nível de Ensino</TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradeLevels.map((level) => (
                    <TableRow key={level.id}>
                      <TableCell className="font-medium">{level.name}</TableCell>
                      <TableCell>{level.code || '-'}</TableCell>
                      <TableCell>{level.education_level}</TableCell>
                      <TableCell>{level.level}</TableCell>
                      <TableCell>
                        {level.min_age && level.max_age
                          ? `${level.min_age}-${level.max_age} anos`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          level.active 
                            ? 'border-transparent bg-primary text-primary-foreground' 
                            : 'border-transparent bg-secondary text-secondary-foreground'
                        }`}>
                          {level.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingGradeLevel(level); setGradeLevelDialog(true); }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGradeLevel(level.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Disciplinas</CardTitle>
                  <CardDescription>Gerencie disciplinas e matérias</CardDescription>
                </div>
                <Button onClick={() => { setEditingSubject(null); setSubjectDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Disciplina
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Carga Horária</TableHead>
                    <TableHead>Créditos</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.code || '-'}</TableCell>
                      <TableCell>{subject.workload_hours ? `${subject.workload_hours}h` : '-'}</TableCell>
                      <TableCell>{subject.credits || '-'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          subject.is_mandatory 
                            ? 'border-transparent bg-primary text-primary-foreground' 
                            : 'text-foreground'
                        }`}>
                          {subject.is_mandatory ? 'Obrigatória' : 'Optativa'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          subject.active 
                            ? 'border-transparent bg-primary text-primary-foreground' 
                            : 'border-transparent bg-secondary text-secondary-foreground'
                        }`}>
                          {subject.active ? 'Ativa' : 'Inativa'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingSubject(subject); setSubjectDialog(true); }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubject(subject.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Grade Level Dialog */}
      <GradeLevelDialog
        open={gradeLevelDialog}
        onOpenChange={setGradeLevelDialog}
        gradeLevel={editingGradeLevel}
        onSave={handleSaveGradeLevel}
      />

      {/* Subject Dialog */}
      <SubjectDialog
        open={subjectDialog}
        onOpenChange={setSubjectDialog}
        subject={editingSubject}
        onSave={handleSaveSubject}
      />
    </div>
  );
}

// Grade Level Dialog Component
function GradeLevelDialog({
  open,
  onOpenChange,
  gradeLevel,
  onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradeLevel: GradeLevel | null;
  onSave: (gradeLevel: Partial<GradeLevel>) => void;
}) {
  const [formData, setFormData] = useState<Partial<GradeLevel>>({
    name: '',
    code: '',
    level: 1,
    education_level: 'Fundamental',
    min_age: null,
    max_age: null,
    active: true,
    institution_id: '1' // TODO: Get from context
  });

  useEffect(() => {
    if (gradeLevel) {
      setFormData(gradeLevel);
    } else {
      setFormData({
        name: '',
        code: '',
        level: 1,
        education_level: 'Fundamental',
        min_age: null,
        max_age: null,
        active: true,
        institution_id: '1'
      });
    }
  }, [gradeLevel, open]);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{gradeLevel ? 'Editar Nível' : 'Novo Nível'}</DialogTitle>
          <DialogDescription>Configure o nível escolar</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="level-name">Nome *</Label>
            <Input
              id="level-name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: 9º Ano, 1ª Série"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level-code">Código</Label>
              <Input
                id="level-code"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: 9A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level-order">Ordem *</Label>
              <Input
                id="level-order"
                type="number"
                value={formData.level || 1}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education-level">Nível de Ensino *</Label>
            <Select
              value={formData.education_level || 'Fundamental'}
              onValueChange={(value) => setFormData({ ...formData, education_level: value })}
            >
              <SelectTrigger id="education-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Infantil">Educação Infantil</SelectItem>
                <SelectItem value="Fundamental">Ensino Fundamental</SelectItem>
                <SelectItem value="Médio">Ensino Médio</SelectItem>
                <SelectItem value="Superior">Ensino Superior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-age">Idade Mínima</Label>
              <Input
                id="min-age"
                type="number"
                value={formData.min_age || ''}
                onChange={(e) => setFormData({ ...formData, min_age: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-age">Idade Máxima</Label>
              <Input
                id="max-age"
                type="number"
                value={formData.max_age || ''}
                onChange={(e) => setFormData({ ...formData, max_age: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="level-active"
              checked={formData.active || true}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="level-active">Ativo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Subject Dialog Component
function SubjectDialog({
  open,
  onOpenChange,
  subject,
  onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
  onSave: (subject: Partial<Subject>) => void;
}) {
  const [formData, setFormData] = useState<Partial<Subject>>({
    name: '',
    code: '',
    description: '',
    workload_hours: null,
    credits: null,
    is_mandatory: true,
    allows_substitution: false,
    active: true,
    institution_id: '1' // TODO: Get from context
  });

  useEffect(() => {
    if (subject) {
      setFormData(subject);
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        workload_hours: null,
        credits: null,
        is_mandatory: true,
        allows_substitution: false,
        active: true,
        institution_id: '1'
      });
    }
  }, [subject, open]);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{subject ? 'Editar Disciplina' : 'Nova Disciplina'}</DialogTitle>
          <DialogDescription>Configure a disciplina</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject-name">Nome *</Label>
            <Input
              id="subject-name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Matemática, Português"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-code">Código</Label>
            <Input
              id="subject-code"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Ex: MAT101"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-description">Descrição</Label>
            <Textarea
              id="subject-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição da disciplina..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workload">Carga Horária (h)</Label>
              <Input
                id="workload"
                type="number"
                value={formData.workload_hours || ''}
                onChange={(e) => setFormData({ ...formData, workload_hours: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credits">Créditos</Label>
              <Input
                id="credits"
                type="number"
                value={formData.credits || ''}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is-mandatory"
              checked={formData.is_mandatory || true}
              onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked })}
            />
            <Label htmlFor="is-mandatory">Disciplina Obrigatória</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allows-substitution"
              checked={formData.allows_substitution || false}
              onCheckedChange={(checked) => setFormData({ ...formData, allows_substitution: checked })}
            />
            <Label htmlFor="allows-substitution">Permite Substituição</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="subject-active"
              checked={formData.active || true}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="subject-active">Ativo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
