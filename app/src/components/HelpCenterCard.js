'use client';

export default function HelpCenterCard() {
  return (
    <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer h-[300px] relative">
      {/* Icono en esquina superior izquierda con contenedor circular */}
      <div className="absolute top-4 left-4 w-9 h-9 bg-gray-100 dark:bg-[#2C2C38] rounded-full flex items-center justify-center">
        <img
          src="/assets/HelpCenterCard/icon-ayuda.svg"
          alt="Ayuda icon"
          className="w-4 h-4 object-contain"
        />
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col items-start justify-center h-full pt-6">
        <img
          src="/assets/HelpCenterCard/centro-de-ayuda.png"
          alt="Centro de ayuda"
          className="h-[120px] object-contain mb-4"
        />
        <h2 className="text-[20px] text-[#171725] dark:text-gray-200 font-medium font-poppins mb-2">
          Centro de ayuda
        </h2>
        <p className="text-[12px] leading-[18px] text-[#696974] dark:text-gray-400 font-poppins text-left">
          Encuentra respuestas, tutoriales y soporte técnico para sacarle el máximo provecho a la plataforma.
        </p>
      </div>
    </div>
  );
}
