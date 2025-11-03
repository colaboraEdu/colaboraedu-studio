import React, { useState } from 'react';

type Tab = 'general' | 'appearance' | 'security';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            isActive 
            ? 'bg-teal-500 text-white' 
            : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        {label}
    </button>
);

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; setEnabled: (enabled: boolean) => void }> = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                enabled ? 'bg-teal-500' : 'bg-gray-300'
            }`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    </div>
);

export const SystemSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    const renderTabContent = () => {
        switch(activeTab) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="platform-name" className="block text-sm font-medium text-gray-700">Nome da Plataforma</label>
                            <input type="text" id="platform-name" defaultValue="colaboraEDU" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="platform-email" className="block text-sm font-medium text-gray-700">Email de Contato Principal</label>
                            <input type="email" id="platform-email" defaultValue="contato@colaboraedu.com" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                        </div>
                    </div>
                );
            case 'appearance':
                return (
                     <div className="space-y-6">
                        <div>
                            <label htmlFor="platform-logo" className="block text-sm font-medium text-gray-700">Logo da Plataforma</label>
                            <div className="mt-1 flex items-center">
                                <span className="inline-block h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                                   <svg width="48" height="48" viewBox="0 0 100 100"><path d="M0 20 L40 20 L40 0 L60 0 L60 60 L100 60 L100 80 L0 80 Z" fill="#3B82F6" /><path d="M40 40 L40 60 L20 60 L20 40 Z" fill="#10B981" /></svg>
                                </span>
                                <button type="button" className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">Alterar</button>
                            </div>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6">
                        <ToggleSwitch label="Ativar Modo de Manutenção" enabled={maintenanceMode} setEnabled={setMaintenanceMode} />
                        <p className="text-xs text-gray-500">Quando ativado, apenas administradores poderão acessar a plataforma.</p>
                        <hr />
                        <ToggleSwitch label="Exigir autenticação de dois fatores (2FA)" enabled={true} setEnabled={() => {}} />
                        <p className="text-xs text-gray-500">Requer que todos os usuários configurem a autenticação de dois fatores para maior segurança.</p>
                    </div>
                );
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Configurações do Sistema</h2>
            
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-2" aria-label="Tabs">
                    <TabButton label="Geral" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                    <TabButton label="Aparência" isActive={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} />
                    <TabButton label="Segurança" isActive={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                </nav>
            </div>

            <div className="max-w-2xl">
                {renderTabContent()}
            </div>

            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
                <button type="button" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                    Cancelar
                </button>
                <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                    Salvar Alterações
                </button>
            </div>
        </div>
    );
};
