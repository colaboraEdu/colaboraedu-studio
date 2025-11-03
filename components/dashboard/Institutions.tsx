import React, { useState, useMemo, useEffect } from 'react';
import { institutionsAPI } from '../../src/services/api';
import type { Institution } from '../../src/services/api';
import { Modal } from '../Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
};

export const Institutions: React.FC = () => {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        cnpj: '',
        city: '',
        state: '',
        address: '',
        phone: '',
        email: '',
        responsible: '',
    });
    const itemsPerPage = 7;

    // Carregar instituições ao montar o componente
    useEffect(() => {
        loadInstitutions();
    }, []);

    const loadInstitutions = async () => {
        try {
            setLoading(true);
            const data = await institutionsAPI.list();
            setInstitutions(data);
        } catch (error: any) {
            console.error('Erro ao carregar instituições:', error);
            toast.error('Erro ao carregar instituições');
        } finally {
            setLoading(false);
        }
    };

    const filteredInstitutions = useMemo(() => {
        return institutions.filter(inst =>
            inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inst.city && inst.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (inst.cnpj && inst.cnpj.includes(searchTerm))
        );
    }, [searchTerm, institutions]);

    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredInstitutions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedItems = filteredInstitutions.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({
            name: '',
            cnpj: '',
            city: '',
            state: '',
            address: '',
            phone: '',
            email: '',
            responsible: '',
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validação básica
        if (!formData.name || !formData.cnpj || !formData.city || !formData.state) {
            toast.error('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        try {
            setLoading(true);
            
            // Criar instituição via API
            await institutionsAPI.create({
                name: formData.name,
                cnpj: formData.cnpj,
                city: formData.city,
                state: formData.state,
                address: formData.address,
                phone: formData.phone,
                email: formData.email
            });
            
            toast.success('Instituição criada com sucesso!');
            handleCloseModal();
            
            // Recarregar lista
            await loadInstitutions();
        } catch (error: any) {
            console.error('Erro ao criar instituição:', error);
            toast.error(error.message || 'Erro ao criar instituição');
        } finally {
            setLoading(false);
        }
    };

    const handleManage = (institution: Institution) => {
        setSelectedInstitution(institution);
        setFormData({
            name: institution.name,
            cnpj: institution.cnpj,
            city: institution.city,
            state: institution.state,
            address: '',
            phone: '',
            email: '',
            responsible: '',
        });
        setIsManageModalOpen(true);
    };

    const handleCloseManageModal = () => {
        setIsManageModalOpen(false);
        setSelectedInstitution(null);
        setFormData({
            name: '',
            cnpj: '',
            city: '',
            state: '',
            address: '',
            phone: '',
            email: '',
            responsible: '',
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.cnpj || !formData.city || !formData.state) {
            toast.error('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        if (!selectedInstitution) return;

        try {
            setLoading(true);
            
            // Atualizar instituição via API
            await institutionsAPI.update(selectedInstitution.id, {
                name: formData.name,
                cnpj: formData.cnpj,
                city: formData.city,
                state: formData.state,
                address: formData.address,
                phone: formData.phone,
                email: formData.email
            });
            
            toast.success('Instituição atualizada com sucesso!');
            handleCloseManageModal();
            
            // Recarregar lista
            await loadInstitutions();
        } catch (error: any) {
            console.error('Erro ao atualizar instituição:', error);
            toast.error(error.message || 'Erro ao atualizar instituição');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedInstitution) return;

        const newStatus = !selectedInstitution.is_active;
        
        try {
            setLoading(true);
            
            // Alterar status via API
            await institutionsAPI.update(selectedInstitution.id, {
                is_active: newStatus
            });
            
            toast.success(`Instituição ${newStatus ? 'ativada' : 'desativada'} com sucesso!`);
            
            // Recarregar lista
            await loadInstitutions();
        } catch (error: any) {
            console.error('Erro ao alterar status:', error);
            toast.error(error.message || 'Erro ao alterar status');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedInstitution) return;

        if (confirm(`Tem certeza que deseja excluir a instituição "${selectedInstitution.name}"? Esta ação não pode ser desfeita.`)) {
            try {
                setLoading(true);
                
                // Deletar instituição via API
                await institutionsAPI.delete(selectedInstitution.id);
                
                toast.success('Instituição excluída com sucesso!');
                handleCloseManageModal();
                
                // Recarregar lista
                await loadInstitutions();
            } catch (error: any) {
                console.error('Erro ao excluir instituição:', error);
                toast.error(error.message || 'Erro ao excluir instituição');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg animate-fade-in">
             <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">Gerenciar Instituições</h2>
                <div className="w-full md:w-auto flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button 
                        onClick={handleOpenModal}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Nova Instituição
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instituição</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedItems.map((inst) => (
                            <tr key={inst.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {inst.logo ? (
                                                <img className="h-10 w-10 rounded-full object-cover" src={inst.logo} alt={`${inst.name} logo`} />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
                                                    {inst.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{inst.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inst.cnpj}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inst.city}, {inst.state}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inst.is_active !== false ? statusColors.active : statusColors.inactive}`}>
                                        {inst.is_active !== false ? 'Ativa' : 'Inativa'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => handleManage(inst)}
                                        className="text-teal-600 hover:text-teal-900 font-medium transition-colors"
                                    >
                                        Gerenciar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredInstitutions.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Nenhuma instituição encontrada.
                    </div>
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="flex items-center justify-between py-4 px-2">
                    <div className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, filteredInstitutions.length)}</span> de <span className="font-medium">{filteredInstitutions.length}</span> resultados
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        {[...Array(totalPages).keys()].map(number => (
                            <button
                                key={number + 1}
                                onClick={() => handlePageChange(number + 1)}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === number + 1 ? 'z-10 bg-teal-50 border-teal-500 text-teal-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                {number + 1}
                            </button>
                        ))}
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            )}
            </>
            )}

            {/* Modal de Nova Instituição */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Nova Instituição</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nome da Instituição */}
                            <div className="md:col-span-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                    Nome da Instituição <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    placeholder="Ex: Escola Municipal João Silva"
                                />
                            </div>

                            {/* CNPJ */}
                            <div>
                                <Label htmlFor="cnpj" className="text-sm font-semibold text-gray-700">
                                    CNPJ <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="cnpj"
                                    name="cnpj"
                                    type="text"
                                    required
                                    value={formData.cnpj}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    placeholder="00.000.000/0000-00"
                                    maxLength={18}
                                />
                            </div>

                            {/* Telefone */}
                            <div>
                                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                                    Telefone
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            {/* Email */}
                            <div className="md:col-span-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                    E-mail
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    placeholder="contato@instituicao.edu.br"
                                />
                            </div>

                            {/* Endereço */}
                            <div className="md:col-span-2">
                                <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                                    Endereço
                                </Label>
                                <Input
                                    id="address"
                                    name="address"
                                    type="text"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    placeholder="Rua, número, bairro"
                                />
                            </div>

                            {/* Cidade */}
                            <div>
                                <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                                    Cidade <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="city"
                                    name="city"
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    placeholder="Ex: São Paulo"
                                />
                            </div>

                            {/* Estado */}
                            <div>
                                <Label htmlFor="state" className="text-sm font-semibold text-gray-700">
                                    Estado <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="state"
                                    name="state"
                                    type="text"
                                    required
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    placeholder="Ex: SP"
                                    maxLength={2}
                                />
                            </div>

                            {/* Responsável */}
                            <div className="md:col-span-2">
                                <Label htmlFor="responsible" className="text-sm font-semibold text-gray-700">
                                    Responsável
                                </Label>
                                <Input
                                    id="responsible"
                                    name="responsible"
                                    type="text"
                                    value={formData.responsible}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                    placeholder="Nome do diretor ou responsável"
                                />
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseModal}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-teal-500 hover:bg-teal-600"
                            >
                                Criar Instituição
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal de Gerenciar Instituição */}
            <Modal isOpen={isManageModalOpen} onClose={handleCloseManageModal}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Instituição</h2>
                        {selectedInstitution && (
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${selectedInstitution.is_active !== false ? statusColors.active : statusColors.inactive}`}>
                                {selectedInstitution.is_active !== false ? 'Ativa' : 'Inativa'}
                            </span>
                        )}
                    </div>
                    
                    {selectedInstitution && (
                        <>
                            {/* Info Card */}
                            <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-4 mb-6 text-white">
                                <div className="flex items-center">
                                    <img 
                                        src={selectedInstitution.logo} 
                                        alt={selectedInstitution.name}
                                        className="h-16 w-16 rounded-full bg-white p-2 mr-4"
                                    />
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedInstitution.name}</h3>
                                        <p className="text-teal-100">CNPJ: {selectedInstitution.cnpj}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="-mb-px flex space-x-8">
                                    <button className="border-b-2 border-teal-500 text-teal-600 py-4 px-1 text-sm font-medium">
                                        Informações
                                    </button>
                                </nav>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Nome da Instituição */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700">
                                            Nome da Instituição <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="edit-name"
                                            name="name"
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                        />
                                    </div>

                                    {/* CNPJ */}
                                    <div>
                                        <Label htmlFor="edit-cnpj" className="text-sm font-semibold text-gray-700">
                                            CNPJ <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="edit-cnpj"
                                            name="cnpj"
                                            type="text"
                                            required
                                            value={formData.cnpj}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                            maxLength={18}
                                        />
                                    </div>

                                    {/* Telefone */}
                                    <div>
                                        <Label htmlFor="edit-phone" className="text-sm font-semibold text-gray-700">
                                            Telefone
                                        </Label>
                                        <Input
                                            id="edit-phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="edit-email" className="text-sm font-semibold text-gray-700">
                                            E-mail
                                        </Label>
                                        <Input
                                            id="edit-email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                            placeholder="contato@instituicao.edu.br"
                                        />
                                    </div>

                                    {/* Endereço */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="edit-address" className="text-sm font-semibold text-gray-700">
                                            Endereço
                                        </Label>
                                        <Input
                                            id="edit-address"
                                            name="address"
                                            type="text"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                            placeholder="Rua, número, bairro"
                                        />
                                    </div>

                                    {/* Cidade */}
                                    <div>
                                        <Label htmlFor="edit-city" className="text-sm font-semibold text-gray-700">
                                            Cidade <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="edit-city"
                                            name="city"
                                            type="text"
                                            required
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                        />
                                    </div>

                                    {/* Estado */}
                                    <div>
                                        <Label htmlFor="edit-state" className="text-sm font-semibold text-gray-700">
                                            Estado <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="edit-state"
                                            name="state"
                                            type="text"
                                            required
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                            maxLength={2}
                                        />
                                    </div>

                                    {/* Responsável */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="edit-responsible" className="text-sm font-semibold text-gray-700">
                                            Responsável
                                        </Label>
                                        <Input
                                            id="edit-responsible"
                                            name="responsible"
                                            type="text"
                                            value={formData.responsible}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                            placeholder="Nome do diretor ou responsável"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 pt-6 border-t mt-6">
                                    <div className="flex space-x-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleToggleStatus}
                                            className={`${
                                                selectedInstitution.status === 'Ativa' 
                                                    ? 'border-red-300 text-red-600 hover:bg-red-50' 
                                                    : 'border-green-300 text-green-600 hover:bg-green-50'
                                            }`}
                                        >
                                            {selectedInstitution.status === 'Ativa' ? 'Desativar' : 'Ativar'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleDelete}
                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                            Excluir
                                        </Button>
                                    </div>
                                    <div className="flex space-x-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCloseManageModal}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-teal-500 hover:bg-teal-600"
                                        >
                                            Salvar Alterações
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};
