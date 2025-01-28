import TarjetaRobot from './TarjetaRobot';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const SeleccionPerfil = () => {
  const router = useRouter();
  const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);

  const perfiles = [
    {
      id: 1,
      titulo: 'Operativo',
      descripcion: 'Administra y supervisa actividades diarias de transporte y logística.',
      imagen: '/perfilOperativo.png'
    },
    {
      id: 2,
      titulo: 'Financiero',
      descripcion: 'Gestiona las operaciones financieras y contables.',
      imagen: '/perfilFinanciero.png'
    },
    {
      id: 3,
      titulo: 'Auxiliar',
      descripcion: 'Encargado de tareas de soporte y mantenimiento.',
      imagen: '/perfilAuxiliar.png'
    }
  ];

  const handleSeleccionPerfil = (perfilId) => {
    setPerfilSeleccionado(perfilId);
  };

  const handleContinuar = () => {
    if (perfilSeleccionado) {
      // Aquí podrías guardar el perfil seleccionado en un estado global o BD
      console.log('Perfil seleccionado:', 
        perfiles.find(p => p.id === perfilSeleccionado)
      );
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen overflow-auto bg-gradient-to-br from-white via-white to-[#4096FB]/50">
      <div className="container mx-auto px-4 md:px-20 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Selecciona un perfil
          </h1>
          <p className="text-gray-600">
            Por favor, elige el perfil que más se ajusta a las tareas o funciones que desempeñas en tu día a día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {perfiles.map((perfil) => (
            <TarjetaRobot
              key={perfil.id}
              {...perfil}
              seleccionado={perfilSeleccionado === perfil.id}
              onSeleccionar={() => handleSeleccionPerfil(perfil.id)}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={handleContinuar}
            disabled={!perfilSeleccionado}
            className={`px-8 py-2.5 rounded-3xl text-base font-medium transition-colors
              ${perfilSeleccionado 
                ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeleccionPerfil;