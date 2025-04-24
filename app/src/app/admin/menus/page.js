'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useCompany } from '@/context/CompanyContext';
import MenuHierarchyEditor from '@/components/MenuHierarchyEditor';

export default function MenusAdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedCompany } = useCompany();

  return (
    <div className="flex">
      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 md:ml-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14">
          <div className="max-w-5xl mx-auto px-6">
            {/* Encabezado de la página */}
            <div className="mb-6">
              <h1 className="text-h1 font-bold text-gray-800 dark:text-white">Administración de Menús</h1>
              <p className="text-p text-gray-500 dark:text-gray-400 mt-1">
                Gestiona y organiza la estructura de menús para tus usuarios
              </p>
            </div>

            {/* Contenido principal - Editor de Jerarquía de Menús */}
            <div className="bg-white dark:bg-[#1c1c24] rounded-lg shadow">
              <MenuHierarchyEditor />
            </div>
            
            {/* Sección de instrucciones */}
            <div className="mt-6 bg-white dark:bg-[#1c1c24] rounded-lg shadow p-4">
              <h2 className="text-h3 font-semibold text-gray-800 dark:text-white mb-2">Instrucciones de uso</h2>
              <ul className="list-disc pl-5 space-y-1 text-p text-gray-600 dark:text-gray-300">
                <li>Arrastra y suelta elementos para reorganizar la jerarquía</li>
                <li>Usa las flechas para mover elementos arriba o abajo dentro de su nivel</li>
                <li>Para hacer que un elemento sea principal, haz clic en el icono de movimiento vertical</li>
                <li>Expande o contrae categorías haciendo clic en las flechas de expansión</li>
                <li>No olvides guardar los cambios después de reorganizar</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}