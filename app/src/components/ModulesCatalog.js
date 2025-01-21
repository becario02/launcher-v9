'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

const catalogModules = [
  { id: 1, name: 'Activo fijo', description: 'Lorem ipsum dolem', icon: '/admin.png' },
  { id: 2, name: 'Administración del sistema', description: 'Lorem ipsum dolem', icon: '/admin.png' },
  { id: 3, name: 'Almacenes', description: 'Lorem ipsum dolem', icon: '/admin.png' },
  { id: 4, name: 'Caja chica', description: 'Lorem ipsum dolem', icon: '/facturacion.png' },
  { id: 5, name: 'Compras', description: 'Lorem ipsum dolem', icon: '/facturacion.png' },
  { id: 6, name: 'Consolidados', description: 'Lorem ipsum dolem', icon: '/liquidaciones.png' },
  { id: 7, name: 'Contabilidad', description: 'Lorem ipsum dolem', icon: '/liquidaciones.png' },
  { id: 8, name: 'Control bancario', description: 'Lorem ipsum dolem', icon: '/liquidaciones.png' },
  { id: 9, name: 'Coordinados', description: 'Lorem ipsum dolem', icon: '/trafico.png' },
  { id: 10, name: 'Cuentas por cobrar', description: 'Lorem ipsum dolem', icon: '/facturacion.png' },
  { id: 11, name: 'Cuentas por pagar', description: 'Lorem ipsum dolem', icon: '/facturacion.png' },
  { id: 12, name: 'Facturación', description: 'Lorem ipsum dolem', icon: '/facturacion.png' },
];

const ModuleCard = ({ name, description, icon }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer border border-gray-100">
    <div className="flex items-start gap-4">
      <div className="relative w-12 h-12 flex-shrink-0">
        <Image
          src={icon}
          alt={name}
          fill
          className="object-contain group-hover:scale-110 transition-transform duration-200"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-gray-900 font-medium mb-1 group-hover:text-sky-600 transition-colors">
          {name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>
    </div>
  </div>
);

const ModulesCatalog = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-8 pb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 
          group mb-4 border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-50 rounded-lg">
              <ChevronDown 
                className={`w-6 h-6 text-sky-600 transition-transform duration-300 
                  ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
              />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
                Catálogo de módulos
              </h2>
              <p className="text-sm text-gray-500">
                {isExpanded ? 'Haz clic para ocultar todos los módulos' : 'Haz clic para ver todos los módulos disponibles'}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {catalogModules.length} módulos
          </div>
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden
          ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalogModules.map((module) => (
            <ModuleCard
              key={module.id}
              name={module.name}
              description={module.description}
              icon={module.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModulesCatalog;