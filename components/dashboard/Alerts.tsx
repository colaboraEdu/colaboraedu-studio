import React, { useState } from 'react';
import { FiBell, FiAlertTriangle, FiCheckCircle, FiInfo, FiXCircle, FiTrash2, FiEye } from 'react-icons/fi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';

interface Alert {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  read: boolean;
  source: string;
}

export const Alerts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      title: 'Sistema Atualizado',
      message: 'O sistema foi atualizado para a versão 2.5.0 com novas funcionalidades',
      type: 'success',
      priority: 'low',
      timestamp: '2024-01-15 14:30',
      read: false,
      source: 'Sistema',
    },
    {
      id: 2,
      title: 'Backup Pendente',
      message: 'Atenção: O backup automático está atrasado. Execute um backup manual.',
      type: 'warning',
      priority: 'high',
      timestamp: '2024-01-15 12:00',
      read: false,
      source: 'Backup',
    },
    {
      id: 3,
      title: 'Erro de Conexão',
      message: 'Falha ao conectar com o servidor de email. Verifique as configurações.',
      type: 'error',
      priority: 'high',
      timestamp: '2024-01-15 10:15',
      read: false,
      source: 'Email',
    },
    {
      id: 4,
      title: 'Nova Matrícula',
      message: '15 novos alunos foram matriculados hoje',
      type: 'info',
      priority: 'medium',
      timestamp: '2024-01-15 09:00',
      read: true,
      source: 'Matrículas',
    },
    {
      id: 5,
      title: 'Limite de Armazenamento',
      message: 'Você está usando 85% do espaço de armazenamento disponível',
      type: 'warning',
      priority: 'medium',
      timestamp: '2024-01-14 16:45',
      read: true,
      source: 'Sistema',
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle size={20} />;
      case 'warning':
        return <FiAlertTriangle size={20} />;
      case 'error':
        return <FiXCircle size={20} />;
      default:
        return <FiInfo size={20} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'unread' && !alert.read) ||
                       (filterRead === 'read' && alert.read);
    return matchesSearch && matchesType && matchesRead;
  });

  const markAsRead = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
    toast.success('Alerta marcado como lido');
  };

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast.success('Alerta removido');
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })));
    toast.success('Todos os alertas marcados como lidos');
  };

  const clearAll = () => {
    if (window.confirm('Deseja realmente remover todos os alertas?')) {
      setAlerts([]);
      toast.success('Todos os alertas foram removidos');
    }
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-teal-500"><FiBell size={24} /></span>
              Alertas e Notificações
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie alertas e notificações do sistema
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              Marcar Todas como Lidas
            </Button>
            <Button onClick={clearAll} variant="outline" size="sm" className="text-red-600">
              <span className="mr-1"><FiTrash2 size={14} /></span>
              Limpar Tudo
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Input
            type="text"
            placeholder="Buscar alertas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="success">Sucesso</option>
            <option value="info">Informação</option>
            <option value="warning">Aviso</option>
            <option value="error">Erro</option>
          </select>
          
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Todos os Status</option>
            <option value="unread">Não Lidas</option>
            <option value="read">Lidas</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: alerts.length, color: 'blue' },
          { label: 'Não Lidas', value: unreadCount, color: 'red' },
          { label: 'Prioridade Alta', value: alerts.filter(a => a.priority === 'high').length, color: 'orange' },
          { label: 'Lidas Hoje', value: alerts.filter(a => a.read && a.timestamp.includes('2024-01-15')).length, color: 'green' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color}-600 mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <span className="text-gray-400"><FiBell size={48} /></span>
            <p className="text-gray-500 mt-4">Nenhum alerta encontrado</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-lg shadow-lg p-5 border-l-4 transition-all hover:shadow-xl ${
                !alert.read ? 'border-l-teal-500 bg-teal-50' : 'border-l-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${getTypeColor(alert.type)} border`}>
                    <span>{getTypeIcon(alert.type)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{alert.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(alert.priority)}`}>
                        {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                      {!alert.read && (
                        <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                          Nova
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{alert.timestamp}</span>
                      <span>•</span>
                      <span>{alert.source}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!alert.read && (
                    <Button
                      onClick={() => markAsRead(alert.id)}
                      variant="outline"
                      size="sm"
                      title="Marcar como lida"
                    >
                      <span><FiEye size={16} /></span>
                    </Button>
                  )}
                  <Button
                    onClick={() => deleteAlert(alert.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    title="Remover"
                  >
                    <span><FiTrash2 size={16} /></span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
