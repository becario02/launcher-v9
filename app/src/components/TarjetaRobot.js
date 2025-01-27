const TarjetaRobot = ({ titulo, descripcion, imagen }) => {
  return (
    <div className="bg-white hover:bg-blue-200 hover:border-blue-300 rounded-3xl border-2 border-gray-300 px-6 py-10 max-w-[280px] mx-auto">
      <div className="flex flex-col items-center text-center">
        <img 
          src={imagen} 
          alt={titulo} 
          className="w-36 h-36 mb-4 object-contain"
        />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{titulo}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{descripcion}</p>
      </div>
    </div>
  );
};

  
export default TarjetaRobot;