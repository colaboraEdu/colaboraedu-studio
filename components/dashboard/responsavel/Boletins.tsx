import React, { useState } from 'react';
import { filhos, boletins } from '../../../responsavelData';

const calcularMedia = (notas: { n1: number; n2: number; n3: number; n4: number; }) => {
    const notasValidas = Object.values(notas).filter(n => typeof n === 'number');
    if (notasValidas.length === 0) return 0;
    const soma = notasValidas.reduce((acc, curr) => acc + curr, 0);
    return (soma / notasValidas.length);
};

export const Boletins: React.FC = () => {
  const [selectedFilhoId, setSelectedFilhoId] = useState(filhos[0]?.id || 0);

  const selectedBoletim = boletins.find(b => b.filhoId === selectedFilhoId);

  return (
    <div className="animate-fade-in bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Boletins Escolares</h2>
        <div className="w-full md:w-auto">
          <label htmlFor="select-filho" className="sr-only">Selecionar Filho</label>
          <select
            id="select-filho"
            value={selectedFilhoId}
            onChange={(e) => setSelectedFilhoId(Number(e.target.value))}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
          >
            {filhos.map(filho => (
              <option key={filho.id} value={filho.id}>{filho.nome}</option>
            ))}
          </select>
        </div>
      </div>
      
      {selectedBoletim ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matéria</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">1º Bim.</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">2º Bim.</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">3º Bim.</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">4º Bim.</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Média</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedBoletim.notas.map((nota, index) => {
                const media = calcularMedia(nota);
                const isAprovado = media >= 7;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{nota.materia}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{nota.n1.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{nota.n2.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{nota.n3.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{nota.n4.toFixed(1)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-center ${isAprovado ? 'text-blue-600' : 'text-red-600'}`}>{media.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${isAprovado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isAprovado ? 'Aprovado' : 'Atenção'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
            Nenhum boletim encontrado para este aluno.
        </div>
      )}
    </div>
  );
};