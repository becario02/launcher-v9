import { usePathname } from 'next/navigation';

const moduleNames = {
  'trafico': 'Tráfico',
  'facturacion': 'Facturación',
  'liquidaciones': 'Liquidaciones',
  'interfaz-rastreo': 'Interfaz Rastreo',
  'vigilancia': 'Vigilancia',
  'madrinas': 'Madrinas',
  'admon-del-sistema': 'Admón. del sistema'
};

const ModuleHeader = () => {
  const pathname = usePathname();
  const modulePath = pathname.split('/').pop();
  const moduleTitle = moduleNames[modulePath] || modulePath;

  return (
    <div className="bg-gradient-to-r from-gray-100 to-blue-50 w-full">
      <div className="px-8 py-20">
        <h1 className="text-3xl font-bold text-gray-800">{moduleTitle}</h1>
      </div>
    </div>
  );
};

export default ModuleHeader;