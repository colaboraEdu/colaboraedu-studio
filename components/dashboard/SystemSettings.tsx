/**
 * SystemSettings Component
 * 
 * Página de configurações do sistema com tabs para:
 * - Configurações Gerais (nome, email, fuso horário, idioma)
 * - Aparência (logo, cores, tema)
 * - Segurança (2FA, sessões, senha)
 * - Notificações (email, sistema)
 * - Integrações (API, webhooks)
 * 
 * Usa shadcn/ui components e React Hook Form com Zod validation
 */

"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Save,
  Settings,
  Palette,
  Shield,
  Bell,
  Plug,
  Upload,
  Globe,
  Clock,
  Mail,
  Lock,
  Key,
  Database,
  Webhook,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

// API Configuration
const API_BASE_URL = 'http://192.168.10.178:8004/api/v1';

// Helper para obter token
const getAuthToken = () => {
  return localStorage.getItem('auth_token') || localStorage.getItem('access_token') || '';
};

// Simple API helper for settings
const settingsAPI = {
  get: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/settings/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch settings' }));
      throw new Error(error.detail || 'Failed to fetch settings');
    }
    return response.json();
  },
  updateGeneral: async (data: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/settings/general`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update general settings' }));
      throw new Error(error.detail || 'Failed to update general settings');
    }
    return response.json();
  },
  updateSecurity: async (data: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/settings/security`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update security settings' }));
      throw new Error(error.detail || 'Failed to update security settings');
    }
    return response.json();
  },
  updateNotifications: async (data: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/settings/notifications`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update notification settings' }));
      throw new Error(error.detail || 'Failed to update notification settings');
    }
    return response.json();
  },
  updateAppearance: async (data: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/settings/appearance`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update appearance settings' }));
      throw new Error(error.detail || 'Failed to update appearance settings');
    }
    return response.json();
  },
  updateIntegrations: async (data: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/settings/integrations`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update integration settings' }));
      throw new Error(error.detail || 'Failed to update integration settings');
    }
    return response.json();
  },
  regenerateApiKey: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/settings/regenerate-api-key`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to regenerate API key' }));
      throw new Error(error.detail || 'Failed to regenerate API key');
    }
    return response.json();
  },
};

// Type definitions
interface SystemSettingsType {
  general?: {
    platformName?: string;
    platformEmail?: string;
    timezone?: string;
    language?: string;
  };
  security?: {
    twoFactorEnabled?: boolean;
    sessionTimeout?: number;
    passwordPolicy?: string;
  };
  notifications?: {
    emailNotifications?: boolean;
    systemNotifications?: boolean;
  };
  appearance?: {
    logoUrl?: string;
    primaryColor?: string;
    theme?: string;
  };
  integrations?: {
    apiKey?: string;
    webhookUrl?: string;
    webhookEnabled?: boolean;
  };
}

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

const generalSettingsSchema = z.object({
  platformName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  platformEmail: z.string().email("Email inválido"),
  timezone: z.string(),
  language: z.string(),
  dateFormat: z.string(),
});

const securitySettingsSchema = z.object({
  maintenanceMode: z.boolean(),
  twoFactorRequired: z.boolean(),
  sessionTimeout: z.number().min(5).max(1440),
  passwordMinLength: z.number().min(6).max(32),
  passwordRequireSpecialChars: z.boolean(),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  systemNotifications: z.boolean(),
  securityAlerts: z.boolean(),
  weeklyReports: z.boolean(),
});

