import React, { useState, useMemo } from 'react';
import { documentos, Documento } from '../../../secretarioData';

const statusColors: Record<Documento['status'], string> = {
    Recebido: 'bg-blue-100 text-blue-800',
    'Em Análise': 'bg-yellow-100 text-yellow-800',
    Aprovado: 'bg-green-100 text-green-800',
};

export const GerenciarDocumentos: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDocumentos = useMemo(() => {
        return documentos.filter(doc =>
            doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.tipo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">Documentos Administrativos</h2>
                <div className="w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Pesquisar documento..."
                        className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Documento</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Envio</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDocumentos.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.nome}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.tipo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(doc.dataEnvio).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[doc.status]}`}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-red-600 hover:text-red-900">Ver</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredDocumentos.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Nenhum documento encontrado.
                    </div>
                )}
            </div>
        </div>
    );
};
