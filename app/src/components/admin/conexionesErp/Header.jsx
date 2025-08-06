import { Network } from 'lucide-react';

export default function Header() {
  return (
    <div className="flex items-start gap-3">
      <div className="text-primary mt-1">
        <Network size={24} />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-[#92929D] dark:text-gray-400">
          Administrador de Conexiones ERP
        </h1>
        <p className="text-sm text-[#92929D] dark:text-gray-400">
          Gestiona las conexiones ERP dentro de tu organización.
        </p>
      </div>
    </div>
  );
}
