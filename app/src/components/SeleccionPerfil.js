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
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <img src="/logoAdvan.svg" alt="Logo Advan" className="h-8" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Selecciona un perfil</h1>
          <p className="text-gray-600">
            Por favor, elige el perfil que más se ajusta a las tareas o funciones que desempeñas en tu día a día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {perfiles.map((perfil) => (
            <TarjetaRobot
              key={perfil.titulo}
              {...perfil}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={ () => router.push('/') }
            className="bg-blue-500 text-white px-8 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeleccionPerfil;