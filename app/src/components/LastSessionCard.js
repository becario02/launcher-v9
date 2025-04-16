'use client';

import { Calendar, Clock } from 'lucide-react';

const LastSessionCard = () => {
  return (
    <div className="w-full sm:w-auto p-[10px] rounded-[10px] border border-[#E6E8EC] dark:border-[#2C2C38] font-poppins flex flex-col justify-between overflow-hidden min-w-0 lg:mt-2">
      <span className="text-[10px] text-[#696974] dark:text-gray-400 font-normal leading-[15px]">
        Última sesión
      </span>
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full gap-x-2 overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-2 text-[#171725] dark:text-gray-200 text-[12px] font-medium leading-[18px] min-w-0">
          <Calendar size={18} className="text-[#A0A0B2] dark:text-gray-400 shrink-0" />
          <span className="truncate">Martes 18 de septiembre de 2024</span>
        </div>
        <div className="w-px h-4 bg-[#E6E8EC] dark:bg-[#2C2C38] mx-2 shrink-0" />
        <div className="flex items-center gap-2 text-[#171725] dark:text-gray-200 text-[12px] font-medium leading-[18px] shrink-0 mt-1 sm:mt-0">
          <Clock size={18} className="text-[#A0A0B2] dark:text-gray-400" />
          <span>4:32 pm</span>
        </div>
      </div>
    </div>
  );
};

export default LastSessionCard;
