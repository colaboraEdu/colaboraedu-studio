import React, { useState } from 'react';
import { FiFileText, FiDownload, FiFilter, FiCalendar, FiSearch, FiPrinter } from 'react-icons/fi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Modal } from '../Modal';
import { toast } from 'sonner';

interface Report {
  id: number;
  name: string;
  description: string;
  category: string;
  format: 'PDF' | 'Excel' | 'CSV';
  lastGenerated: string;
  size: string;
}

export const GeneralReports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Report configuration state
  const [reportConfig, setReportConfig] = useState({
    startDate: '',
    endDate: '',
    format: 'PDF',
    includeGraphs: true,
    includeDetails: true,
  });

  const reports: Report[] = [
    {
      id: 1,
      name: 'Relatório de Desempenho Acadêmico',
      description: 'Análise completa do desempenho dos alunos por disciplina e período',
      category: 'Acadêmico',
      format: 'PDF',
      lastGenerated: '2024-01-15',
      size: '2.4 MB',
    },
    {
      id: 2,
      name: 'Relatório de Frequência',
      description: 'Dados de presença e faltas por turma e aluno',
      category: 'Frequência',
      format: 'Excel',
      lastGenerated: '2024-01-14',
      size: '1.8 MB',
    },
    {
      id: 3,
      name: 'Relatório Financeiro',
      description: 'Resumo de pagamentos, inadimplências e receitas',
      category: 'Financeiro',
      format: 'PDF',
      lastGenerated: '2024-01-13',
      size: '3.2 MB',
    },
    {
      id: 4,
      name: 'Relatório de Matrículas',
      description: 'Estatísticas de matrículas, rematrículas e evasões',
      category: 'Administrativo',
      format: 'Excel',
      lastGenerated: '2024-01-12',
      size: '1.5 MB',
    },
    {
      id: 5,
      name: 'Relatório de Professores',
      description: 'Dados de corpo docente, carga horária e distribuição',
      category: 'RH',
      format: 'PDF',
      lastGenerated: '2024-01-11',
      size: '2.1 MB',
    },
    {
      id: 6,
      name: 'Relatório de Biblioteca',
      description: 'Empréstimos, devoluções e acervo disponível',
      category: 'Biblioteca',
      format: 'CSV',
      lastGenerated: '2024-01-10',
      size: '890 KB',
    },
  ];

  const categories = ['all', 'Acadêmico', 'Frequência', 'Financeiro', 'Administrativo', 'RH', 'Biblioteca'];

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGenerateReport = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleSubmitGenerate = () => {
    if (!reportConfig.startDate || !reportConfig.endDate) {
      toast.error('Por favor, selecione o período do relatório');
      return;
    }

    toast.success(`Gerando ${selectedReport?.name}...`);
    setIsModalOpen(false);
    
    // Simulate report generation
    setTimeout(() => {
      toast.success('Relatório gerado com sucesso! Download iniciado.');
    }, 2000);
  };

  const handleDownload = (report: Report) => {
    toast.success(`Baixando ${report.name}...`);
    // Implement download logic here
  };

  const handlePrint = (report: Report) => {
    toast.info(`Preparando ${report.name} para impressão...`);
    // Implement print logic here
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'PDF':
        return 'bg-red-100 text-red-700';
      case 'Excel':
        return 'bg-green-100 text-green-700';
      case 'CSV':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-teal-500"><FiFileText size={24} /></span>
              Relatórios Gerais
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Gere e baixe relatórios personalizados do sistema
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch size={18} />
            </span>
            <Input
              type="text"
              placeholder="Buscar relatórios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiFilter size={18} />
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Todas as Categorias' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <span className="text-teal-600"><FiFileText size={24} /></span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{report.name}</h3>
                  <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getFormatColor(report.format)}`}>
                    {report.format}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{report.description}</p>

            <div className="space-y-2 mb-4 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>Categoria:</span>
                <span className="font-medium text-gray-700">{report.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Última geração:</span>
                <span className="font-medium text-gray-700">{report.lastGenerated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tamanho:</span>
                <span className="font-medium text-gray-700">{report.size}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleGenerateReport(report)}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-xs"
                size="sm"
              >
                <span className="mr-1"><FiCalendar size={14} /></span>
                Gerar Novo
              </Button>
              <Button
                onClick={() => handleDownload(report)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <span><FiDownload size={14} /></span>
              </Button>
              <Button
                onClick={() => handlePrint(report)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <span><FiPrinter size={14} /></span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <span className="text-gray-400"><FiFileText size={48} /></span>
          <p className="text-gray-500 mt-4">Nenhum relatório encontrado</p>
        </div>
      )}

      {/* Generate Report Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Gerar Relatório
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {selectedReport?.name}
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Data Inicial *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={reportConfig.startDate}
                  onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data Final *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={reportConfig.endDate}
                  onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="format">Formato</Label>
              <select
                id="format"
                value={reportConfig.format}
                onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="CSV">CSV</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reportConfig.includeGraphs}
                  onChange={(e) => setReportConfig({ ...reportConfig, includeGraphs: e.target.checked })}
                  className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Incluir gráficos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reportConfig.includeDetails}
                  onChange={(e) => setReportConfig({ ...reportConfig, includeDetails: e.target.checked })}
                  className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Incluir detalhes completos</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitGenerate}
              className="flex-1 bg-teal-500 hover:bg-teal-600"
            >
              <span className="mr-2"><FiDownload size={16} /></span>
              Gerar e Baixar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
