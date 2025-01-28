const TarjetaRobot = ({ 
  titulo, 
  descripcion, 
  imagen, 
  seleccionado, 
  onSeleccionar 
}) => {
  return (
    <div 
      onClick={onSeleccionar}
      className={`bg-white rounded-3xl border-2 px-6 py-10 max-w-[280px] mx-auto cursor-pointer transition-all duration-200
        ${seleccionado 
          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
          : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300'
        }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <img 
            src={imagen} 
            alt={titulo} 
            className="w-36 h-36 mb-4 object-contain"
          />
          {/*{seleccionado && (
            <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-2">
              <svg 
                className="w-4 h-4 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          )}*/}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{titulo}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{descripcion}</p>
      </div>
    </div>
  );
};

  
export default TarjetaRobot;