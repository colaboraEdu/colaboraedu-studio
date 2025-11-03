import React, { useState } from 'react';
import { FiUser, FiLock, FiBell, FiShield, FiSave, FiCamera } from 'react-icons/fi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

export const MyProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'privacy'>('profile');

  const [profileData, setProfileData] = useState({
    name: 'Administrador Sistema',
    email: 'admin@colaboraedu.com',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    role: 'Administrador',
    department: 'TI',
    bio: 'Administrador do sistema ColaboraEDU',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReport: true,
    systemAlerts: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  });

  const handleSaveProfile = () => {
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Preencha todos os campos de senha');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres');
      return;
    }
    toast.success('Senha alterada com sucesso!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSaveNotifications = () => {
    toast.success('Configurações de notificação salvas!');
  };

  const handleSavePrivacy = () => {
    toast.success('Configurações de privacidade salvas!');
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: <FiUser size={18} /> },
    { id: 'security', label: 'Segurança', icon: <FiLock size={18} /> },
    { id: 'notifications', label: 'Notificações', icon: <FiBell size={18} /> },
    { id: 'privacy', label: 'Privacidade', icon: <FiShield size={18} /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-teal-500"><FiUser size={24} /></span>
          Meu Perfil
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Gerencie suas informações pessoais e configurações
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-4 sticky top-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-3xl font-bold">
                  AS
                </div>
                <button className="absolute bottom-0 right-0 bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600">
                  <FiCamera size={16} />
                </button>
              </div>
              <h3 className="font-bold text-gray-900 mt-3">{profileData.name}</h3>
              <p className="text-sm text-gray-600">{profileData.role}</p>
            </div>

            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-teal-50 text-teal-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Informações Pessoais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={profileData.cpf}
                      onChange={(e) => setProfileData({ ...profileData, cpf: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Cargo</Label>
                    <Input
                      id="role"
                      value={profileData.role}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biografia</Label>
                  <textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <Button onClick={handleSaveProfile} className="bg-teal-500 hover:bg-teal-600">
                  <span className="mr-2"><FiSave size={16} /></span>
                  Salvar Alterações
                </Button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Segurança</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Senha Atual *</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">Nova Senha *</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleChangePassword} className="bg-teal-500 hover:bg-teal-600">
                  <span className="mr-2"><FiLock size={16} /></span>
                  Alterar Senha
                </Button>

                <div className="pt-6 border-t">
                  <h4 className="font-bold text-gray-900 mb-4">Autenticação em Dois Fatores</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                  <Button variant="outline">Configurar 2FA</Button>
                </div>

                <div className="pt-6 border-t">
                  <h4 className="font-bold text-gray-900 mb-4">Sessões Ativas</h4>
                  <div className="space-y-3">
                    {[
                      { device: 'Chrome - Windows 10', location: 'São Paulo, BR', date: 'Agora' },
                      { device: 'Mobile App - Android', location: 'São Paulo, BR', date: 'Há 2 horas' },
                    ].map((session, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{session.device}</p>
                          <p className="text-xs text-gray-500">{session.location} • {session.date}</p>
                        </div>
                        <Button variant="outline" size="sm">Encerrar</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Preferências de Notificação</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Notificações por Email</p>
                      <p className="text-sm text-gray-600">Receba atualizações por email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                      className="w-5 h-5 text-teal-500 rounded focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Notificações Push</p>
                      <p className="text-sm text-gray-600">Notificações no navegador</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                      className="w-5 h-5 text-teal-500 rounded focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Notificações por SMS</p>
                      <p className="text-sm text-gray-600">Alertas importantes por SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                      className="w-5 h-5 text-teal-500 rounded focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Relatório Semanal</p>
                      <p className="text-sm text-gray-600">Resumo semanal de atividades</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyReport}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReport: e.target.checked })}
                      className="w-5 h-5 text-teal-500 rounded focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Alertas do Sistema</p>
                      <p className="text-sm text-gray-600">Notificações de manutenção e atualizações</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.systemAlerts}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, systemAlerts: e.target.checked })}
                      className="w-5 h-5 text-teal-500 rounded focus:ring-teal-500"
                    />
                  </label>
                </div>

                <Button onClick={handleSaveNotifications} className="bg-teal-500 hover:bg-teal-600">
                  <span className="mr-2"><FiSave size={16} /></span>
                  Salvar Preferências
                </Button>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Configurações de Privacidade</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Perfil Público</p>
                      <p className="text-sm text-gray-600">Permitir que outros usuários vejam seu perfil</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.showProfile}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, showProfile: e.target.checked })}
                      className="w-5 h-5 text-teal-500 rounded focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Mostrar Email</p>
                      <p className="text-sm text-gray-600">Exibir seu email no perfil público</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.showEmail}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                      className="w-5 h-5 text-teal-500 rounded focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Mostrar Telefone</p>
                      <p className="text-sm text-gray-600">Exibir seu telefone no perfil público</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.showPhone}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, showPhone: e.target.checked })}
                      className="w-5 h-5 text-teal-500 rounded focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Permitir Mensagens</p>
                      <p className="text-sm text-gray-600">Outros usuários podem enviar mensagens</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.allowMessages}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, allowMessages: e.target.checked })}
                      className="w-5 h-5 text-teal-500 rounded focus:ring-teal-500"
                    />
                  </label>
                </div>

                <Button onClick={handleSavePrivacy} className="bg-teal-500 hover:bg-teal-600">
                  <span className="mr-2"><FiSave size={16} /></span>
                  Salvar Configurações
                </Button>

                <div className="pt-6 border-t">
                  <h4 className="font-bold text-gray-900 mb-4 text-red-600">Zona de Perigo</h4>
                  <div className="space-y-3">
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <p className="font-medium text-gray-900 mb-2">Exportar Dados</p>
                      <p className="text-sm text-gray-600 mb-3">Baixe uma cópia de todos os seus dados</p>
                      <Button variant="outline" size="sm">Solicitar Exportação</Button>
                    </div>
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <p className="font-medium text-gray-900 mb-2">Desativar Conta</p>
                      <p className="text-sm text-gray-600 mb-3">Desative temporariamente sua conta</p>
                      <Button variant="outline" size="sm" className="text-red-600">Desativar</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
