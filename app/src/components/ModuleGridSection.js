'use client';

import Link from 'next/link';

const modules = [
  {
    name: 'Nucleares',
    description: 'Módulos centrales que gestionan el flujo operativo de la empresa con integridad y visibilidad total.',
    image: '/assets/modules/nucleares.png',
    icon: '/assets/modules/icon-nucleares.png',
  },
  {
    name: 'Financieros',
    description: 'Conectan la operación con los procesos financieros, permitiendo una gestión contable precisa y eficaz.',
    image: '/assets/modules/financieros.png',
    icon: '/assets/modules/icon-financieros.png',
  },
  {
    name: 'Auxiliares',
    description: 'Control de forma eficiente los recursos clave de tu operación: compras, almacén, mantenimiento y gestión de llantas.',
    image: '/assets/modules/auxiliares.png',
    icon: '/assets/modules/icon-auxiliar.png',
  },
];

const ModuleGridSection = () => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map((mod) => (
        <Link
          key={mod.name}
          href={`/divisiones/${mod.name.toLowerCase()}`}
          className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer h-[300px] relative block"
        >
          {/* Icono en esquina superior izquierda con contenedor circular */}
          <div className="absolute top-4 left-4 w-9 h-9 bg-gray-100 dark:bg-[#2C2C38] rounded-full flex items-center justify-center">
            <img
              src={mod.icon}
              alt={`${mod.name} icon`}
              className="w-4 h-4 object-contain"
            />
          </div>

          {/* Contenido principal */}
          <div className="flex flex-col items-start justify-center h-full pt-6">
            <img src={mod.image} alt={mod.name} className="h-[120px] object-contain mb-4" />
            <h2 className="text-[20px] text-[#171725] dark:text-gray-200 font-medium font-poppins mb-2">
              {mod.name}
            </h2>
            <p className="text-[12px] leading-[18px] text-[#696974] dark:text-gray-400 font-poppins text-left">
              {mod.description}
            </p>
          </div>
        </Link>
      ))}
    </section>
  );
};

export default ModuleGridSection;