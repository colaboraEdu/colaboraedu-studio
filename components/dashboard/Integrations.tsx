import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Plug,
  Plus,
  Edit,
  Trash2,
  Power,
  PlayCircle,
  Mail,
  Cloud,
  MessageSquare,
  Calendar,
  FileText,
  Webhook,
  Activity,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

// API Configuration
const API_BASE_URL = 'http://192.168.10.178:8004/api/v1/integrations';

// Simple API helper
const api = {
  get: async (endpoint: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
  post: async (endpoint: string, data: any, token: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
  put: async (endpoint: string, data: any, token: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
  delete: async (endpoint: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
};

interface Integration {
  id: number;
  name: string;
  service_type: 'email' | 'sms' | 'calendar' | 'storage' | 'lms' | 'erp' | 'payment' | 'analytics' | 'other';
  provider: string;
  status: string;
  enabled: boolean;
  credentials: Record<string, any>;
  configuration: Record<string, any>;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

interface Webhook {
  id: number;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  headers?: Record<string, string>;
  secret?: string;
  retry_count: number;
  timeout: number;
  last_triggered_at?: string;
  total_calls: number;
  failed_calls: number;
  created_at: string;
  updated_at: string;
}

interface IntegrationLog {
  id: number;
  integration_id: number;
  event_type: string;
  status: string;
  request_data?: Record<string, any>;
  response_data?: Record<string, any>;
  error_message?: string;
  duration_ms?: number;
  created_at: string;
}

interface Statistics {
  total_integrations: number;
  active_integrations: number;
  total_api_calls: number;
  failed_calls: number;
  avg_response_time: number;
}

const Integrations = () => {
  const [activeTab, setActiveTab] = useState('integrations');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);

  // Form states
  const [integrationForm, setIntegrationForm] = useState({
    name: '',
    service_type: 'other' as Integration['service_type'],
    provider: '',
    credentials: {},
    configuration: {},
    enabled: true,
  });

  const [webhookForm, setWebhookForm] = useState({
    name: '',
    url: '',
    events: [] as string[],
    enabled: true,
    headers: {},
    secret: '',
    retry_count: 3,
    timeout: 30,
  });

  useEffect(() => {
    loadData();
  }, []);

  const getToken = () => {
    return localStorage.getItem('token') || '';
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const [integrationsData, webhooksData, logsData, statsData] = await Promise.all([
        api.get('/integrations', token),
        api.get('/webhooks', token),
        api.get('/logs?limit=100', token),
        api.get('/statistics', token),
      ]);

      setIntegrations(integrationsData);
      setWebhooks(webhooksData);
      setLogs(logsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados de integrações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIntegration = async () => {
    try {
      const token = getToken();
      if (editingIntegration) {
        await api.put(`/integrations/${editingIntegration.id}`, integrationForm, token);
        toast.success('Integração atualizada com sucesso!');
      } else {
        await api.post('/integrations', integrationForm, token);
        toast.success('Integração criada com sucesso!');
      }
      setIntegrationDialogOpen(false);
      resetIntegrationForm();
      loadData();
    } catch (error) {
      console.error('Error saving integration:', error);
      toast.error('Erro ao salvar integração');
    }
  };

  const handleDeleteIntegration = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta integração?')) return;
    
    try {
      const token = getToken();
      await api.delete(`/integrations/${id}`, token);
      toast.success('Integração excluída com sucesso!');
      loadData();
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast.error('Erro ao excluir integração');
    }
  };

  const handleToggleIntegration = async (id: number) => {
    try {
      const token = getToken();
      await api.post(`/integrations/${id}/toggle`, {}, token);
      toast.success('Status da integração alterado!');
      loadData();
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast.error('Erro ao alterar status da integração');
    }
  };

  const handleTestIntegration = async (id: number) => {
    try {
      const token = getToken();
      await api.post(`/integrations/${id}/test`, {}, token);
      toast.success('Integração testada com sucesso!');
      loadData();
    } catch (error) {
      console.error('Error testing integration:', error);
      toast.error('Erro ao testar integração');
    }
  };

  const handleSaveWebhook = async () => {
    try {
      const token = getToken();
      if (editingWebhook) {
        await api.put(`/webhooks/${editingWebhook.id}`, webhookForm, token);
        toast.success('Webhook atualizado com sucesso!');
      } else {
        await api.post('/webhooks', webhookForm, token);
        toast.success('Webhook criado com sucesso!');
      }
      setWebhookDialogOpen(false);
      resetWebhookForm();
      loadData();
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast.error('Erro ao salvar webhook');
    }
  };

  const handleDeleteWebhook = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este webhook?')) return;
    
    try {
      const token = getToken();
      await api.delete(`/webhooks/${id}`, token);
      toast.success('Webhook excluído com sucesso!');
      loadData();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error('Erro ao excluir webhook');
    }
  };

  const handleTestWebhook = async (id: number) => {
    try {
      const token = getToken();
      await api.post(`/webhooks/${id}/test`, {}, token);
      toast.success('Webhook testado com sucesso!');
      loadData();
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error('Erro ao testar webhook');
    }
  };

  const resetIntegrationForm = () => {
    setIntegrationForm({
      name: '',
      service_type: 'other',
      provider: '',
      credentials: {},
      configuration: {},
      enabled: true,
    });
    setEditingIntegration(null);
  };

  const resetWebhookForm = () => {
    setWebhookForm({
      name: '',
      url: '',
      events: [],
      enabled: true,
      headers: {},
      secret: '',
      retry_count: 3,
      timeout: 30,
    });
    setEditingWebhook(null);
  };

  const openEditIntegration = (integration: Integration) => {
    setEditingIntegration(integration);
    setIntegrationForm({
      name: integration.name,
      service_type: integration.service_type,
      provider: integration.provider,
      credentials: integration.credentials,
      configuration: integration.configuration,
      enabled: integration.enabled,
    });
    setIntegrationDialogOpen(true);
  };

  const openEditWebhook = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setWebhookForm({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      enabled: webhook.enabled,
      headers: webhook.headers || {},
      secret: webhook.secret || '',
      retry_count: webhook.retry_count,
      timeout: webhook.timeout,
    });
    setWebhookDialogOpen(true);
  };

  const getServiceTypeIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      email: Mail,
      sms: MessageSquare,
      calendar: Calendar,
      storage: Cloud,
      lms: FileText,
      erp: BarChart3,
      payment: FileText,
      analytics: BarChart3,
      other: Plug,
    };
    const Icon = iconMap[type] || Plug;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string, enabled: boolean) => {
    const className = enabled 
      ? 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-green-200'
      : 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 border-gray-200';
    
    return <span className={className}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando integrações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie integrações com serviços externos
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Integrações</CardTitle>
              <Plug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_integrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativas</CardTitle>
              <Power className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.active_integrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chamadas API</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_api_calls}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falhas</CardTitle>
              <Activity className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.failed_calls}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.avg_response_time}ms</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Integrações Configuradas</CardTitle>
                  <CardDescription>Gerencie suas integrações com serviços externos</CardDescription>
                </div>
                <Button onClick={() => {
                  resetIntegrationForm();
                  setIntegrationDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Integração
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Provedor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getServiceTypeIcon(integration.service_type)}
                          {integration.name}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{integration.service_type}</TableCell>
                      <TableCell>{integration.provider}</TableCell>
                      <TableCell>
                        {getStatusBadge(integration.status, integration.enabled)}
                      </TableCell>
                      <TableCell>{integration.usage_count} calls</TableCell>
                      <TableCell>
                        {integration.last_used_at
                          ? new Date(integration.last_used_at).toLocaleDateString('pt-BR')
                          : 'Nunca'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestIntegration(integration.id)}
                          >
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleIntegration(integration.id)}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditIntegration(integration)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteIntegration(integration.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {integrations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhuma integração configurada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhooks Configurados</CardTitle>
                  <CardDescription>Configure webhooks para receber notificações de eventos</CardDescription>
                </div>
                <Button onClick={() => {
                  resetWebhookForm();
                  setWebhookDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Eventos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Chamadas</TableHead>
                    <TableHead>Taxa de Erro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Webhook className="h-4 w-4" />
                          {webhook.name}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{webhook.url}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-200">
                          {webhook.events.length} eventos
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(webhook.enabled ? 'Ativo' : 'Inativo', webhook.enabled)}
                      </TableCell>
                      <TableCell>{webhook.total_calls}</TableCell>
                      <TableCell>
                        {webhook.total_calls > 0
                          ? `${((webhook.failed_calls / webhook.total_calls) * 100).toFixed(1)}%`
                          : '0%'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestWebhook(webhook.id)}
                          >
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditWebhook(webhook)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {webhooks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhum webhook configurado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Integrações</CardTitle>
              <CardDescription>Histórico de chamadas às integrações</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Integração</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Erro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const integration = integrations.find(i => i.id === log.integration_id);
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>{integration?.name || 'N/A'}</TableCell>
                        <TableCell>{log.event_type}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            log.status === 'success'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : log.status === 'error'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>
                            {log.status}
                          </span>
                        </TableCell>
                        <TableCell>{log.duration_ms ? `${log.duration_ms}ms` : '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhum log disponível
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Dialog */}
      <Dialog open={integrationDialogOpen} onOpenChange={setIntegrationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIntegration ? 'Editar Integração' : 'Nova Integração'}
            </DialogTitle>
            <DialogDescription>
              Configure a integração com um serviço externo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={integrationForm.name}
                  onChange={(e) =>
                    setIntegrationForm({ ...integrationForm, name: e.target.value })
                  }
                  placeholder="Ex: Gmail API"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_type">Tipo de Serviço</Label>
                <Select
                  value={integrationForm.service_type}
                  onValueChange={(value: Integration['service_type']) =>
                    setIntegrationForm({ ...integrationForm, service_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="calendar">Calendário</SelectItem>
                    <SelectItem value="storage">Armazenamento</SelectItem>
                    <SelectItem value="lms">LMS</SelectItem>
                    <SelectItem value="erp">ERP</SelectItem>
                    <SelectItem value="payment">Pagamento</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provedor</Label>
              <Input
                id="provider"
                value={integrationForm.provider}
                onChange={(e) =>
                  setIntegrationForm({ ...integrationForm, provider: e.target.value })
                }
                placeholder="Ex: Google, Microsoft, Custom"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Ativar integração</Label>
              <Switch
                id="enabled"
                checked={integrationForm.enabled}
                onCheckedChange={(checked) =>
                  setIntegrationForm({ ...integrationForm, enabled: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIntegrationDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveIntegration}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook Dialog */}
      <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingWebhook ? 'Editar Webhook' : 'Novo Webhook'}
            </DialogTitle>
            <DialogDescription>
              Configure um webhook para receber notificações de eventos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-name">Nome</Label>
              <Input
                id="webhook-name"
                value={webhookForm.name}
                onChange={(e) =>
                  setWebhookForm({ ...webhookForm, name: e.target.value })
                }
                placeholder="Ex: Webhook de Matrículas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={webhookForm.url}
                onChange={(e) =>
                  setWebhookForm({ ...webhookForm, url: e.target.value })
                }
                placeholder="https://exemplo.com/webhook"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret">Secret (opcional)</Label>
              <Input
                id="secret"
                type="password"
                value={webhookForm.secret}
                onChange={(e) =>
                  setWebhookForm({ ...webhookForm, secret: e.target.value })
                }
                placeholder="Secret para validação"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retry">Tentativas</Label>
                <Input
                  id="retry"
                  type="number"
                  value={webhookForm.retry_count}
                  onChange={(e) =>
                    setWebhookForm({ ...webhookForm, retry_count: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (s)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={webhookForm.timeout}
                  onChange={(e) =>
                    setWebhookForm({ ...webhookForm, timeout: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="webhook-enabled">Ativar webhook</Label>
              <Switch
                id="webhook-enabled"
                checked={webhookForm.enabled}
                onCheckedChange={(checked) =>
                  setWebhookForm({ ...webhookForm, enabled: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWebhookDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveWebhook}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Integrations;