type GeneralSettings = z.infer<typeof generalSettingsSchema>;
type SecuritySettings = z.infer<typeof securitySettingsSchema>;
type NotificationSettings = z.infer<typeof notificationSettingsSchema>;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [currentSettings, setCurrentSettings] = useState<SystemSettingsType | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");

  // Forms para cada seção
  const generalForm = useForm<GeneralSettings>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      platformName: "colaboraEDU",
      platformEmail: "contato@colaboraedu.com",
      timezone: "America/Sao_Paulo",
      language: "pt-BR",
      dateFormat: "DD/MM/YYYY",
    },
  });

  const securityForm = useForm<SecuritySettings>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      maintenanceMode: false,
      twoFactorRequired: false,
      sessionTimeout: 60,
      passwordMinLength: 8,
      passwordRequireSpecialChars: true,
    },
  });

  const notificationForm = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      systemNotifications: true,
      securityAlerts: true,
      weeklyReports: false,
    },
  });

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await settingsAPI.get();
      setCurrentSettings(settings);
      setApiKey(settings.api_key || "");
      
      // Atualizar forms com dados carregados
      generalForm.reset({
        platformName: settings.platform_name,
        platformEmail: settings.platform_email,
        timezone: settings.timezone,
        language: settings.language,
        dateFormat: settings.date_format,
      });

      securityForm.reset({
        maintenanceMode: settings.maintenance_mode,
        twoFactorRequired: settings.two_factor_required,
        sessionTimeout: settings.session_timeout,
        passwordMinLength: settings.password_min_length,
        passwordRequireSpecialChars: settings.password_require_special_chars,
      });

      notificationForm.reset({
        emailNotifications: settings.email_notifications,
        systemNotifications: settings.system_notifications,
        securityAlerts: settings.security_alerts,
        weeklyReports: settings.weekly_reports,
      });

      if (settings.logo_url) {
        setLogoPreview(settings.logo_url);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar configurações: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HANDLERS MELHORADOS
  // ============================================================================
  
  const handleGeneralSubmit = async (data: GeneralSettings) => {
    try {
      setSaving(true);
      
      // Verificar se houve alterações
      const hasChanges = 
        data.platformName !== currentSettings?.platform_name ||
        data.platformEmail !== currentSettings?.platform_email ||
        data.timezone !== currentSettings?.timezone ||
        data.language !== currentSettings?.language ||
        data.dateFormat !== currentSettings?.date_format;
  
      if (!hasChanges) {
        toast.info("Nenhuma alteração detectada nas configurações gerais.");
        return;
      }
  
      // Validação adicional
      if (!data.platformName.trim()) {
        toast.error("Nome da plataforma é obrigatório");
        return;
      }
  
      // Mostrar loading específico
      toast.loading("Salvando configurações gerais...", { id: "general-save" });
  
      await settingsAPI.updateGeneral({
        platform_name: data.platformName,
        platform_email: data.platformEmail,
        timezone: data.timezone,
        language: data.language,
        date_format: data.dateFormat,
      });
  
      // Atualizar estado local
      await loadSettings();
      
      toast.success("Configurações gerais salvas com sucesso!", { id: "general-save" });
    } catch (error: any) {
      console.error("Erro ao salvar configurações gerais:", error);
      
      // Tratamento específico de erros
      let errorMessage = "Erro desconhecido ao salvar configurações";
      
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message.includes("403")) {
        errorMessage = "Você não tem permissão para alterar essas configurações.";
      } else if (error.message.includes("400")) {
        errorMessage = "Dados inválidos. Verifique os campos e tente novamente.";
      } else if (error.message.includes("500")) {
        errorMessage = "Erro interno do servidor. Tente novamente em alguns minutos.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage, { id: "general-save" });
    } finally {
      setSaving(false);
    }
  };
  
  const handleSecuritySubmit = async (data: SecuritySettings) => {
    try {
      setSaving(true);
      
      // Verificar se houve alterações
      const hasChanges = 
        data.maintenanceMode !== currentSettings?.maintenance_mode ||
        data.twoFactorRequired !== currentSettings?.two_factor_required ||
        data.sessionTimeout !== currentSettings?.session_timeout ||
        data.passwordMinLength !== currentSettings?.password_min_length ||
        data.passwordRequireSpecialChars !== currentSettings?.password_require_special_chars;
  
      if (!hasChanges) {
        toast.info("Nenhuma alteração detectada nas configurações de segurança.");
        return;
      }
  
      // Validação adicional
      if (data.sessionTimeout < 5 || data.sessionTimeout > 1440) {
        toast.error("Timeout de sessão deve estar entre 5 e 1440 minutos");
        return;
      }
  
      if (data.passwordMinLength < 6 || data.passwordMinLength > 32) {
        toast.error("Tamanho mínimo da senha deve estar entre 6 e 32 caracteres");
        return;
      }
  
      toast.loading("Salvando configurações de segurança...", { id: "security-save" });
  
      await settingsAPI.updateSecurity({
        maintenance_mode: data.maintenanceMode,
        two_factor_required: data.twoFactorRequired,
        session_timeout: data.sessionTimeout,
        password_min_length: data.passwordMinLength,
        password_require_special_chars: data.passwordRequireSpecialChars,
      });
  
      await loadSettings();
      toast.success("Configurações de segurança salvas com sucesso!", { id: "security-save" });
    } catch (error: any) {
      console.error("Erro ao salvar configurações de segurança:", error);
      
      let errorMessage = "Erro ao salvar configurações de segurança";
      
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message.includes("403")) {
        errorMessage = "Você não tem permissão para alterar configurações de segurança.";
      } else if (error.message.includes("400")) {
        errorMessage = "Dados de segurança inválidos. Verifique os valores e tente novamente.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage, { id: "security-save" });
    } finally {
      setSaving(false);
    }
  };
  
  const handleNotificationSubmit = async (data: NotificationSettings) => {
    try {
      setSaving(true);
      await settingsAPI.updateNotifications({
        email_notifications: data.emailNotifications,
        system_notifications: data.systemNotifications,
        security_alerts: data.securityAlerts,
        weekly_reports: data.weeklyReports,
      });
      await loadSettings();
      toast.success("Preferências de notificação salvas com sucesso!", { id: "notification-save" });
    } catch (error: any) {
      console.error("Erro ao salvar configurações de notificação:", error);
      
      let errorMessage = "Erro ao salvar preferências de notificação";
      
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message.includes("403")) {
        errorMessage = "Você não tem permissão para alterar configurações de notificação.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage, { id: "notification-save" });
    } finally {
      setSaving(false);
    }
  };
  
  const handleAppearanceSubmit = async () => {
    try {
      setSaving(true);
      
      const primaryColor = (document.getElementById("primaryColor") as HTMLInputElement)?.value;
      const secondaryColor = (document.getElementById("secondaryColor") as HTMLInputElement)?.value;
      const accentColor = (document.getElementById("accentColor") as HTMLInputElement)?.value;
      
      // Verificar se houve alterações
      const hasChanges = 
        logoPreview !== currentSettings?.logo_url ||
        primaryColor !== currentSettings?.primary_color ||
        secondaryColor !== currentSettings?.secondary_color ||
        accentColor !== currentSettings?.accent_color;
  
      if (!hasChanges) {
        toast.info("Nenhuma alteração detectada nas configurações de aparência.");
        return;
      }
  
      // Validação de cores hexadecimais
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexColorRegex.test(primaryColor)) {
        toast.error("Cor primária deve estar no formato hexadecimal (#RRGGBB)");
        return;
      }
      if (!hexColorRegex.test(secondaryColor)) {
        toast.error("Cor secundária deve estar no formato hexadecimal (#RRGGBB)");
        return;
      }
      if (!hexColorRegex.test(accentColor)) {
        toast.error("Cor de destaque deve estar no formato hexadecimal (#RRGGBB)");
        return;
      }
  
      toast.loading("Salvando configurações de aparência...", { id: "appearance-save" });
      
      await settingsAPI.updateAppearance({
        logo_url: logoPreview || undefined,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
      });
  
      await loadSettings();
      toast.success("Configurações de aparência salvas com sucesso!", { id: "appearance-save" });
    } catch (error: any) {
      console.error("Erro ao salvar configurações de aparência:", error);
      
      let errorMessage = "Erro ao salvar configurações de aparência";
      
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message.includes("403")) {
        errorMessage = "Você não tem permissão para alterar a aparência do sistema.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage, { id: "appearance-save" });
    } finally {
      setSaving(false);
    }
  };
  
  const handleRegenerateApiKey = async () => {
    try {
      // Confirmação antes de regenerar
      if (!confirm("Tem certeza que deseja regenerar a chave API? A chave atual será invalidada.")) {
        return;
      }
  
      toast.loading("Regenerando chave API...", { id: "api-key-regen" });
      
      const result = await settingsAPI.regenerateApiKey();
      setApiKey(result.api_key);
      
      toast.success("Chave API regenerada com sucesso!", { id: "api-key-regen" });
    } catch (error: any) {
      console.error("Erro ao regenerar chave API:", error);
      
      let errorMessage = "Erro ao regenerar chave API";
      
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message.includes("403")) {
        errorMessage = "Você não tem permissão para regenerar a chave API.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage, { id: "api-key-regen" });
    }
  };
  
  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      toast.success("Chave API copiada para a área de transferência!");
    } catch (error) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = apiKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Chave API copiada para a área de transferência!");
    }
  };
  
  const handleAddWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Digite uma URL válida para o webhook");
      return;
    }
  
    // Validação básica de URL
    try {
      new URL(webhookUrl);
    } catch {
      toast.error("URL do webhook inválida. Use o formato: https://exemplo.com/webhook");
      return;
    }
  
    try {
      toast.loading("Adicionando webhook...", { id: "webhook-add" });
      
      const currentWebhooks = currentSettings?.webhooks || [];
      
      // Verificar se o webhook já existe
      if (currentWebhooks.includes(webhookUrl)) {
        toast.error("Este webhook já foi adicionado", { id: "webhook-add" });
        return;
      }
      
      await settingsAPI.updateIntegrations({
        webhooks: [...currentWebhooks, webhookUrl],
      });
      
      setWebhookUrl("");
      await loadSettings();
      
      toast.success("Webhook adicionado com sucesso!", { id: "webhook-add" });
    } catch (error: any) {
      console.error("Erro ao adicionar webhook:", error);
      
      let errorMessage = "Erro ao adicionar webhook";
      
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message.includes("403")) {
        errorMessage = "Você não tem permissão para adicionar webhooks.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage, { id: "webhook-add" });
    }
  };
  
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    // Validação do arquivo
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
  
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. O tamanho máximo é 5MB.");
      return;
    }
  
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não suportado. Use JPEG, PNG, SVG ou WebP.");
      return;
    }
  
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
      toast.success("Logo carregado com sucesso! Clique em 'Salvar Alterações' para aplicar.");
    };
    reader.onerror = () => {
      toast.error("Erro ao carregar o arquivo. Tente novamente.");
    };
    reader.readAsDataURL(file);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-8 w-8 text-teal-600" />
          Configurações do Sistema
        </h1>
        <p className="text-gray-600 mt-2">
          Gerencie as configurações globais da plataforma colaboraEDU
        </p>
      </div>

      <Separator />

      {/* Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CONFIGURAÇÕES GERAIS */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure as informações básicas da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={generalForm.handleSubmit(handleGeneralSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Nome da Plataforma */}
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Nome da Plataforma</Label>
                    <Input
                      id="platformName"
                      {...generalForm.register("platformName")}
                      placeholder="colaboraEDU"
                    />
                    {generalForm.formState.errors.platformName && (
                      <p className="text-sm text-red-600">
                        {generalForm.formState.errors.platformName.message}
                      </p>
                    )}
                  </div>

                  {/* Email de Contato */}
                  <div className="space-y-2">
                    <Label htmlFor="platformEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email de Contato Principal
                    </Label>
                    <Input
                      id="platformEmail"
                      type="email"
                      {...generalForm.register("platformEmail")}
                      placeholder="contato@colaboraedu.com"
                    />
                    {generalForm.formState.errors.platformEmail && (
                      <p className="text-sm text-red-600">
                        {generalForm.formState.errors.platformEmail.message}
                      </p>
                    )}
                  </div>

                  {/* Fuso Horário */}
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Fuso Horário
                    </Label>
                    <select
                      id="timezone"
                      {...generalForm.register("timezone")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="America/Sao_Paulo">
                        Brasília (GMT-3)
                      </option>
                      <option value="America/New_York">
                        Nova York (GMT-5)
                      </option>
                      <option value="Europe/London">Londres (GMT+0)</option>
                      <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
                    </select>
                  </div>

                  {/* Idioma */}
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma Padrão</Label>
                    <select
                      id="language"
                      {...generalForm.register("language")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                      <option value="fr-FR">Français</option>
                    </select>
                  </div>

                  {/* Formato de Data */}
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Formato de Data</Label>
                    <select
                      id="dateFormat"
                      {...generalForm.register("dateFormat")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving || !generalForm.formState.isDirty}
                    className="min-w-[160px]"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: APARÊNCIA */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a identidade visual da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-4">
                <Label>Logo da Plataforma</Label>
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg width="80" height="80" viewBox="0 0 100 100">
                        <path
                          d="M0 20 L40 20 L40 0 L60 0 L60 60 L100 60 L100 80 L0 80 Z"
                          fill="#14B8A6"
                        />
                        <path
                          d="M40 40 L40 60 L20 60 L20 40 Z"
                          fill="#0891B2"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-gray-600">
                      Recomendamos uma imagem PNG ou SVG com fundo
                      transparente. Tamanho ideal: 200x200px
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("logo-upload")?.click()
                        }
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Fazer Upload
                      </Button>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      {logoPreview && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setLogoPreview(null)}
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Cores do Tema */}
              <div className="space-y-4">
                <Label>Cores do Tema</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        defaultValue="#14B8A6"
                        className="h-10 w-20"
                      />
                      <Input
                        type="text"
                        defaultValue="#14B8A6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        defaultValue="#0891B2"
                        className="h-10 w-20"
                      />
                      <Input
                        type="text"
                        defaultValue="#0891B2"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Cor de Destaque</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        defaultValue="#F59E0B"
                        className="h-10 w-20"
                      />
                      <Input
                        type="text"
                        defaultValue="#F59E0B"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline">
                  Restaurar Padrão
                </Button>
                <Button onClick={handleAppearanceSubmit} disabled={saving}>
                  {saving ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: SEGURANÇA */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Configure as opções de segurança da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={securityForm.handleSubmit(handleSecuritySubmit)}
                className="space-y-6"
              >
                {/* Modo de Manutenção */}
                <div className="flex items-center justify-between py-4 border-b">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode" className="text-base flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Modo de Manutenção
                    </Label>
                    <p className="text-sm text-gray-600">
                      Quando ativado, apenas administradores podem acessar a
                      plataforma
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={securityForm.watch("maintenanceMode")}
                    onCheckedChange={(checked) =>
                      securityForm.setValue("maintenanceMode", checked)
                    }
                  />
                </div>

                {/* 2FA Obrigatório */}
                <div className="flex items-center justify-between py-4 border-b">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactorRequired" className="text-base flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Autenticação de Dois Fatores (2FA)
                    </Label>
                    <p className="text-sm text-gray-600">
                      Exigir que todos os usuários configurem 2FA para maior
                      segurança
                    </p>
                  </div>
                  <Switch
                    id="twoFactorRequired"
                    checked={securityForm.watch("twoFactorRequired")}
                    onCheckedChange={(checked) =>
                      securityForm.setValue("twoFactorRequired", checked)
                    }
                  />
                </div>

                {/* Timeout de Sessão */}
                <div className="space-y-2 py-4 border-b">
                  <Label htmlFor="sessionTimeout" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timeout de Sessão (minutos)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="1440"
                    {...securityForm.register("sessionTimeout", {
                      valueAsNumber: true,
                    })}
                  />
                  <p className="text-sm text-gray-600">
                    Usuários serão desconectados após este período de
                    inatividade
                  </p>
                </div>

                {/* Políticas de Senha */}
                <div className="space-y-4 py-4">
                  <Label className="text-base flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Políticas de Senha
                  </Label>
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="passwordMinLength">
                      Tamanho mínimo da senha
                    </Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      min="6"
                      max="32"
                      {...securityForm.register("passwordMinLength", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between pl-6">
                    <Label htmlFor="passwordRequireSpecialChars">
                      Exigir caracteres especiais
                    </Label>
                    <Switch
                      id="passwordRequireSpecialChars"
                      checked={securityForm.watch(
                        "passwordRequireSpecialChars"
                      )}
                      onCheckedChange={(checked) =>
                        securityForm.setValue(
                          "passwordRequireSpecialChars",
                          checked
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving || !securityForm.formState.isDirty}
                    className="min-w-[160px]"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: NOTIFICAÇÕES */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure as preferências de notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={notificationForm.handleSubmit(
                  handleNotificationSubmit
                )}
                className="space-y-6"
              >
                {/* Notificações por Email */}
                <div className="flex items-center justify-between py-4 border-b">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications" className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Notificações por Email
                    </Label>
                    <p className="text-sm text-gray-600">
                      Receber notificações importantes por email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationForm.watch("emailNotifications")}
                    onCheckedChange={(checked) =>
                      notificationForm.setValue("emailNotifications", checked)
                    }
                  />
                </div>

                {/* Notificações do Sistema */}
                <div className="flex items-center justify-between py-4 border-b">
                  <div className="space-y-0.5">
                    <Label htmlFor="systemNotifications" className="text-base flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notificações do Sistema
                    </Label>
                    <p className="text-sm text-gray-600">
                      Mostrar notificações na interface da plataforma
                    </p>
                  </div>
                  <Switch
                    id="systemNotifications"
                    checked={notificationForm.watch("systemNotifications")}
                    onCheckedChange={(checked) =>
                      notificationForm.setValue("systemNotifications", checked)
                    }
                  />
                </div>

                {/* Alertas de Segurança */}
                <div className="flex items-center justify-between py-4 border-b">
                  <div className="space-y-0.5">
                    <Label htmlFor="securityAlerts" className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Alertas de Segurança
                    </Label>
                    <p className="text-sm text-gray-600">
                      Receber alertas sobre atividades suspeitas
                    </p>
                  </div>
                  <Switch
                    id="securityAlerts"
                    checked={notificationForm.watch("securityAlerts")}
                    onCheckedChange={(checked) =>
                      notificationForm.setValue("securityAlerts", checked)
                    }
                  />
                </div>

                {/* Relatórios Semanais */}
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="weeklyReports" className="text-base">
                      Relatórios Semanais
                    </Label>
                    <p className="text-sm text-gray-600">
                      Receber resumo semanal de atividades por email
                    </p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={notificationForm.watch("weeklyReports")}
                    onCheckedChange={(checked) =>
                      notificationForm.setValue("weeklyReports", checked)
                    }
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving || !notificationForm.formState.isDirty}
                    className="min-w-[160px]"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Preferências
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: INTEGRAÇÕES */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>
                Configure APIs e integrações externas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Key */}
              <div className="space-y-4">
                <Label className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Chave API
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={apiKey}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCopyApiKey}
                    disabled={saving}
                    className="min-w-[100px]"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleRegenerateApiKey}
                    disabled={saving}
                    className="min-w-[120px]"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Regenerando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerar
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Use esta chave para integrar aplicações externas com a API do
                  colaboraEDU
                </p>
              </div>

              <Separator />

              {/* Webhooks */}
              <div className="space-y-4">
                <Label className="text-base flex items-center gap-2">
                  <Webhook className="h-4 w-4" />
                  Webhooks
                </Label>
                <div className="space-y-2">
                  <Input 
                    placeholder="https://example.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-sm text-gray-600">
                    URL para receber notificações de eventos da plataforma
                  </p>
                </div>
                {currentSettings?.webhooks && currentSettings.webhooks.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Webhooks configurados:</Label>
                    <ul className="space-y-1">
                      {currentSettings.webhooks.map((url, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <Webhook className="h-3 w-3" />
                          {url}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddWebhook}
                  disabled={saving}
                  className="min-w-[140px]"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <Webhook className="mr-2 h-4 w-4" />
                      Adicionar Webhook
                    </>
                  )}
                </Button>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={saving}
                  className="min-w-[140px]"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Testar Conexão
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
