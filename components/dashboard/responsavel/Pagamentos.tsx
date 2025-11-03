import React from 'react';
import { pagamentos, Pagamento } from '../../../responsavelData';

const statusColors: Record<Pagamento['status'], string> = {
    Pago: 'bg-green-100 text-green-800',
    Pendente: 'bg-yellow-100 text-yellow-800',
    Atrasado: 'bg-red-100 text-red-800',
};

export const Pagamentos: React.FC = () => {
    return (
        <div className="animate-fade-in bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Situação Financeira</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referência</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor (R$)</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pagamentos.map((pagamento) => (
                            <tr key={pagamento.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pagamento.referencia}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(pagamento.vencimento).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{pagamento.valor.toFixed(2).replace('.',',')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[pagamento.status]}`}>
                                        {pagamento.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                      className="text-cyan-600 hover:text-cyan-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                      disabled={pagamento.status !== 'Pendente'}
                                    >
                                        {pagamento.status === 'Pendente' ? 'Pagar' : 'Ver Recibo'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};