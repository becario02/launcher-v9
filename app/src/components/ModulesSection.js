'use client';

import React from 'react';
import Image from 'next/image';
import { useModuleRequest } from '@/hooks/useModuleRequest';

const modules = [
  { id: 1, name: 'Tráfico', icon: '/trafico.png' },
  { id: 2, name: 'Facturación', icon: '/facturacion.png' },
  { id: 3, name: 'Liquidaciones', icon: '/liquidaciones.png' },
  { id: 4, name: 'Interfaz Rastreo', icon: '/rastreo.png' },
  { id: 5, name: 'Vigilancia', icon: '/vigilancia.png' },
  { id: 6, name: 'Madrinas', icon: '/madrinas.png' },
  { id: 7, name: 'Admón. del sistema', icon: '/admin.png' },
];

const ModuleCard = ({ name, icon, onClick, disabled }) => (
  <button 
    className={`bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
      flex flex-col items-center gap-2 w-full ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    <div className="relative w-16 h-16">
      <Image
        src={icon}
        alt={name}
        fill
        className="object-contain"
      />
    </div>
    <span className="text-sm text-center">{name}</span>
  </button>
);

const ModulesGrid = () => {
  const { handleModuleClick, loading, error } = useModuleRequest();

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="mb-12">
        <div className="flex items-baseline gap-2 mb-2">
          <h1 className="text-3xl font-medium text-sky-900">¡Bienvenido a</h1>
          <span className="text-4xl font-black tracking-tight bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent">
            PHES
          </span>
          <span className="text-3xl font-medium text-sky-900">!</span>
        </div>
        <p className="text-sky-700 text-lg">
          Selecciona un módulo
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            name={module.name}
            icon={module.icon}
            onClick={() => handleModuleClick(module.id)}
            disabled={loading}
          />
        ))}
      </div>

      {error && (
        <p className="mt-4 text-red-500 text-sm">
          Error: {error}
        </p>
      )}
    </div>
  );
};

export default ModulesGrid;