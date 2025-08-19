import React from 'react';
import { Truck } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';

const VehicleHeader = () => {
  const { primaryColor } = usePrimaryColor();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6" style={{ color: primaryColor }} />
          <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
            Tablero de Vehículos
          </h1>
        </div>
        <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
          Vista operativa estilo aeropuerto del estatus en tiempo real de tractocamiones y operaciones logísticas.
        </p>
      </div>
    </div>
  );
};

export default VehicleHeader;