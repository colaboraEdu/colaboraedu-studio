import React, { useState } from 'react';
import { FiTrendingUp, FiUsers, FiBookOpen, FiAward, FiBarChart2, FiPieChart } from 'react-icons/fi';
import { Button } from '../ui/button';

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export const Statistics: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const stats: StatCard[] = [
    {
      title: 'Total de Alunos',
      value: '1,234',
      change: 12.5,
      icon: <FiUsers size={24} />,
      color: 'blue'
    },
    {
      title: 'Taxa de Aprovação',
      value: '94.2%',
      change: 5.3,
      icon: <FiAward size={24} />,
      color: 'green'
    },
    {
      title: 'Frequência Média',
      value: '88.7%',
      change: -2.1,
      icon: <FiBookOpen size={24} />,
      color: 'purple'
    },
    {
      title: 'Média Geral',
      value: '7.8',
      change: 3.2,
      icon: <FiTrendingUp size={24} />,
      color: 'orange'
    },
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-teal-500"><FiBarChart2 size={24} /></span>
              Estatísticas e Indicadores
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Visualize métricas e indicadores de desempenho
            </p>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            <Button
              variant={period === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('week')}
            >
              Semana
            </Button>
            <Button
              variant={period === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('month')}
              className={period === 'month' ? 'bg-teal-500 hover:bg-teal-600' : ''}
            >
              Mês
            </Button>
            <Button
              variant={period === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('year')}
            >
              Ano
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className={`bg-gradient-to-r ${colorClasses[stat.color as keyof typeof colorClasses]} p-4`}>
              <div className="flex items-center justify-between text-white">
                <div className="flex-1">
                  <p className="text-sm opacity-90">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="opacity-80">{stat.icon}</div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                </span>
                <span className="text-sm text-gray-500">vs. período anterior</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 - Desempenho por Disciplina */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-blue-500"><FiPieChart size={20} /></span>
            Desempenho por Disciplina
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Matemática', value: 85, color: 'bg-blue-500' },
              { name: 'Português', value: 78, color: 'bg-green-500' },
              { name: 'História', value: 92, color: 'bg-purple-500' },
              { name: 'Geografia', value: 88, color: 'bg-orange-500' },
              { name: 'Ciências', value: 81, color: 'bg-pink-500' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2 - Frequência por Turno */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-purple-500"><FiBarChart2 size={20} /></span>
            Frequência por Turno
          </h3>
          <div className="flex items-end justify-between h-48 gap-4">
            {[
              { name: 'Matutino', value: 92, color: 'bg-blue-500' },
              { name: 'Vespertino', value: 88, color: 'bg-green-500' },
              { name: 'Noturno', value: 85, color: 'bg-purple-500' },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center">
                  <span className="text-sm font-semibold text-gray-900 mb-2">{item.value}%</span>
                  <div
                    className={`w-full ${item.color} rounded-t-lg transition-all`}
                    style={{ height: `${item.value * 2}px` }}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3 - Evolução Mensal */}
        <div className="bg-white p-6 rounded-lg shadow-lg lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-green-500"><FiTrendingUp size={20} /></span>
            Evolução Mensal de Alunos
          </h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {[
              { month: 'Jan', value: 980 },
              { month: 'Fev', value: 1020 },
              { month: 'Mar', value: 1080 },
              { month: 'Abr', value: 1120 },
              { month: 'Mai', value: 1150 },
              { month: 'Jun', value: 1180 },
              { month: 'Jul', value: 1200 },
              { month: 'Ago', value: 1220 },
              { month: 'Set', value: 1210 },
              { month: 'Out', value: 1234 },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs font-semibold text-gray-700 mb-1">{item.value}</span>
                  <div
                    className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg transition-all hover:from-teal-600 hover:to-teal-500"
                    style={{ height: `${(item.value / 1234) * 160}px` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-1">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h4 className="text-sm font-semibold text-gray-600 mb-4">Top 5 Melhores Turmas</h4>
          <div className="space-y-3">
            {[
              { name: '3º Ano A', avg: 9.2 },
              { name: '2º Ano B', avg: 8.8 },
              { name: '1º Ano C', avg: 8.5 },
              { name: '3º Ano B', avg: 8.3 },
              { name: '2º Ano A', avg: 8.1 },
            ].map((turma, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-gray-700">{turma.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{turma.avg}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h4 className="text-sm font-semibold text-gray-600 mb-4">Alunos por Série</h4>
          <div className="space-y-3">
            {[
              { serie: '1º Ano', count: 320 },
              { serie: '2º Ano', count: 298 },
              { serie: '3º Ano', count: 285 },
              { serie: '4º Ano', count: 331 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.serie}</span>
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h4 className="text-sm font-semibold text-gray-600 mb-4">Indicadores de Qualidade</h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Satisfação Geral</span>
                <span className="text-xs font-bold text-green-600">4.5/5.0</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Índice de Evasão</span>
                <span className="text-xs font-bold text-red-600">2.3%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '2.3%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Engajamento</span>
                <span className="text-xs font-bold text-blue-600">87%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
