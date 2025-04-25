'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { Eye, Pencil, Check, Settings } from 'lucide-react';
import clsx from 'clsx';
import { usePrimaryColor } from '@/context/primaryColor';

const colorOptions = ['#0080FF', '#8B5CF6', '#EC4899', '#22C55E', '#F97316'];
const themeOptions = ['light', 'dark'];

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('light');
  const { primaryColor, setPrimaryColor } = usePrimaryColor();

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
          {/* Aumentado el margen izquierdo en aproximadamente 100px */}
          <div className="w-full max-w-3xl px-4 md:px-6 mx-auto md:mx-0 md:ml-24 lg:ml-28 xl:ml-32 space-y-12">
            
            {/* TÍTULO PRINCIPAL - Ajustado el tamaño y padding */}
            <div className="flex items-center mb-6 pt-4">
              <Settings className="w-6 h-6 mr-3 text-primary" />
              <h1 className="text-xl md:text-2xl font-semibold font-poppins text-[#44444f] dark:text-[#e2e2ea]">
                Configuración
              </h1>
            </div>

            {/* BLOQUE DE PERFIL - Mantenido el ancho original de columnas */}
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
                    {/* Avatar - Modificado para alinearse con el diseño */}
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

                    {/* Campos - Ajustados para adaptarse al diseño de Zeplin */}
                    <div className="space-y-4 text-sm">
                      <div>
                        <label className="block mb-1 text-gray-600 dark:text-gray-400">Nombre</label>
                        <input
                          type="text"
                          defaultValue="Luis"
                          className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-gray-600 dark:text-gray-400">Apellido</label>
                        <input
                          type="text"
                          defaultValue="González"
                          className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-gray-600 dark:text-gray-400">Correo</label>
                        <input
                          type="email"
                          defaultValue="luis.gonzalez@gmail.com"
                          className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-gray-600 dark:text-gray-400">Contraseña</label>
                        <div className="relative">
                          <input
                            type="password"
                            defaultValue="••••••"
                            className="w-full rounded-md bg-white dark:bg-[#1C1C24] border border-gray-300 dark:border-[#2C2C38] px-3 py-2 text-gray-800 dark:text-white pr-10"
                          />
                          <Eye className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 w-4 h-4 cursor-pointer" />
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
                            <Pencil className="w-4 h-4" />
                            Cambiar contraseña
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOQUE COLOR DE TEMA - Mantenido el ancho original de columnas */}
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

              {/* BLOQUE MODO DE TEMA - Mantenido el ancho original de columnas */}
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
                    {themeOptions.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setSelectedTheme(theme)}
                        className={clsx(
                          'w-14 h-9 rounded-md border shadow-inner flex items-center justify-center',
                          theme === 'light'
                            ? 'bg-white border-gray-300' 
                            : 'bg-[#1C1C24] border-gray-700',
                          selectedTheme === theme && 'ring-2 ring-white'
                        )}
                      >
                        {selectedTheme === theme && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}