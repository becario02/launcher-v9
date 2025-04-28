'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { Eye, Pencil, Check, Settings } from 'lucide-react';
import Toast from '@/components/Toast';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import clsx from 'clsx';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/theme';
import Cookies from 'js-cookie';

const colorOptions = ['#0080FF', '#8B5CF6', '#EC4899', '#22C55E', '#F97316'];
const themeOptions = ['light', 'dark'];

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { primaryColor, setPrimaryColor } = usePrimaryColor();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({
    fullname: '',
    email: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Obtener el idioma del navegador o usar español por defecto
  const rawLang =
    typeof navigator !== 'undefined'
      ? navigator.language || 'en-US'
      : 'en-US';
  const language = rawLang.startsWith('es') ? 'es-MX' : 'en-US';

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Obtener el ID de usuario de las cookies
        const userId = Cookies.get('idUser');
        
        if (!userId) {
          throw new Error('No se encontró el ID de usuario');
        }
        
        const response = await fetch(`http://localhost:5173/mslauncher/api/v1/profile?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener los datos del perfil');
        }
        
        const data = await response.json();
        
        if (data.statusCode === "200") {
          setProfileData(data.data);
          
          // Actualizar el formulario con los datos recibidos
          setFormData({
            fullname: data.data.fullname || '',
            email: data.data.email || ''
          });
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario comienza a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSaveChanges = async () => {
    // Validar campos
    let hasErrors = false;
    const newErrors = { fullname: '', email: '' };
    
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'El nombre completo es obligatorio';
      hasErrors = true;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
      hasErrors = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setFormErrors(newErrors);
      return;
    }

    try {
      setIsSaving(true);
      
      // Obtener el ID de usuario de las cookies
      const userId = Cookies.get('idUser');
      
      if (!userId) {
        throw new Error('No se encontró el ID de usuario');
      }
      
      const response = await fetch('http://localhost:5173/mslauncher/api/v1/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': language
        },
        body: JSON.stringify({
          idUser: parseInt(userId),
          fullname: formData.fullname,
          email: formData.email
        }),
      });
      
      const data = await response.json();
      
      if (data.statusCode === "200") {
        // Mostrar toast de éxito
        setToast({
          show: true,
          message: data.message || 'Perfil actualizado exitosamente',
          type: 'success'
        });
        
        // Actualizar el nombre en las cookies si es necesario
        if (formData.fullname !== profileData.fullname) {
          Cookies.set('fullname', formData.fullname, { expires: 7 });
        }
      } else {
        throw new Error(data.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      // Mostrar toast de error
      setToast({
        show: true,
        message: error.message || 'Error al guardar los cambios',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
      
      // Ocultar el toast después de 5 segundos
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 5000);
    }
  };

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

        {/* Toast notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}

        {/* Modal de cambio de contraseña */}
        {showPasswordModal && (
          <ChangePasswordModal 
            onClose={() => setShowPasswordModal(false)}
            onSuccess={(message) => {
              setToast({
                show: true,
                message,
                type: 'success'
              });
              // Ocultar el toast después de 5 segundos
              setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
              }, 5000);
            }}
          />
        )}

        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14">
          <div className="w-full max-w-3xl px-4 md:px-6 mx-auto md:mx-0 md:ml-24 lg:ml-28 xl:ml-32 space-y-12">
            
            {/* TÍTULO PRINCIPAL */}
            <div className="flex items-center mb-6 pt-4">
              <Settings className="w-6 h-6 mr-3 text-primary" />
              <h1 className="text-xl md:text-2xl font-semibold font-poppins text-[#44444f] dark:text-[#e2e2ea]">
                Configuración
              </h1>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-300">Cargando datos del perfil...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 my-4">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="w-full md:w-60 pt-2">
                    <h3 className="text-[14px] leading-[21px] font-medium font-poppins text-[#000000] dark:text-[#e2e2ea]">
                      Perfil
                    </h3>
                    <p className="text-[12px] leading-[18px] font-normal font-poppins text-[#696974] dark:text-[#92929d] mt-1">
                      Tu información personal y los ajustes de seguridad de la cuenta.
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm space-y-5">
                      {/* Avatar */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src="/assets/navbar/perfil.jpg"
                            alt="Avatar"
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center gap-1">
                          <Pencil className="w-4 h-4" />
                          Cambiar avatar
                        </button>
                      </div>

                      {/* Campos */}
                      <div className="space-y-4 text-sm">
                        <div>
                          <label className="block mb-1 text-gray-600 dark:text-gray-400">Nombre completo</label>
                          <input
                            type="text"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleInputChange}
                            className={`w-full rounded-md bg-white dark:bg-[#1C1C24] border ${formErrors.fullname ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-[#2C2C38]'} px-3 py-2 text-gray-800 dark:text-white`}
                          />
                          {formErrors.fullname && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.fullname}</p>
                          )}
                        </div>
                        <div>
                          <label className="block mb-1 text-gray-600 dark:text-gray-400">Correo</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full rounded-md bg-white dark:bg-[#1C1C24] border ${formErrors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-[#2C2C38]'} px-3 py-2 text-gray-800 dark:text-white`}
                          />
                          {formErrors.email && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                          )}
                        </div>
                        <div>
                          <label className="block mb-1 text-gray-600 dark:text-gray-400">Contraseña</label>
                          <div className="relative">
                            <input
                              type="password"
                              value="••••••••"
                              disabled
                              className="w-full rounded-md bg-gray-100 dark:bg-[#16161E] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-gray-500 pr-10 cursor-not-allowed"
                            />
                          </div>
                          <div className="mt-2 flex justify-end">
                            <button 
                              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                              onClick={() => setShowPasswordModal(true)}
                            >
                              <Pencil className="w-4 h-4" />
                              Cambiar contraseña
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BLOQUE COLOR DE TEMA */}
                <div className="flex flex-col md:flex-row gap-10 mt-8">
                  <div className="w-full md:w-60 pt-2">
                    <h3 className="text-[14px] leading-[21px] font-medium font-poppins text-[#000000] dark:text-[#e2e2ea]">
                      Color de tema
                    </h3>
                    <p className="text-[12px] leading-[18px] font-normal font-poppins text-[#696974] dark:text-[#92929d] mt-1">
                      Elige un tema preferido para la app.
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-4 shadow-sm flex gap-3">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => setPrimaryColor(color)}
                          className={clsx(
                            'w-8 h-8 rounded-md flex items-center justify-center relative',
                            primaryColor === color ? 'ring-2 ring-white' : ''
                          )}
                          style={{ backgroundColor: color }}
                        >
                          {primaryColor === color && <Check className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BLOQUE MODO DE TEMA */}
                <div className="flex flex-col md:flex-row gap-10 mt-8">
                  <div className="w-full md:w-60 pt-2">
                    <h3 className="text-[14px] leading-[21px] font-medium font-poppins text-[#000000] dark:text-[#e2e2ea]">
                      Modo de tema
                    </h3>
                    <p className="text-[12px] leading-[18px] font-normal font-poppins text-[#696974] dark:text-[#92929d] mt-1">
                      Elige el modo claro u oscuro, o cámbialo automáticamente según la configuración del sistema.
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-4 shadow-sm flex gap-4">
                      {themeOptions.map((themeOption) => (
                        <button
                          key={themeOption}
                          onClick={() => setTheme(themeOption)}
                          className={clsx(
                            'w-14 h-9 rounded-md border shadow-inner flex items-center justify-center',
                            themeOption === 'light'
                              ? 'bg-white border-gray-300' 
                              : 'bg-[#1C1C24] border-gray-700',
                            theme === themeOption && 'ring-2 ring-white'
                          )}
                        >
                          {theme === themeOption && <Check className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botón Guardar */}
                <div className="flex justify-end mt-8">
                  <button 
                    className={`bg-primary text-white px-6 py-2 rounded-md transition-opacity ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}