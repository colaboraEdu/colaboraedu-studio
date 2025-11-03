import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Modal } from '../Modal';
import { toast } from 'sonner';
import { FiShield, FiEdit2, FiTrash2, FiPlus, FiCheck, FiX } from 'react-icons/fi';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  actions: string[];
  roles: string[];
  status: 'Ativa' | 'Inativa';
}

const mockPermissions: Permission[] = [
  {
    id: '1',
    name: 'Gerenciar Usuários',
    description: 'Criar, editar e excluir usuários do sistema',
    module: 'Usuários',
    actions: ['create', 'read', 'update', 'delete'],
    roles: ['admin', 'coordenador'],
    status: 'Ativa'
  },
  {
    id: '2',
    name: 'Visualizar Relatórios',
    description: 'Acessar e exportar relatórios gerenciais',
    module: 'Relatórios',
    actions: ['read', 'export'],
    roles: ['admin', 'coordenador', 'secretario'],
    status: 'Ativa'
  },
  {
    id: '3',
    name: 'Gerenciar Notas',
    description: 'Lançar e editar notas dos alunos',
    module: 'Acadêmico',
    actions: ['create', 'update'],
    roles: ['professor', 'coordenador'],
    status: 'Ativa'
  },
  {
    id: '4',
    name: 'Configurações do Sistema',
    description: 'Alterar configurações globais do sistema',
    module: 'Sistema',
    actions: ['read', 'update'],
    roles: ['admin'],
    status: 'Ativa'
  },
];

const modules = ['Usuários', 'Acadêmico', 'Financeiro', 'Relatórios', 'Sistema', 'Comunicação'];
const allRoles = ['admin', 'coordenador', 'professor', 'secretario', 'aluno', 'responsavel'];
const allActions = ['create', 'read', 'update', 'delete', 'export'];

export const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    module: '',
    actions: [] as string[],
    roles: [] as string[],
  });

  const filteredPermissions = permissions.filter(perm =>
    perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perm.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perm.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (permission?: Permission) => {
    if (permission) {
      setEditingPermission(permission);
      setFormData({
        name: permission.name,
        description: permission.description,
        module: permission.module,
        actions: permission.actions,
        roles: permission.roles,
      });
    } else {
      setEditingPermission(null);
      setFormData({
        name: '',
        description: '',
        module: '',
        actions: [],
        roles: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPermission(null);
    setFormData({
      name: '',
      description: '',
      module: '',
      actions: [],
      roles: [],
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleAction = (action: string) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter(a => a !== action)
        : [...prev.actions, action]
    }));
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.module || formData.actions.length === 0 || formData.roles.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingPermission) {
      setPermissions(prev => prev.map(p =>
        p.id === editingPermission.id
          ? { ...p, ...formData }
          : p
      ));
      toast.success('Permissão atualizada com sucesso!');
    } else {
      const newPermission: Permission = {
        id: String(Date.now()),
        ...formData,
        status: 'Ativa'
      };
      setPermissions(prev => [...prev, newPermission]);
      toast.success('Permissão criada com sucesso!');
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta permissão?')) {
      setPermissions(prev => prev.filter(p => p.id !== id));
      toast.success('Permissão excluída com sucesso!');
    }
  };

  const toggleStatus = (id: string) => {
    setPermissions(prev => prev.map(p =>
      p.id === id
        ? { ...p, status: p.status === 'Ativa' ? 'Inativa' : 'Ativa' }
        : p
    ));
    toast.success('Status atualizado!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-teal-500"><FiShield size={24} /></span>
              Gerenciamento de Permissões
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure as permissões de acesso por perfil de usuário
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-teal-500 hover:bg-teal-600 flex items-center gap-2"
          >
            <FiPlus /> Nova Permissão
          </Button>
        </div>

        {/* Search */}
        <div className="mt-6">
          <Input
            type="text"
            placeholder="Pesquisar por nome, módulo ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPermissions.map((permission) => (
          <div
            key={permission.id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{permission.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      permission.status === 'Ativa'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {permission.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{permission.description}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500">Módulo:</span>
                <p className="text-sm text-gray-900 mt-1">{permission.module}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500">Ações Permitidas:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {permission.actions.map(action => (
                    <span
                      key={action}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500">Perfis com Acesso:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {permission.roles.map(role => (
                    <span
                      key={role}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded capitalize"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleStatus(permission.id)}
                className="flex items-center gap-1"
              >
                {permission.status === 'Ativa' ? <FiX /> : <FiCheck />}
                {permission.status === 'Ativa' ? 'Desativar' : 'Ativar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenModal(permission)}
                className="flex items-center gap-1"
              >
                <FiEdit2 /> Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(permission.id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <FiTrash2 /> Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredPermissions.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <div className="text-gray-400 text-5xl mb-4 flex justify-center">
            <FiShield size={48} />
          </div>
          <p className="text-gray-500">Nenhuma permissão encontrada</p>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingPermission ? 'Editar Permissão' : 'Nova Permissão'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome da Permissão <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Gerenciar Usuários"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
                placeholder="Descreva o que esta permissão permite fazer"
              />
            </div>

            {/* Módulo */}
            <div>
              <Label htmlFor="module">Módulo <span className="text-red-500">*</span></Label>
              <select
                id="module"
                name="module"
                value={formData.module}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Selecione um módulo</option>
                {modules.map(mod => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
            </div>

            {/* Ações */}
            <div>
              <Label>Ações Permitidas <span className="text-red-500">*</span></Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {allActions.map(action => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => toggleAction(action)}
                    className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                      formData.actions.includes(action)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Perfis */}
            <div>
              <Label>Perfis com Acesso <span className="text-red-500">*</span></Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {allRoles.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-1 text-sm rounded-md border capitalize transition-colors ${
                      formData.roles.includes(role)
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                {editingPermission ? 'Atualizar' : 'Criar'} Permissão
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
