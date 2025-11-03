import React, { useState, useCallback, useEffect } from 'react';

const API_BASE_URL = 'http://192.168.10.178:8004/api/v1';

interface ExtractedData {
    student: {
        full_name: string;
        enrollment_number?: string;
        class_name?: string;
        academic_year: number;
    };
    grades: Array<{
        subject_name: string;
        grade_1?: number;
        grade_2?: number;
        grade_3?: number;
        grade_4?: number;
        average?: number;
        status?: string;
    }>;
    attendance?: {
        total_days: number;
        present_days: number;
        percentage: number;
    };
    confidence_score: number;
}

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    extractedData?: ExtractedData;
    errorMessage?: string;
}

const statusInfo = {
    pending: { label: 'Pendente', color: 'text-gray-500', bg: 'bg-gray-100', bgBar: 'bg-gray-500' },
    processing: { label: 'Processando', color: 'text-blue-500', bg: 'bg-blue-100', bgBar: 'bg-blue-500' },
    completed: { label: 'Concluído', color: 'text-green-500', bg: 'bg-green-100', bgBar: 'bg-green-500' },
    failed: { label: 'Erro', color: 'text-red-500', bg: 'bg-red-100', bgBar: 'bg-red-500' },
}

export const PDFProcessor: React.FC = () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    // Buscar lista de processamentos ao montar
    useEffect(() => {
        loadExistingJobs();
    }, []);

    const getAuthToken = (): string | null => {
        return localStorage.getItem('access_token') || localStorage.getItem('auth_token');
    };

    const loadExistingJobs = async () => {
        const token = getAuthToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/pdf/list?limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const jobs = await response.json();
                setFiles(jobs.map((job: any) => ({
                    id: job.id,
                    name: job.filename,
                    size: 0, // Não disponível na listagem
                    status: job.status,
                    progress: job.progress,
                    extractedData: job.extracted_data,
                    errorMessage: job.error_message
                })));
            }
        } catch (error) {
            console.error('Erro ao carregar jobs:', error);
        }
    };

    const handleFileProcessing = async (filesToProcess: File[]) => {
        const pdfFiles = filesToProcess.filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length === 0) {
            alert('Por favor, selecione apenas arquivos PDF');
            return;
        }

        for (const file of pdfFiles) {
            await uploadFile(file);
        }
    };

    const uploadFile = async (file: File) => {
        const token = getAuthToken();
        if (!token) {
            alert('Você precisa estar autenticado para fazer upload');
            return;
        }

        // Adicionar arquivo à lista com status pending
        const tempId = `temp-${Date.now()}`;
        const newFile: UploadedFile = {
            id: tempId,
            name: file.name,
            size: file.size,
            status: 'pending',
            progress: 0
        };
        setFiles(prev => [...prev, newFile]);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/pdf/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Erro no upload');
            }

            const result = await response.json();
            
            // Atualizar com ID real do servidor
            setFiles(prev => prev.map(f => 
                f.id === tempId ? { ...f, id: result.id, status: result.status } : f
            ));

            // Iniciar polling do status
            pollJobStatus(result.id);

        } catch (error) {
            console.error('Erro no upload:', error);
            setFiles(prev => prev.map(f => 
                f.id === tempId ? { ...f, status: 'failed', errorMessage: 'Erro no upload' } : f
            ));
        }
    };

    const pollJobStatus = async (jobId: string) => {
        const token = getAuthToken();
        if (!token) return;

        const maxAttempts = 60; // 60 tentativas = 2 minutos
        let attempts = 0;

        const poll = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/pdf/status/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Erro ao consultar status');
                }

                const status = await response.json();

                setFiles(prev => prev.map(f => 
                    f.id === jobId ? {
                        ...f,
                        status: status.status,
                        progress: status.progress,
                        extractedData: status.extracted_data,
                        errorMessage: status.error_message
                    } : f
                ));

                // Continuar polling se ainda estiver processando
                if (status.status === 'processing' || status.status === 'pending') {
                    attempts++;
                    if (attempts < maxAttempts) {
                        setTimeout(poll, 2000); // Poll a cada 2 segundos
                    }
                }

            } catch (error) {
                console.error('Erro no polling:', error);
            }
        };

        poll();
    };

    const handleValidateAndSave = async (file: UploadedFile) => {
        if (!file.extractedData) return;

        const token = getAuthToken();
        if (!token) {
            alert('Você precisa estar autenticado');
            return;
        }

        setIsValidating(true);

        try {
            const response = await fetch(`${API_BASE_URL}/pdf/validate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    extraction_id: file.id,
                    validated_data: file.extractedData,
                    corrections: {},
                    approve: true
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao validar dados');
            }

            const result = await response.json();
            alert(`Sucesso! ${result.students_created} alunos, ${result.grades_created} notas, ${result.attendance_created} frequências criadas`);
            setSelectedFile(null);

        } catch (error) {
            console.error('Erro na validação:', error);
            alert('Erro ao salvar dados no banco');
        } finally {
            setIsValidating(false);
        }
    };

    const handleDragEvents = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.type === "dragenter" || event.type === "dragover") {
            setIsDragging(true);
        } else if (event.type === "dragleave") {
            setIsDragging(false);
        }
    };
    
    const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        handleFileProcessing(Array.from(event.dataTransfer.files));
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            handleFileProcessing(Array.from(event.target.files));
        }
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Processador de Boletins PDF</h2>
                <button
                    onClick={loadExistingJobs}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    🔄 Atualizar
                </button>
            </div>
            
            <div 
                onDragEnter={handleDragEvents}
                onDragOver={handleDragEvents}
                onDragLeave={handleDragEvents}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-300 ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300 bg-gray-50'}`}
            >
                <input type="file" id="file-upload" className="hidden" accept=".pdf" multiple onChange={handleFileSelect}/>
                <label htmlFor="file-upload" className="cursor-pointer">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold text-teal-600">Clique para enviar</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-gray-500">Boletins escolares em PDF (máx. 50MB)</p>
                </label>
            </div>

            {files.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Fila de Processamento</h3>
                    <ul className="space-y-3">
                        {files.map((file) => (
                            <li key={file.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {file.size > 0 && `${formatBytes(file.size)} • `}
                                            <span className={statusInfo[file.status].color}>
                                                {statusInfo[file.status].label}
                                            </span>
                                            {file.extractedData && (
                                                <span className="ml-2">
                                                    • Confiança: {(file.extractedData.confidence_score * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    {file.status === 'completed' && file.extractedData && (
                                        <button
                                            onClick={() => setSelectedFile(file)}
                                            className="ml-4 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                                        >
                                            📋 Ver Dados
                                        </button>
                                    )}
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                    <div 
                                        className={`h-2.5 rounded-full transition-all duration-500 ${statusInfo[file.status].bgBar}`}
                                        style={{ width: `${file.progress}%` }}
                                    ></div>
                                </div>

                                {/* Error Message */}
                                {file.errorMessage && (
                                    <p className="mt-2 text-xs text-red-600">⚠️ {file.errorMessage}</p>
                                )}

                                {/* Quick Preview */}
                                {file.extractedData && file.status === 'completed' && (
                                    <div className="mt-3 p-3 bg-white rounded border border-gray-200 text-xs">
                                        <p><strong>Aluno:</strong> {file.extractedData.student.full_name}</p>
                                        <p><strong>Turma:</strong> {file.extractedData.student.class_name || 'N/A'}</p>
                                        <p><strong>Disciplinas:</strong> {file.extractedData.grades.length}</p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Modal de Validação */}
            {selectedFile && selectedFile.extractedData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-gray-800">Dados Extraídos</h3>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Informações do Aluno */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-3">📚 Informações do Aluno</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Nome:</span>
                                        <p className="font-medium">{selectedFile.extractedData.student.full_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Matrícula:</span>
                                        <p className="font-medium">{selectedFile.extractedData.student.enrollment_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Turma:</span>
                                        <p className="font-medium">{selectedFile.extractedData.student.class_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Ano Letivo:</span>
                                        <p className="font-medium">{selectedFile.extractedData.student.academic_year}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Notas */}
                            {selectedFile.extractedData.grades.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-3">📊 Notas por Disciplina</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Disciplina</th>
                                                    <th className="px-4 py-2 text-center">1º Bim</th>
                                                    <th className="px-4 py-2 text-center">2º Bim</th>
                                                    <th className="px-4 py-2 text-center">3º Bim</th>
                                                    <th className="px-4 py-2 text-center">4º Bim</th>
                                                    <th className="px-4 py-2 text-center">Média</th>
                                                    <th className="px-4 py-2 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedFile.extractedData.grades.map((grade, idx) => (
                                                    <tr key={idx} className="border-b border-gray-200">
                                                        <td className="px-4 py-2 font-medium">{grade.subject_name}</td>
                                                        <td className="px-4 py-2 text-center">{grade.grade_1?.toFixed(1) || '-'}</td>
                                                        <td className="px-4 py-2 text-center">{grade.grade_2?.toFixed(1) || '-'}</td>
                                                        <td className="px-4 py-2 text-center">{grade.grade_3?.toFixed(1) || '-'}</td>
                                                        <td className="px-4 py-2 text-center">{grade.grade_4?.toFixed(1) || '-'}</td>
                                                        <td className="px-4 py-2 text-center font-semibold">{grade.average?.toFixed(1) || '-'}</td>
                                                        <td className="px-4 py-2 text-center">
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                grade.status === 'Aprovado' ? 'bg-green-100 text-green-800' :
                                                                grade.status === 'Reprovado' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {grade.status || 'N/A'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Frequência */}
                            {selectedFile.extractedData.attendance && (
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-green-900 mb-3">✅ Frequência</h4>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600">Total de Dias:</span>
                                            <p className="font-medium">{selectedFile.extractedData.attendance.total_days}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Dias Presentes:</span>
                                            <p className="font-medium">{selectedFile.extractedData.attendance.present_days}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Percentual:</span>
                                            <p className="font-medium">{selectedFile.extractedData.attendance.percentage.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Confiança */}
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-purple-900 mb-2">🎯 Confiança da Extração</h4>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-purple-600 h-3 rounded-full transition-all"
                                            style={{ width: `${selectedFile.extractedData.confidence_score * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-semibold text-purple-900">
                                        {(selectedFile.extractedData.confidence_score * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    {selectedFile.extractedData.confidence_score >= 0.9 ? '✅ Alta confiança - dados prontos para salvar' :
                                     selectedFile.extractedData.confidence_score >= 0.7 ? '⚠️ Confiança moderada - revise os dados' :
                                     '❌ Baixa confiança - revise cuidadosamente'}
                                </p>
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                disabled={isValidating}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleValidateAndSave(selectedFile)}
                                disabled={isValidating}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isValidating ? '⏳ Salvando...' : '💾 Salvar no Banco de Dados'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
