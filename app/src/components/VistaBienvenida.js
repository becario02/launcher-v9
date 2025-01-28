'use client';

const VistaBienvenida = ({ onSiguiente }) => {
  return (
    <div className="flex-1 flex justify-center items-center p-4 bg-gradient-to-br from-white via-white to-[#4096FB]/50">
      <div className="w-full max-w-lg 2xl:max-w-2xl flex flex-col items-center px-4">
        <img 
          src="/robot_hola.png" 
          alt="Robot NOVA saludando" 
          className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 2xl:w-64 2xl:h-64 
                   mb-3 sm:mb-4 md:mb-6 lg:mb-8"
        />
        
        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-4xl 2xl:text-5xl 
                     font-bold mb-2 sm:mb-3 md:mb-4 text-center break-words sm:whitespace-nowrap">
          ¡Bienvenido a Advan ERP Trucks!
        </h1>
        
        <p className="text-gray-600 mb-4 sm:mb-5 md:mb-6 lg:mb-8 text-center 
                    text-sm sm:text-base md:text-lg
                    break-words sm:whitespace-nowrap">
          ¡Queremos conocerte! Comenzaremos personalizando tu experiencia.
        </p>

        <button
          onClick={onSiguiente}
          className="bg-[#4096FB] text-white 
                   px-4 sm:px-6 md:px-8
                   py-2 sm:py-2.5
                   rounded-3xl
                   text-sm sm:text-base
                   hover:bg-blue-500 transition-colors
                   w-full sm:w-auto"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default VistaBienvenida;