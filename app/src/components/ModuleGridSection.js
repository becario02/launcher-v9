'use client';

const modules = [
  {
    name: 'Nucleares',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
    image: '/assets/modules/nucleares.png',
    icon: '/assets/modules/icon-nucleares.png',
  },
  {
    name: 'Financieros',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
    image: '/assets/modules/financieros.png',
    icon: '/assets/modules/icon-financieros.png',
  },
  {
    name: 'Auxiliares',
    description: 'Lorem ipsum placerat mi tellus non ac risus facilisis nibh consequat ipsum.',
    image: '/assets/modules/auxiliares.png',
    icon: '/assets/modules/icon-auxiliar.png',
  },
];

const ModuleGridSection = () => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map((mod) => (
        <div
          key={mod.name}
          className="bg-white border border-gray-200 rounded-md p-6 hover:shadow-sm transition cursor-pointer h-[300px] relative"
        >
          {/* Icono en esquina superior izquierda con contenedor circular */}
          <div className="absolute top-4 left-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <img
              src={mod.icon}
              alt={`${mod.name} icon`}
              className="w-4 h-4 object-contain"
            />
          </div>

          <div className="flex flex-col items-start justify-center h-full">
            <img src={mod.image} alt={mod.name} className="h-[120px] object-contain mb-4" />
            <h2 className="text-[20px] text-[#171725] font-medium font-[Poppins] mb-2">
              {mod.name}
            </h2>
            <p className="text-[12px] leading-[18px] text-[#696974] font-[Poppins] text-left">
              {mod.description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default ModuleGridSection;
