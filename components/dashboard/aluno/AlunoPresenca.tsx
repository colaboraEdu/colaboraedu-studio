import React, { useState, useEffect } from 'react';
import { StatCard } from '../StatCard';
import { attendanceAPI, StudentAttendanceReport, authAPI } from '../../../src/services/api';

export const AlunoPresenca: React.FC = () => {
    const [report, setReport] = useState<StudentAttendanceReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1st
        end: new Date().toISOString().split('T')[0] // Today
    });

    useEffect(() => {
        loadAttendanceReport();
    }, [dateRange]);

    const loadAttendanceReport = async () => {
        try {
            setLoading(true);
            setError(null);

            const currentUser = authAPI.getCurrentUser();
            if (!currentUser) {
                setError('Usuário não autenticado');
                return;
            }

            const data = await attendanceAPI.getStudentReport(currentUser.id, {
                start_date: dateRange.start,
                end_date: dateRange.end
            });

            setReport(data);
        } catch (err: any) {
            console.error('Erro ao carregar relatório de presença:', err);
            setError(err.message || 'Erro ao carregar relatório');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fade-in">
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                            <button 
                                onClick={loadAttendanceReport}
                                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="animate-fade-in bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <h3 className="text-sm font-medium text-gray-900">Nenhum registro de presença</h3>
                <p className="mt-1 text-sm text-gray-500">Não há registros de presença para o período selecionado.</p>
            </div>
        );
    }

    const { summary } = report;
    const frequencia = summary.attendance_rate;

    return (
        <div className="animate-fade-in space-y-6">
            {/* Date Range Filter */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data Inicial
                        </label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data Final
                        </label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total de Aulas" 
                    value={summary.total.toString()}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    color="bg-gray-500"
                />
                <StatCard 
                    title="Presenças" 
                    value={summary.present.toString()}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="bg-green-500"
                />
                <StatCard 
                    title="Faltas" 
                    value={summary.absent.toString()}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="bg-red-500"
                />
                <StatCard 
                    title="Frequência" 
                    value={`${frequencia.toFixed(1)}%`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>}
                    color={frequencia >= 75 ? "bg-blue-500" : "bg-orange-500"}
                />
            </div>

            {/* Status Alert */}
            {frequencia < 75 && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-orange-700 font-semibold">
                                ⚠️ Atenção: Sua frequência está abaixo dos 75% mínimos!
                            </p>
                            <p className="text-sm text-orange-600 mt-1">
                                Você corre o risco de reprovação por falta. Procure seu coordenador.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {frequencia >= 75 && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700 font-semibold">
                                ✅ Parabéns! Sua frequência está dentro do mínimo exigido.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Summary */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Resumo Detalhado</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded p-4">
                        <p className="text-sm text-gray-600">Faltas Justificadas</p>
                        <p className="text-2xl font-bold text-gray-800">{summary.justified_absences}</p>
                    </div>
                    <div className="bg-red-50 rounded p-4">
                        <p className="text-sm text-gray-600">Faltas Injustificadas</p>
                        <p className="text-2xl font-bold text-red-600">{summary.unjustified_absences}</p>
                    </div>
                    <div className="bg-blue-50 rounded p-4">
                        <p className="text-sm text-gray-600">Status</p>
                        <p className={`text-lg font-bold ${report.status === 'Aprovado' ? 'text-green-600' : 'text-red-600'}`}>
                            {report.status}
                        </p>
                    </div>
                    <div className="bg-purple-50 rounded p-4">
                        <p className="text-sm text-gray-600">Período</p>
                        <p className="text-sm font-medium text-gray-700">
                            {report.period.start} a {report.period.end}
                        </p>
                    </div>
                </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Frequência por Mês</h3>
                <div className="space-y-4">
                    {Object.entries(report.by_month).map(([month, monthData]) => {
                        const data = monthData as { total: number; present: number; absent: number };
                        const monthlyRate = data.total > 0 ? (data.present / data.total * 100) : 0;
                        return (
                            <div key={month} className="flex items-center">
                                <div className="w-32 text-sm text-gray-700 font-medium">
                                    {month}
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div 
                                            className={`h-4 rounded-full transition-all ${
                                                monthlyRate >= 75 ? 'bg-green-500' : 'bg-orange-500'
                                            }`}
                                            style={{ width: `${monthlyRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="w-32 text-right">
                                    <span className="text-sm font-medium text-gray-700">
                                        {data.present}/{data.total} ({monthlyRate.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};