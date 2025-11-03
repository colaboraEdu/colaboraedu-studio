import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { FiActivity, FiDownload, FiFilter, FiSearch } from 'react-icons/fi';
import { toast } from 'sonner';

interface AccessLog {
  id: string;
  timestamp: string;
  user: string;
  email: string;
  role: string;
  action: string;
  module: string;
  ipAddress: string;
  device: string;
  status: 'Success' | 'Failed' | 'Warning';
}

const mockLogs: AccessLog[] = [
  {
    id: '1',
    timestamp: '2025-10-29 22:45:32',
    user: 'João Silva',
    email: 'joao.silva@escola.com',
    role: 'Professor',
    action: 'Login',
    module: 'Autenticação',
    ipAddress: '192.168.10.121',
    device: 'Chrome/Windows',
    status: 'Success'
  },
  {
    id: '2',
    timestamp: '2025-10-29 22:43:15',
    user: 'Maria Santos',
    email: 'maria.santos@escola.com',
    role: 'Aluno',
    action: 'Visualizar Notas',
    module: 'Acadêmico',
    ipAddress: '192.168.10.156',
    device: 'Firefox/Linux',
    status: 'Success'
  },
  {
    id: '3',
    timestamp: '2025-10-29 22:40:08',
    user: 'Pedro Costa',
    email: 'pedro@escola.com',
    role: 'Coordenador',
    action: 'Exportar Relatório',
    module: 'Relatórios',
    ipAddress: '192.168.10.178',
    device: 'Edge/Windows',
    status: 'Success'
  },
  {
    id: '4',
    timestamp: '2025-10-29 22:38:42',
    user: 'Ana Oliveira',
    email: 'ana@escola.com',
    role: 'Secretario',
    action: 'Login',
    module: 'Autenticação',
    ipAddress: '192.168.10.145',
    device: 'Safari/MacOS',
    status: 'Failed'
  },
  {
    id: '5',
    timestamp: '2025-10-29 22:35:20',
    user: 'Carlos Mendes',
    email: 'carlos@escola.com',
    role: 'Admin',
    action: 'Alterar Configurações',
    module: 'Sistema',
    ipAddress: '192.168.10.100',
    device: 'Chrome/Windows',
    status: 'Warning'
  },
];

const statusConfig = {
  Success: { bg: 'bg-green-100', text: 'text-green-800', label: 'Sucesso' },
  Failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Falha' },
  Warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Alerta' }
};

export const AccessLogs: React.FC = () => {
  const [logs] = useState<AccessLog[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesRole = filterRole === 'all' || log.role === filterRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleExport = () => {
    toast.success('Relatório exportado com sucesso!');
    // TODO: Implementar exportação real
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterRole('all');
    setStartDate('');
    setEndDate('');
    toast.info('Filtros limpos');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-teal-500"><FiActivity size={24} /></span>
              Logs de Acesso
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Monitore todas as atividades e acessos ao sistema
            </p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-teal-500 hover:bg-teal-600 flex items-center gap-2"
          >
            <FiDownload /> Exportar Logs
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <Label htmlFor="search" className="text-xs">Pesquisar</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiSearch />
              </span>
              <Input
                id="search"
                type="text"
                placeholder="Usuário, ação, IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status" className="text-xs">Status</Label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Todos</option>
              <option value="Success">Sucesso</option>
              <option value="Failed">Falha</option>
              <option value="Warning">Alerta</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <Label htmlFor="role" className="text-xs">Perfil</Label>
            <select
              id="role"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Todos</option>
              <option value="Admin">Admin</option>
              <option value="Professor">Professor</option>
              <option value="Aluno">Aluno</option>
              <option value="Coordenador">Coordenador</option>
              <option value="Secretario">Secretário</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-2"
            >
              <FiFilter /> Limpar
            </Button>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="startDate" className="text-xs">Data Início</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="text-xs">Data Fim</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total de Acessos</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{logs.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Sucessos</div>
          <div className="text-2xl font-bold text-green-600 mt-2">
            {logs.filter(l => l.status === 'Success').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Falhas</div>
          <div className="text-2xl font-bold text-red-600 mt-2">
            {logs.filter(l => l.status === 'Failed').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Alertas</div>
          <div className="text-2xl font-bold text-yellow-600 mt-2">
            {logs.filter(l => l.status === 'Warning').length}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispositivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.user}</div>
                    <div className="text-xs text-gray-500">{log.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.module}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.device}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[log.status].bg} ${statusConfig[log.status].text}`}>
                      {statusConfig[log.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            Nenhum log encontrado com os filtros aplicados
          </div>
        )}
      </div>
    </div>
  );
};
