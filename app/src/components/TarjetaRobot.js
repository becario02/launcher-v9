import Image from 'next/image';

const TarjetaRobot = ({ titulo, descripcion, imagen, seleccionado, onSeleccionar }) => {
  return (
    <div 
      onClick={onSeleccionar}
      className={`rounded-3xl border-2 px-6 py-10 max-w-[280px] mx-auto cursor-pointer transition-all duration-200
        ${seleccionado 
          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
          : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
        }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative w-36 h-36 mb-4">
          <Image
            src={imagen} 
            alt={titulo}
            fill
            priority
            className="object-contain"
          />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{titulo}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{descripcion}</p>
      </div>
    </div>
  );
};

export default TarjetaRobot;