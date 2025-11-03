import React, { useState } from 'react';
import { FiDownload, FiDatabase, FiCheck, FiFilter } from 'react-icons/fi';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { toast } from 'sonner';

interface DataModule {
  id: string;
  name: string;
  description: string;
  recordCount: number;
  selected: boolean;
}

export const ExportData: React.FC = () => {
  const [modules, setModules] = useState<DataModule[]>([
    { id: 'students', name: 'Alunos', description: 'Dados cadastrais completos de alunos', recordCount: 1234, selected: false },
    { id: 'teachers', name: 'Professores', description: 'Informações de docentes', recordCount: 87, selected: false },
    { id: 'classes', name: 'Turmas', description: 'Dados de turmas e disciplinas', recordCount: 45, selected: false },
    { id: 'grades', name: 'Notas', description: 'Histórico de notas e avaliações', recordCount: 8920, selected: false },
    { id: 'attendance', name: 'Frequência', description: 'Registros de presença', recordCount: 15450, selected: false },
    { id: 'enrollment', name: 'Matrículas', description: 'Dados de matrículas ativas e inativas', recordCount: 1450, selected: false },
    { id: 'financial', name: 'Financeiro', description: 'Pagamentos e inadimplências', recordCount: 3200, selected: false },
    { id: 'library', name: 'Biblioteca', description: 'Empréstimos e acervo', recordCount: 560, selected: false },
  ]);

  const [exportConfig, setExportConfig] = useState({
    format: 'Excel',
    includeArchived: false,
    startDate: '',
    endDate: '',
    compress: false,
  });

  const toggleModule = (id: string) => {
    setModules(modules.map(m => 
      m.id === id ? { ...m, selected: !m.selected } : m
    ));
  };

  const selectAll = () => {
    setModules(modules.map(m => ({ ...m, selected: true })));
  };

  const deselectAll = () => {
    setModules(modules.map(m => ({ ...m, selected: false })));
  };

  const handleExport = () => {
    const selectedModules = modules.filter(m => m.selected);
    
    if (selectedModules.length === 0) {
      toast.error('Selecione pelo menos um módulo para exportar');
      return;
    }

    const totalRecords = selectedModules.reduce((sum, m) => sum + m.recordCount, 0);
    
    toast.success(`Exportando ${totalRecords.toLocaleString()} registros em formato ${exportConfig.format}...`);
    
    // Simulate export process
    setTimeout(() => {
      toast.success('Exportação concluída! Download iniciado.');
    }, 2000);
  };

  const selectedCount = modules.filter(m => m.selected).length;
  const totalRecords = modules.filter(m => m.selected).reduce((sum, m) => sum + m.recordCount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-teal-500"><FiDatabase size={24} /></span>
              Exportar Dados
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Exporte dados do sistema em diversos formatos
            </p>
          </div>
          
          {selectedCount > 0 && (
            <div className="bg-teal-50 px-4 py-2 rounded-lg">
              <p className="text-sm font-semibold text-teal-700">
                {selectedCount} módulo(s) selecionado(s)
              </p>
              <p className="text-xs text-teal-600">
                {totalRecords.toLocaleString()} registros totais
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Selecione os Módulos</h3>
              <div className="flex gap-2">
                <Button onClick={selectAll} variant="outline" size="sm">
                  Selecionar Todos
                </Button>
                <Button onClick={deselectAll} variant="outline" size="sm">
                  Limpar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  onClick={() => toggleModule(module.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    module.selected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      module.selected
                        ? 'bg-teal-500 border-teal-500'
                        : 'border-gray-300'
                    }`}>
                      {module.selected && <span className="text-white"><FiCheck size={14} /></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">{module.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{module.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {module.recordCount.toLocaleString()} registros
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Configuration */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Configurações</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="format">Formato de Exportação</Label>
                <select
                  id="format"
                  value={exportConfig.format}
                  onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mt-1"
                >
                  <option value="Excel">Excel (.xlsx)</option>
                  <option value="CSV">CSV (.csv)</option>
                  <option value="JSON">JSON (.json)</option>
                  <option value="XML">XML (.xml)</option>
                </select>
              </div>

              <div className="pt-4 border-t">
                <Label className="mb-3 block">Filtros de Data</Label>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="startDate" className="text-xs">Data Inicial</Label>
                    <input
                      id="startDate"
                      type="date"
                      value={exportConfig.startDate}
                      onChange={(e) => setExportConfig({ ...exportConfig, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-xs">Data Final</Label>
                    <input
                      id="endDate"
                      type="date"
                      value={exportConfig.endDate}
                      onChange={(e) => setExportConfig({ ...exportConfig, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <Label>Opções Adicionais</Label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeArchived}
                    onChange={(e) => setExportConfig({ ...exportConfig, includeArchived: e.target.checked })}
                    className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Incluir registros arquivados</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportConfig.compress}
                    onChange={(e) => setExportConfig({ ...exportConfig, compress: e.target.checked })}
                    className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Compactar arquivo (.zip)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-lg shadow-lg text-white">
            <h4 className="font-bold mb-4">Resumo da Exportação</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-90">Módulos:</span>
                <span className="font-semibold">{selectedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Registros:</span>
                <span className="font-semibold">{totalRecords.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Formato:</span>
                <span className="font-semibold">{exportConfig.format}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Tamanho estimado:</span>
                <span className="font-semibold">
                  {exportConfig.compress 
                    ? `~${Math.ceil(totalRecords * 0.05)} MB (compactado)`
                    : `~${Math.ceil(totalRecords * 0.1)} MB`
                  }
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={selectedCount === 0}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300"
          >
            <span className="mr-2"><FiDownload size={18} /></span>
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* Quick Export Presets */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Exportações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: 'Backup Completo', modules: ['students', 'teachers', 'classes', 'grades', 'attendance', 'enrollment', 'financial', 'library'] },
            { name: 'Dados Acadêmicos', modules: ['students', 'classes', 'grades', 'attendance'] },
            { name: 'Dados Financeiros', modules: ['students', 'enrollment', 'financial'] },
            { name: 'Dados RH', modules: ['teachers'] },
          ].map((preset, idx) => (
            <Button
              key={idx}
              variant="outline"
              onClick={() => {
                setModules(modules.map(m => ({
                  ...m,
                  selected: preset.modules.includes(m.id)
                })));
                toast.success(`Preset "${preset.name}" aplicado`);
              }}
              className="h-auto py-3 flex flex-col items-start"
            >
              <span className="font-semibold text-sm">{preset.name}</span>
              <span className="text-xs text-gray-500 mt-1">{preset.modules.length} módulos</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
