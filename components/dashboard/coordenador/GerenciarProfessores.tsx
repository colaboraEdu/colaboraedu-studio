import React, { useState, useMemo, useEffect } from 'react';
import { coordenadorProfessores, Professor } from '../../../coordenadorData';

const statusColors: Record<Professor['status'], string> = {
    Ativo: 'bg-green-100 text-green-800',
    Inativo: 'bg-red-100 text-red-800',
};

export const GerenciarProfessores: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [professores, setProfessores] = useState<Professor[]>(coordenadorProfessores);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 7;

    const filteredProfessores = useMemo(() => {
        return professores.filter(prof =>
            prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prof.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prof.especialidade.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [professores, searchTerm]);
    
    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredProfessores.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const paginatedProfessores = filteredProfessores.slice(indexOfFirstUser, indexOfLastUser);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">Corpo Docente</h2>
                <div className="w-full md:w-auto flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Pesquisar professor..."
                        className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidade</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedProfessores.map((prof) => (
                            <tr key={prof.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full" src={prof.avatar} alt="" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{prof.name}</div>
                                            <div className="text-sm text-gray-500">{prof.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prof.departamento}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prof.especialidade}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[prof.status]}`}>
                                        {prof.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-orange-600 hover:text-orange-900">Detalhes</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredProfessores.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Nenhum professor encontrado.
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between py-4 px-2">
                    <div className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{indexOfFirstUser + 1}</span> a <span className="font-medium">{Math.min(indexOfLastUser, filteredProfessores.length)}</span> de <span className="font-medium">{filteredProfessores.length}</span> resultados
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
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === number + 1 ? 'z-10 bg-orange-50 border-orange-500 text-orange-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
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
        </div>
    );
};
