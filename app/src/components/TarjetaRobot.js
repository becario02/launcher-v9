const TarjetaRobot = ({ titulo, descripcion, imagen }) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex flex-col items-center">
          <img 
            src={imagen} 
            alt={titulo} 
            className="w-32 h-32 mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">{titulo}</h3>
          <p className="text-gray-600 text-center">{descripcion}</p>
        </div>
      </div>
    );
  };
  
  export default TarjetaRobot;