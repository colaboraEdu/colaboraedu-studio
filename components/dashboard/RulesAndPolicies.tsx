/**
 * RulesAndPolicies Component
 * 
 * Página de gerenciamento de Regras e Políticas do sistema
 * - Criar, editar e excluir políticas
 * - Organizar por categorias (Acadêmica, Uso, Privacidade, Conduta, Segurança)
 * - Definir políticas obrigatórias
 * - Acompanhar estatísticas de aceitação
 * - Reordenar políticas
 * 
 * Usa shadcn/ui components e React Hook Form com Zod validation
 */

"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  FileText,
  Shield,
  Lock,
  Users,
  BookOpen,
  Eye,
  TrendingUp,
  Calendar,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Filter,
} from "lucide-react";

// shadcn/ui components
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../src/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../../src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import { Switch } from "../../src/components/ui/switch";
import { Separator } from "../../src/components/ui/separator";
import { toast } from "sonner";
import { rulesPoliciesAPI, RulePolicy, PolicyStatistics, RulesPoliciesStats } from "../../src/services/api";

// ============================================================================
// TIPOS E CONSTANTES
// ============================================================================

const CATEGORIES = [
  { value: "academic", label: "Acadêmica", icon: BookOpen, color: "bg-blue-100 text-blue-700" },
  { value: "usage", label: "Uso do Sistema", icon: Users, color: "bg-green-100 text-green-700" },
  { value: "privacy", label: "Privacidade", icon: Lock, color: "bg-purple-100 text-purple-700" },
  { value: "conduct", label: "Conduta", icon: Shield, color: "bg-orange-100 text-orange-700" },
  { value: "security", label: "Segurança", icon: AlertCircle, color: "bg-red-100 text-red-700" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Ativa", color: "bg-green-100 text-green-700" },
  { value: "inactive", label: "Inativa", color: "bg-gray-100 text-gray-700" },
  { value: "draft", label: "Rascunho", color: "bg-yellow-100 text-yellow-700" },
];

const ROLE_OPTIONS = [
  { value: "student", label: "Estudante" },
  { value: "teacher", label: "Professor" },
  { value: "coordinator", label: "Coordenador" },
  { value: "admin", label: "Administrador" },
  { value: "guardian", label: "Responsável" },
  { value: "secretary", label: "Secretário" },
  { value: "librarian", label: "Bibliotecário" },
];

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

const policySchema = z.object({
  category: z.string().min(1, "Categoria é obrigatória"),
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(255),
  description: z.string().optional(),
  content: z.string().min(10, "Conteúdo deve ter no mínimo 10 caracteres"),
  status: z.string(),
  is_mandatory: z.boolean(),
  applies_to: z.array(z.string()),
  version: z.string(),
  effective_date: z.string().optional(),
  expiry_date: z.string().optional(),
});

type PolicyFormData = z.infer<typeof policySchema>;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const RulesAndPolicies: React.FC = () => {
  const [policies, setPolicies] = useState<RulePolicy[]>([]);
  const [stats, setStats] = useState<RulesPoliciesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<RulePolicy | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewingPolicy, setViewingPolicy] = useState<RulePolicy | null>(null);
  const [policyStats, setPolicyStats] = useState<PolicyStatistics | null>(null);

  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      category: "academic",
      title: "",
      description: "",
      content: "",
      status: "active",
      is_mandatory: false,
      applies_to: [],
      version: "1.0",
      effective_date: "",
      expiry_date: "",
    },
  });

  // ============================================================================
  // CARREGAR DADOS
  // ============================================================================

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar políticas com filtros
      const filters: any = {};
      if (selectedCategory !== "all") filters.category = selectedCategory;
      if (selectedStatus !== "all") filters.status = selectedStatus;
      
      const policiesData = await rulesPoliciesAPI.list(filters);
      setPolicies(policiesData.data);

      // Carregar estatísticas
      const statsData = await rulesPoliciesAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar regras e políticas");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateNew = () => {
    setEditingPolicy(null);
    form.reset({
      category: "academic",
      title: "",
      description: "",
      content: "",
      status: "active",
      is_mandatory: false,
      applies_to: [],
      version: "1.0",
      effective_date: "",
      expiry_date: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (policy: RulePolicy) => {
    setEditingPolicy(policy);
    form.reset({
      category: policy.category,
      title: policy.title,
      description: policy.description || "",
      content: policy.content,
      status: policy.status,
      is_mandatory: policy.is_mandatory,
      applies_to: policy.applies_to,
      version: policy.version,
      effective_date: policy.effective_date || "",
      expiry_date: policy.expiry_date || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (data: PolicyFormData) => {
    try {
      if (editingPolicy) {
        await rulesPoliciesAPI.update(editingPolicy.id, data);
        toast.success("Política atualizada com sucesso!");
      } else {
        await rulesPoliciesAPI.create(data);
        toast.success("Política criada com sucesso!");
      }
      
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error("Erro ao salvar política:", error);
      toast.error(error.response?.data?.detail || "Erro ao salvar política");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta política?")) return;

    try {
      await rulesPoliciesAPI.delete(id);
      toast.success("Política excluída com sucesso!");
      loadData();
    } catch (error) {
      console.error("Erro ao excluir política:", error);
      toast.error("Erro ao excluir política");
    }
  };

  const handleViewDetails = async (policy: RulePolicy) => {
    setViewingPolicy(policy);
    try {
      const stats = await rulesPoliciesAPI.getPolicyStats(policy.id);
      setPolicyStats(stats);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const handleMovePolicy = async (policy: RulePolicy, direction: "up" | "down") => {
    const categoryPolicies = policies.filter(p => p.category === policy.category);
    const currentIndex = categoryPolicies.findIndex(p => p.id === policy.id);
    
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === categoryPolicies.length - 1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const reorderedPolicies = [...categoryPolicies];
    [reorderedPolicies[currentIndex], reorderedPolicies[newIndex]] = 
    [reorderedPolicies[newIndex], reorderedPolicies[currentIndex]];

    const updates = reorderedPolicies.map((p, idx) => ({ id: p.id, order: idx }));

    try {
      await rulesPoliciesAPI.reorder(updates);
      loadData();
    } catch (error) {
      console.error("Erro ao reordenar:", error);
      toast.error("Erro ao reordenar políticas");
    }
  };

  // ============================================================================
  // RENDERIZAÇÃO DE ESTATÍSTICAS
  // ============================================================================

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Políticas</p>
                <p className="text-2xl font-bold">{stats.total_policies}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Políticas Ativas</p>
                <p className="text-2xl font-bold">{stats.active_policies}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Obrigatórias</p>
                <p className="text-2xl font-bold">{stats.mandatory_policies}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Atualizações (30d)</p>
                <p className="text-2xl font-bold">{stats.recent_updates}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Categorias</p>
                <p className="text-2xl font-bold">{Object.keys(stats.by_category).length}</p>
              </div>
              <Filter className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============================================================================
  // RENDERIZAÇÃO DE LISTA DE POLÍTICAS
  // ============================================================================

  const renderPolicyCard = (policy: RulePolicy) => {
    const category = CATEGORIES.find(c => c.value === policy.category);
    const status = STATUS_OPTIONS.find(s => s.value === policy.status);
    const CategoryIcon = category?.icon || FileText;

    return (
      <Card key={policy.id} className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg ${category?.color}`}>
                <CategoryIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">{policy.title}</CardTitle>
                  {policy.is_mandatory && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      Obrigatória
                    </span>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {policy.description || "Sem descrição"}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMovePolicy(policy, "up")}
                title="Mover para cima"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMovePolicy(policy, "down")}
                title="Mover para baixo"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${status?.color}`}>
              {status?.label}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border text-foreground">
              v{policy.version}
            </span>
            {policy.applies_to.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border-transparent bg-secondary text-secondary-foreground">
                {policy.applies_to.length} perfil(is)
              </span>
            )}
            {policy.effective_date && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border text-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                Vigência: {new Date(policy.effective_date).toLocaleDateString()}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{policy.content}</p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(policy)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(policy)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(policy.id)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // RENDERIZAÇÃO DO FORMULÁRIO
  // ============================================================================

  const renderPolicyForm = () => (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select
            value={form.watch("category")}
            onValueChange={(value) => form.setValue("category", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(value) => form.setValue("status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          {...form.register("title")}
          placeholder="Ex: Política de Uso de Dados"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          {...form.register("description")}
          placeholder="Breve descrição da política"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Conteúdo *</Label>
        <textarea
          id="content"
          {...form.register("content")}
          className="w-full min-h-[200px] p-3 border rounded-md"
          placeholder="Descreva a política em detalhes..."
        />
        {form.formState.errors.content && (
          <p className="text-sm text-red-600">{form.formState.errors.content.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="version">Versão</Label>
          <Input id="version" {...form.register("version")} placeholder="1.0" />
        </div>

        <div className="flex items-center space-x-2 pt-8">
          <Switch
            id="is_mandatory"
            checked={form.watch("is_mandatory")}
            onCheckedChange={(checked) => form.setValue("is_mandatory", checked)}
          />
          <Label htmlFor="is_mandatory" className="cursor-pointer">
            Política Obrigatória
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="effective_date">Data de Vigência</Label>
          <Input
            id="effective_date"
            type="date"
            {...form.register("effective_date")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiry_date">Data de Expiração</Label>
          <Input
            id="expiry_date"
            type="date"
            {...form.register("expiry_date")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Aplica-se aos perfis:</Label>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map((role) => (
            <div key={role.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`role-${role.value}`}
                value={role.value}
                checked={form.watch("applies_to").includes(role.value)}
                onChange={(e) => {
                  const current = form.watch("applies_to");
                  if (e.target.checked) {
                    form.setValue("applies_to", [...current, role.value]);
                  } else {
                    form.setValue("applies_to", current.filter(r => r !== role.value));
                  }
                }}
                className="h-4 w-4"
              />
              <Label htmlFor={`role-${role.value}`} className="cursor-pointer">
                {role.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {editingPolicy ? "Atualizar" : "Criar"} Política
        </Button>
      </DialogFooter>
    </form>
  );

  // ============================================================================
  // RENDERIZAÇÃO PRINCIPAL
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando políticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Regras e Políticas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as regras e políticas do sistema
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Política
        </Button>
      </div>

      {/* Estatísticas */}
      {renderStats()}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Políticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {policies.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma política encontrada</p>
              <Button onClick={handleCreateNew} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Política
              </Button>
            </CardContent>
          </Card>
        ) : (
          policies.map(renderPolicyCard)
        )}
      </div>

      {/* Dialog de Formulário */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? "Editar Política" : "Nova Política"}
            </DialogTitle>
            <DialogDescription>
              {editingPolicy
                ? "Atualize os dados da política abaixo"
                : "Preencha os dados para criar uma nova política"}
            </DialogDescription>
          </DialogHeader>
          {renderPolicyForm()}
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog open={!!viewingPolicy} onOpenChange={() => setViewingPolicy(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingPolicy && (
            <>
              <DialogHeader>
                <DialogTitle>{viewingPolicy.title}</DialogTitle>
                <DialogDescription>
                  {CATEGORIES.find(c => c.value === viewingPolicy.category)?.label} • 
                  Versão {viewingPolicy.version}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {viewingPolicy.description && (
                  <p className="text-gray-600">{viewingPolicy.description}</p>
                )}

                <Separator />

                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{viewingPolicy.content}</p>
                </div>

                {policyStats && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{policyStats.total_acceptances}</p>
                        <p className="text-sm text-gray-600">Aceitações</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{policyStats.acceptance_rate}%</p>
                        <p className="text-sm text-gray-600">Taxa de Aceitação</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{policyStats.pending_users}</p>
                        <p className="text-sm text-gray-600">Pendentes</p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Status:</span>{" "}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_OPTIONS.find(s => s.value === viewingPolicy.status)?.color}`}>
                      {STATUS_OPTIONS.find(s => s.value === viewingPolicy.status)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Obrigatória:</span>{" "}
                    {viewingPolicy.is_mandatory ? "Sim" : "Não"}
                  </div>
                  {viewingPolicy.effective_date && (
                    <div>
                      <span className="font-semibold">Vigência:</span>{" "}
                      {new Date(viewingPolicy.effective_date).toLocaleDateString()}
                    </div>
                  )}
                  {viewingPolicy.expiry_date && (
                    <div>
                      <span className="font-semibold">Expiração:</span>{" "}
                      {new Date(viewingPolicy.expiry_date).toLocaleDateString()}
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="font-semibold">Aplica-se a:</span>{" "}
                    {viewingPolicy.applies_to.length > 0
                      ? viewingPolicy.applies_to.map(role => 
                          ROLE_OPTIONS.find(r => r.value === role)?.label
                        ).join(", ")
                      : "Todos"}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewingPolicy(null)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  setViewingPolicy(null);
                  handleEdit(viewingPolicy);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
