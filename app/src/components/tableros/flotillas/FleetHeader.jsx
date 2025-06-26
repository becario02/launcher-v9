import React from 'react';
import { MapPin } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';

const FleetHeader = () => {
  const { primaryColor } = usePrimaryColor();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6" style={{ color: primaryColor }} />
          <h1 className="text-[26px] leading-[39px] font-semibold text-[#44444f] dark:text-[#e2e2ea]">
            Ubicación de la Flotilla
          </h1>
        </div>
        <p className="text-sm text-[#696974] dark:text-[#92929d] mt-1 ml-8">
          Visualización geográfica en tiempo real del estatus de mantenimiento de la flotilla.
        </p>
      </div>
    </div>
  );
};

export default FleetHeader;