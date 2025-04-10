// src/app/divisiones/[division]/page.js
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DivisionModuleCard from '@/components/DivisionModuleCard';

const divisionModules = {
  nucleares: [
    { title: 'Llantas', description: 'Gestión de neumáticos y mantenimiento.' },
    { title: 'Tráfico', description: 'Gestión de tráfico y logística.' },
    { title: 'Liquidaciones', description: 'Control y reporte de gastos.' },
    { title: 'Compras', description: 'Proceso de compra y proveedores.' },
    { title: 'Cotizador', description: 'Cotizaciones rápidas y eficientes.' },
    { title: 'Vigilancia', description: 'Monitoreo y seguridad operativa.' },
    { title: 'Mantenimiento', description: 'Revisión y mantenimiento de flota.' },
  ],
  financieros: [
    { title: 'Contabilidad', description: 'Seguimiento contable y reportes.' },
    { title: 'Facturación', description: 'Gestión de facturas y pagos.' },
    { title: 'Presupuestos', description: 'Planeación financiera mensual.' },
  ],
  auxiliares: [
    { title: 'RRHH', description: 'Gestión de personal y contratos.' },
    { title: 'Legal', description: 'Documentación y cumplimiento legal.' },
    { title: 'IT', description: 'Soporte técnico y sistemas.' },
  ],
};

export default function DivisionPage() {
  const { division } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const modules = divisionModules[division] || [];

  return (
    <div className="flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>

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

        <main className="min-h-screen bg-[#F2F6FD] pt-14 pb-14 px-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 capitalize">
              División: {division}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((mod) => (
                <DivisionModuleCard
                  key={mod.title}
                  title={mod.title}
                  description={mod.description}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
