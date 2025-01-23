import { useRouter } from 'next/navigation';

const VistaBienvenida = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="mb-4">
        <img src="/logo.png" alt="Logo Advan" className="h-8" />
      </div>
      
      <div className="max-w-md w-full flex flex-col items-center">
        <img 
          src="/robot.png" 
          alt="Robot" 
          className="w-48 h-48 mb-8"
        />
        
        <h1 className="text-3xl font-bold mb-4 text-center">
          ¡Bienvenido a Advan ERP Trucks!
        </h1>
        
        <p className="text-gray-600 mb-8 text-center">
          ¡Queremos conocerte! Comenzaremos personalizando tu experiencia.
        </p>

        <button
          onClick={() => router.push('/seleccionar-perfil')}
          className="bg-blue-500 text-white px-8 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default VistaBienvenida;