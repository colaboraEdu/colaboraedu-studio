import React, { useState, useCallback } from 'react';

interface UploadedFile {
    name: string;
    size: number;
    status: 'Pendente' | 'Processando' | 'Concluído' | 'Erro';
    progress: number;
}

const statusInfo = {
    Pendente: { color: 'text-gray-500', bg: 'bg-gray-100' },
    Processando: { color: 'text-blue-500', bg: 'bg-blue-100' },
    Concluído: { color: 'text-green-500', bg: 'bg-green-100' },
    Erro: { color: 'text-red-500', bg: 'bg-red-100' },
}

export const PDFProcessor: React.FC = () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileProcessing = (filesToProcess: File[]) => {
        const newFiles = filesToProcess
            .filter(file => file.type === 'application/pdf' && !files.some(f => f.name === file.name))
            .map(file => ({
                name: file.name,
                size: file.size,
                status: 'Pendente' as 'Pendente',
                progress: 0,
            }));

        if(newFiles.length === 0) return;

        setFiles(prev => [...prev, ...newFiles]);
        
        newFiles.forEach(f => processFile(f.name));
    }

    const processFile = (fileName: string) => {
        setFiles(prev => prev.map(f => f.name === fileName ? { ...f, status: 'Processando' } : f));
        
        const interval = setInterval(() => {
            setFiles(prev => prev.map(f => {
                if (f.name === fileName && f.status === 'Processando') {
                    const newProgress = f.progress + Math.floor(Math.random() * 20) + 5;
                    if (newProgress >= 100) {
                        clearInterval(interval);
                        const hasError = Math.random() > 0.85;
                        return { ...f, progress: 100, status: hasError ? 'Erro' : 'Concluído' };
                    }
                    return { ...f, progress: newProgress };
                }
                return f;
            }));
        }, 300);
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
    }

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Processador de Arquivos PDF</h2>
            
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
                    <p className="text-xs text-gray-500">Somente arquivos PDF</p>
                </label>
            </div>

            {files.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-700">Fila de Processamento</h3>
                    <ul className="mt-4 space-y-3">
                        {files.map((file, index) => (
                            <li key={index} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatBytes(file.size)} - <span className={statusInfo[file.status].color}>{file.status}</span></p>
                                </div>
                                <div className="w-1/3">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className={`h-2.5 rounded-full transition-all duration-500 ${statusInfo[file.status].bg.replace('100', '500')}`} style={{ width: `${file.progress}%` }}></div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
