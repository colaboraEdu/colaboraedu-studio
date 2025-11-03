import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between transition-transform transform hover:-translate-y-1">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
                {icon}
            </div>
        </div>
    );
};