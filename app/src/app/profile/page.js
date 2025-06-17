'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { UserCircle, Pencil, Calendar, Clock } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useCompany } from '@/context/CompanyContext';
import Cookies from 'js-cookie';
import ProfileSkeletonLoader from '@/components/ProfileSkeletonLoader';

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { selectedCompany } = useCompany();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Obtener el ID de usuario de las cookies
        const userId = Cookies.get('idUser');
        
        if (!userId) {
          throw new Error('No se encontró el ID de usuario');
        }
        
        const response = await fetch(`/api/profile?userId=${userId}`); 
        
        if (!response.ok) {
          throw new Error('Error al obtener los datos del perfil');
        }
        
        const data = await response.json();
        
        if (data.statusCode === "200") {
          setProfileData(data.data);
        } else {
          throw new Error(data.message || 'Error en la respuesta del servidor');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    const day = date.getDate();
    
    // Array de nombres de meses en español
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} / ${month} / ${year}`;
  };
  
  // Función para formatear la hora considerando UTC para lastLoginDate
  const formatTime = (dateString, isLastLogin = false) => {
    if (!dateString) return '';
    
    let date;
    
    if (isLastLogin) {
      // Convertir a formato ISO para que se interprete como UTC
      // Reemplazar el espacio con T y agregar Z al final para indicar UTC
      const isoDate = dateString.replace(' ', 'T') + 'Z';
      date = new Date(isoDate);
    } else {
      date = new Date(dateString);
    }
    
    // Usar Intl.DateTimeFormat para formato de hora según la localidad
    return new Intl.DateTimeFormat('es-MX', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Mexico_City'
    }).format(date);
  };

  const prifileMap = {
    'ADMINADVAN': 'ADMINISTRADOR DE ADVAN',
    'USERADVAN': 'USUARIO DE ADVAN',
    'ADMINCUSTOMER': 'ADMINISTRADOR DEL CLIENTE',
    'USERCUSTOMER': 'USUARIO DEL CLIENTE',
  }

  const profileName = prifileMap[profileData?.profileName] || 'N/A';

  return (
    <div className="flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="relative z-50 w-60 h-full bg-white dark:bg-[#1C1C24] shadow-lg">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 md:ml-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14">
          <div className="w-full max-w-3xl px-4 md:px-6 mx-auto md:mx-0 md:ml-24 lg:ml-28 xl:ml-32 space-y-12">
            
            {/* TÍTULO PRINCIPAL */}
            <div className="flex items-center mb-6 pt-4">
              <UserCircle className="w-6 h-6 mr-3 text-primary" />
              <h1 className="text-xl md:text-2xl font-semibold font-poppins text-[#44444f] dark:text-[#e2e2ea]">
                Perfil
              </h1>
            </div>

            {loading ? (
              <ProfileSkeletonLoader />
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 my-4">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* BLOQUE DE PERFIL */}
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="w-full md:w-60 pt-2">
                    <h3 className="text-[14px] leading-[21px] font-medium font-poppins text-[#000000] dark:text-[#e2e2ea]">
                      Perfil
                    </h3>
                    <p className="text-[12px] leading-[18px] font-normal font-poppins text-[#696974] dark:text-[#92929d] mt-1">
                      Tu información personal y los ajustes de seguridad de la cuenta.
                    </p>
                    {/* Botón Editar */}
                    <button 
                      className="flex items-center gap-2 text-sm text-primary hover:opacity-80 mt-3"
                      onClick={() => window.location.href = '/profile/settings'}
                    >
                      <Pencil className="w-4 h-4" />
                      Editar mis datos
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm space-y-6">
                      {/* Avatar */}
                      <div>
                        <label className="block text-[12px] font-medium font-poppins leading-[18px] text-[#92929d] mb-1">Avatar</label>
                        <div className="w-[70px] h-[70px] rounded-full overflow-hidden">
                          <Image
                            src="/assets/navbar/perfil.jpg"
                            alt="Avatar"
                            width={70}
                            height={70}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>

                      {/* Nombre */}
                      <div>
                        <label className="block text-[12px] font-medium font-poppins leading-[18px] text-[#92929d] mb-1">Nombre</label>
                        <div className="text-[14px] font-medium font-poppins leading-[21px] text-[#171725] dark:text-[#f5f7fa]">
                          {profileData?.fullname || 'N/A'}
                        </div>
                      </div>

                      {/* Correo */}
                      <div>
                        <label className="block text-[12px] font-medium font-poppins leading-[18px] text-[#92929d] mb-1">Correo</label>
                        <div className="text-[14px] font-medium font-poppins leading-[21px] text-[#171725] dark:text-[#f5f7fa]">
                          {profileData?.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BLOQUE EMPRESA */}
                <div className="flex flex-col md:flex-row gap-10 mt-8">
                  <div className="w-full md:w-60 pt-2">
                    <h3 className="text-[14px] leading-[21px] font-medium font-poppins text-[#000000] dark:text-[#e2e2ea]">
                      Empresa
                    </h3>
                    <p className="text-[12px] leading-[18px] font-normal font-poppins text-[#696974] dark:text-[#92929d] mt-1">
                      Tu información personal y los ajustes de seguridad de la cuenta.
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm space-y-6">
                      {/* Empresa */}
                      <div>
                        <label className="block text-[12px] font-medium font-poppins leading-[18px] text-[#92929d] mb-1">Empresa</label>
                        <div className="text-[14px] font-medium font-poppins leading-[21px] text-[#171725] dark:text-[#f5f7fa]">{selectedCompany ? selectedCompany.name : 'No hay empresa seleccionada'}</div>
                      </div>

                      {/* Perfil de usuario */}
                      <div>
                        <label className="block text-[12px] font-medium font-poppins leading-[18px] text-[#92929d] mb-1">Perfil de usuario</label>
                        <div className="text-[14px] font-medium font-poppins leading-[21px] text-[#171725] dark:text-[#f5f7fa]">
                          {profileName}
                        </div>
                      </div>

                      {/* Miembro desde */}
                      <div>
                        <label className="block text-[12px] font-medium font-poppins leading-[18px] text-[#92929d] mb-1">Miembro desde</label>
                        <div className="text-[14px] font-medium font-poppins leading-[21px] text-[#171725] dark:text-[#f5f7fa]">
                          {formatDate(profileData?.creationDate) || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BLOQUE SESIONES */}
                <div className="flex flex-col md:flex-row gap-10 mt-8">
                  <div className="w-full md:w-60 pt-2">
                    <h3 className="text-[14px] leading-[21px] font-medium font-poppins text-[#000000] dark:text-[#e2e2ea]">
                      Sesiones
                    </h3>
                    <p className="text-[12px] leading-[18px] font-normal font-poppins text-[#696974] dark:text-[#92929d] mt-1">
                      Tu información personal y los ajustes de seguridad de la cuenta.
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm">
                      <div className="text-[12px] font-medium font-poppins leading-[18px] text-[#92929d] mb-1">Última sesión</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-[14px] font-medium font-poppins leading-[21px] text-[#171725] dark:text-[#f5f7fa]">
                          {formatDate(profileData?.lastLoginDate) || 'N/A'}
                        </span>
                        <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 ml-3" />
                        <span className="text-[14px] font-medium font-poppins leading-[21px] text-[#171725] dark:text-[#f5f7fa]">
                          {formatTime(profileData?.lastLoginDate, true) || ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}