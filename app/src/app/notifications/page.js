'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Bell } from 'lucide-react';
import Toast from '@/components/Toast';
import clsx from 'clsx';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/theme';
import Cookies from 'js-cookie';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const { primaryColor } = usePrimaryColor();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Obtener el idioma del navegador o usar español por defecto
  const rawLang =
    typeof navigator !== 'undefined'
      ? navigator.language || 'en-US'
      : 'en-US';
  const language = rawLang.startsWith('es') ? 'es-MX' : 'en-US';

  useEffect(() => {
    // Simulación de carga de datos
    const simulateLoading = async () => {
      try {
        setLoading(true);
        // Simulamos el tiempo de carga de la API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Datos de ejemplo para notificaciones
        const mockNotifications = [
          {
            id: 1,
            title: 'Lorem ipsum placerat mi tellus non',
            message: 'Lorem ipsum velit mauris tellus sed nulla vitae nibh semper nunc accumsan pretium aliquam tincidunt suspendisse noncus felis porttitor tortor consequat vitae et integer ac ut gravida vitae purus quisquet enim habitant ornare in laboris sit sed quam vel moncus.',
            type: 'alert',
            read: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 23).toISOString() // 23 minutos atrás
          },
          {
            id: 2,
            title: 'Lorem ipsum placerat mi tellus non',
            message: 'Lorem ipsum velit mauris tellus sed nulla vitae nibh semper nunc accumsan pretium aliquam tincidunt suspendisse noncus felis porttitor tortor consequat vitae et integer ac ut gravida vitae purus quisquet enim habitant ornare in laboris sit sed quam vel moncus.',
            type: 'info',
            read: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 23).toISOString() // 23 minutos atrás
          },
          {
            id: 3,
            title: 'Lorem ipsum placerat mi tellus non',
            message: 'Lorem ipsum velit mauris tellus sed nulla vitae nibh semper nunc accumsan pretium aliquam tincidunt suspendisse noncus felis porttitor tortor consequat vitae et integer ac ut gravida vitae purus quisquet enim habitant ornare in laboris sit sed quam vel moncus.',
            type: 'success',
            read: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 23).toISOString() // 23 minutos atrás
          },
          {
            id: 4,
            title: 'Lorem ipsum placerat mi tellus non',
            message: 'Lorem ipsum velit mauris tellus sed nulla vitae nibh semper nunc accumsan pretium aliquam tincidunt suspendisse noncus felis porttitor tortor consequat vitae et integer ac ut gravida vitae purus quisquet enim habitant ornare in laboris sit sed quam vel moncus.',
            type: 'warning',
            read: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 23).toISOString() // 23 minutos atrás
          },
          {
            id: 5,
            title: 'Lorem ipsum placerat mi tellus non',
            message: 'Lorem ipsum velit mauris tellus sed nulla vitae nibh semper nunc accumsan pretium aliquam tincidunt suspendisse noncus felis porttitor tortor consequat vitae et integer ac ut gravida vitae purus quisquet enim habitant ornare in laboris sit sed quam vel moncus.',
            type: 'info',
            read: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 23).toISOString() // 23 minutos atrás
          },
          {
            id: 6,
            title: 'Lorem ipsum placerat mi tellus non',
            message: 'Lorem ipsum velit mauris tellus sed nulla vitae nibh semper nunc accumsan pretium aliquam tincidunt suspendisse noncus felis porttitor tortor consequat vitae et integer ac ut gravida vitae purus quisquet enim habitant ornare in laboris sit sed quam vel moncus.',
            type: 'success',
            read: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 23).toISOString() // 23 minutos atrás
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error:', error);
        setError('Error al cargar las notificaciones de ejemplo');
      } finally {
        setLoading(false);
      }
    };

    simulateLoading();
  }, []);

  // Función para formatear la fecha y hora de la notificación
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Ahora mismo';
    } else if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} minutos`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `hace ${hours} horas`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `hace ${days} días`;
    }
  };

  // Función para renderizar el icono según el tipo de notificación
  const renderNotificationIcon = (type) => {
    switch (type) {
      case 'alert':
        return (
          <div className="w-8 h-8 rounded-md bg-red-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-red-500" />
          </div>
        );
      case 'info':
        return (
          <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center">
            <div className="w-4 h-4 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 12h0"></path>
                <path d="M12 16v-4"></path>
                <circle cx="12" cy="8" r="0.5"></circle>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
          </div>
        );
      case 'success':
        return (
          <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center">
            <div className="w-4 h-4 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-md bg-amber-100 flex items-center justify-center">
            <div className="w-4 h-4 text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0 -18 0"></path>
              </svg>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-gray-500" />
          </div>
        );
    }
  };

  // Función para marcar una notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      // Simulamos una pequeña demora como si fuera una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Actualizar el estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Mostrar toast de éxito
      setToast({
        show: true,
        message: 'Notificación marcada como leída',
        type: 'success'
      });
      
      // Ocultar el toast después de 3 segundos
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setToast({
        show: true,
        message: 'Error al marcar la notificación como leída',
        type: 'error'
      });
      
      // Ocultar el toast después de 3 segundos
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 3000);
    }
  };

  // Función para marcar todas las notificaciones como leídas
  const markAllAsRead = async () => {
    try {
      // Simulamos una pequeña demora como si fuera una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Actualizar el estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Mostrar toast de éxito
      setToast({
        show: true,
        message: 'Todas las notificaciones marcadas como leídas',
        type: 'success'
      });
      
      // Ocultar el toast después de 3 segundos
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setToast({
        show: true,
        message: 'Error al marcar todas las notificaciones como leídas',
        type: 'error'
      });
      
      // Ocultar el toast después de 3 segundos
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 3000);
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

        <main className="min-h-screen bg-[#F2F6FD] dark:bg-[#13131a] pt-14 pb-14">
          <div className="px-4 md:px-6">
            {/* TÍTULO PRINCIPAL */}
            <div className="flex items-center mb-6 pt-4">
              <Bell className="w-6 h-6 mr-3 text-primary" />
              <h1 className="text-xl md:text-2xl font-semibold font-poppins text-[#44444f] dark:text-[#e2e2ea]">
                Notificaciones
              </h1>
            </div>

            {loading ? (
              <SkeletonLoader />
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 my-4">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6">
                {/* Columna izquierda - Información de perfil */}
                <div className="w-full md:w-64">
                  <div className="bg-white dark:bg-[#1C1C24] rounded-2xl p-5 shadow-sm">
                    <h3 className="text-base font-medium text-[#000000] dark:text-[#e2e2ea] mb-2">
                      Perfil
                    </h3>
                    <p className="text-sm text-[#696974] dark:text-[#92929d]">
                      Tu información personal y los ajustes de seguridad de la cuenta.
                    </p>
                  </div>
                </div>

                {/* Columna derecha - Notificaciones */}
                <div className="flex-1">
                  {notifications.length === 0 ? (
                    <div className="bg-white dark:bg-[#1C1C24] rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Bell className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No hay notificaciones</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Cuando recibas notificaciones, aparecerán aquí.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className="bg-white dark:bg-[#1C1C24] rounded-2xl p-4 shadow-sm relative border-b border-gray-100 dark:border-gray-800"
                        >
                          <div className="flex items-start gap-3">
                            {notification.type === 'alert' ? (
                              <div className="text-red-500 mt-1">
                                <Bell className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="text-blue-500 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 12h0"></path>
                                  <path d="M12 16v-4"></path>
                                  <circle cx="12" cy="8" r="0.5"></circle>
                                  <circle cx="12" cy="12" r="10"></circle>
                                </svg>
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                                  {notification.title}
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatNotificationTime(notification.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {notification.message}
                              </p>
                            </div>

                            {!notification.read && (
                              <div className="ml-2">
                                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary text-white">
                                  Nuevo
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}