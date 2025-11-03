import React, { useState, useMemo, useEffect } from 'react';
import { acervo, Livro } from '../../../bibliotecarioData';

const statusColors: Record<Livro['status'], string> = {
    Disponível: 'bg-green-100 text-green-800',
    Emprestado: 'bg-yellow-100 text-yellow-800',
};

export const GerenciarAcervo: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [livros, setLivros] = useState<Livro[]>(acervo);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const filteredLivros = useMemo(() => {
        return livros.filter(livro =>
            livro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            livro.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            livro.genero.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [livros, searchTerm]);
    
    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredLivros.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedLivros = filteredLivros.slice(indexOfFirstItem, indexOfLastItem);

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
                <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">Acervo da Biblioteca</h2>
                <div className="w-full md:w-auto flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Pesquisar no acervo..."
                        className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                     <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Adicionar Livro
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gênero</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cópias</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedLivros.map((livro) => (
                            <tr key={livro.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{livro.titulo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{livro.autor}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{livro.genero}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{livro.copiasDisponiveis}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[livro.status]}`}>
                                        {livro.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredLivros.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Nenhum livro encontrado.
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between py-4 px-2">
                    <div className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, filteredLivros.length)}</span> de <span className="font-medium">{filteredLivros.length}</span> resultados
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
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === number + 1 ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
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