'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

const moduleMenus = {
  1: {
    title: 'Tráfico',
    icon: '/trafico.png',
    menus: [
      { title: 'Transacciones', icon: '→' },
      { title: 'Consultas', icon: '📋' },
      { title: 'Reportes', icon: '📄' },
      { title: 'Catálogos', icon: '📚' },
      { title: 'Administración', icon: '⚙️' }
    ]
  },
  // Agregar más configuraciones de módulos según necesites
};

const ModulePage = () => {
  const params = useParams();
  const moduleId = params.id;
  const moduleInfo = moduleMenus[moduleId] || { title: 'Módulo', menus: [], icon: '/default.png' };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-12 h-12">
          <Image
            src={moduleInfo.icon}
            alt={moduleInfo.title}
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-blue-700">{moduleInfo.title}</h1>
      </div>

      <div className="flex gap-8">
        {/* Menú lateral */}
        <div className="w-64 bg-gray-50 rounded-lg overflow-hidden">
          {moduleInfo.menus.map((menu, index) => (
            <button
              key={index}
              className="w-full text-left p-4 hover:bg-white hover:shadow-sm transition-all flex items-center gap-3"
            >
              <span className="text-gray-400">{menu.icon}</span>
              <span className="font-medium">{menu.title}</span>
            </button>
          ))}
        </div>

        {/* Contenido principal */}
        <div className="flex-1 space-y-6">
          {/* Sección de utilizados recientemente */}
          <div>
            <h2 className="text-xl font-medium mb-4">Utilizados recientemente</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg mb-3 mx-auto" />
                  <h3 className="text-center font-medium">Función {i + 1}</h3>
                  <p className="text-sm text-gray-500 text-center mt-2">Lorem ipsum dolor sit amet</p>
                </div>
              ))}
            </div>
          </div>

          {/* Banner inferior */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 text-blue-700 cursor-pointer hover:text-blue-800">
              <span className="text-xl">↓</span>
              <h2 className="text-xl font-medium">
                ¡Descubre todo lo que puedes hacer con ADVAN ERP Trucks!
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePage;