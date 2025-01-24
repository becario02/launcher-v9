import TarjetaRobot from './TarjetaRobot';
import { useRouter } from 'next/navigation';

const perfiles = [
  {
    titulo: 'Operativo',
    descripcion: 'Administra y supervisa actividades diarias de transporte y logística.',
    imagen: '/perfilOperativo.svg'
  },
  {
    titulo: 'Financiero',
    descripcion: 'Gestiona las operaciones financieras y contables.',
    imagen: '/perfilFinanciero.svg'
  },
  {
    titulo: 'Auxiliar',
    descripcion: 'Encargado de tareas de soporte y mantenimiento.',
    imagen: '/perfilAuxiliar.svg'
  }
];

const SeleccionPerfil = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-20 overflow-auto">
  <div className="container mx-auto 2xl:max-w-7xl">
    
    <div className="text-center mb-6 sm:mb-7 md:mb-8">
      <h1 className="text-2xl sm:text-2.5xl md:text-3xl 2xl:text-4xl font-bold mb-2 sm:mb-3 md:mb-4">Selecciona un perfil</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Por favor, elige el perfil que más se ajusta a las tareas o funciones que desempeñas en tu día a día.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {perfiles.map((perfil) => (
            <TarjetaRobot
              key={perfil.titulo}
              {...perfil}
            />
          ))}
        </div>

        <div className="text-center mt-6 sm:mt-7 md:mt-8">
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 sm:px-7 md:px-8 py-2 sm:py-2.5 rounded-md text-sm sm:text-base hover:bg-blue-600 transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeleccionPerfil;