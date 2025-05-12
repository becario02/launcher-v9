'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Bell, Settings, RefreshCw, Video, FileText, Info, AlertCircle, CheckCircle } from 'lucide-react';
import Toast from '@/components/Toast';
import clsx from 'clsx';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/theme';
import { useNotifications } from '@/context/NotificationContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import SkeletonLoader from '@/components/SkeletonLoader';
import { format, formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const { primaryColor } = usePrimaryColor();
  const { refreshUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Obtener el ID de usuario de las cookies
  const userId = Cookies.get('idUser') || '2'; // Fallback a 2 si no hay cookie

  // Cargar notificaciones desde la API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5173/mslauncher/api/v1/notifications/user/${userId}`,
        {
          params: {
            page: 1,
            pageSize: 50, // Un número grande para obtener todas
          },
          headers: {
            'Accept-Language': 'es'
          }
        }
      );
      
      if (response.data && response.data.data) {
        setNotifications(response.data.data);
      } else {
        setNotifications([]);
      }
      setError(null);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      setError('Error al cargar las notificaciones. Por favor intenta nuevamente.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Función para formatear la fecha y hora de la notificación
  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      
      return formatDistance(date, new Date(), {
        addSuffix: true,
        locale: es
      });
    } catch (e) {
      console.error('Error al formatear fecha:', e);
      return '';
    }
  };

  // Función para renderizar el icono según la categoría de notificación
  const renderNotificationIcon = (category) => {
    switch (category) {
      case 'SYSTEMUPDATE':
        return (
          <div className="w-8 h-8 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-red-500" />
          </div>
        );
      case 'NEWVIDEO':
        return (
          <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Video className="w-4 h-4 text-blue-500" />
          </div>
        );
      case 'NEWARTICLE':
        return (
          <div className="w-8 h-8 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <FileText className="w-4 h-4 text-green-500" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Info className="w-4 h-4 text-amber-500" />
          </div>
        );
    }
  };

  // Función para marcar una notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      await axios.post(
        `http://localhost:5173/mslauncher/api/v1/notification/${notificationId}/read/${userId}`,
        {},
        {
          headers: {
            'Accept-Language': 'es'
          }
        }
      );
      
      // Actualizar el estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.idNotification === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Actualizar el contador de notificaciones no leídas en el contexto
      refreshUnreadCount();
      
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
      console.error('Error al marcar notificación como leída:', error);
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
      setLoading(true);
      
      // Obtenemos solo las notificaciones no leídas
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      // Si no hay notificaciones no leídas, no hacemos nada
      if (unreadNotifications.length === 0) {
        setToast({
          show: true,
          message: 'No hay notificaciones sin leer',
          type: 'info'
        });
        setLoading(false);
        return;
      }
      
      // Creamos un array de promesas para marcar cada notificación como leída
      const markReadPromises = unreadNotifications.map(notification => 
        axios.post(
          `http://localhost:5173/mslauncher/api/v1/notification/${notification.idNotification}/read/${userId}`,
          {},
          {
            headers: {
              'Accept-Language': 'es'
            }
          }
        )
      );
      
      // Esperamos a que todas las solicitudes se completen
      await Promise.all(markReadPromises);
      
      // Actualizar el estado local
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Actualizar el contador de notificaciones no leídas en el contexto
      refreshUnreadCount();
      
      // Mostrar toast de éxito
      setToast({
        show: true,
        message: 'Todas las notificaciones marcadas como leídas',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      setToast({
        show: true,
        message: 'Error al marcar todas las notificaciones como leídas',
        type: 'error'
      });
    } finally {
      setLoading(false);
      
      // Ocultar el toast después de 3 segundos
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 3000);
    }
  };

  // Verificar si hay notificaciones no leídas
  const hasUnreadNotifications = notifications.some(notification => !notification.isRead);

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
          <div className="w-full max-w-3xl px-4 md:px-12 lg:px-6 mx-auto md:ml-0 lg:ml-24 xl:ml-32 space-y-12">
            
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
                <button 
                  onClick={fetchNotifications}
                  className="mt-2 text-sm text-red-700 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Intentar nuevamente
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="w-full md:hidden lg:block md:w-60 pt-2">
                    <h3 className="text-[14px] leading-[21px] font-medium font-poppins text-[#000000] dark:text-[#e2e2ea]">
                      Notificaciones
                    </h3>
                    <p className="text-[12px] leading-[18px] font-normal font-poppins text-[#696974] dark:text-[#92929d] mt-1">
                      Alertas y mensajes importantes del sistema.
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                      <button 
                        onClick={fetchNotifications}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:dark:text-primary flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Actualizar
                      </button>
                      
                      {hasUnreadNotifications && (
                        <button 
                          onClick={markAllAsRead} 
                          className="text-sm text-primary hover:text-primary/80 font-medium"
                          disabled={loading}
                        >
                          Marcar todas como leídas
                        </button>
                      )}
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-col items-center justify-center py-6">
                          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <Bell className="w-6 h-6 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No hay notificaciones</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Cuando recibas notificaciones, aparecerán aquí.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl shadow-sm overflow-hidden">
                        {notifications.map((notification, index) => (
                          <div 
                            key={notification.idNotification}
                            className={clsx(
                              "relative p-4",
                              index !== notifications.length - 1 && "border-b border-gray-100 dark:border-[#2C2C38]",
                              !notification.isRead && "border-l-4 border-l-primary pl-3"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              {renderNotificationIcon(notification.category)}
                              
                              <div className="flex-1">
                                <div className="mb-1">
                                  <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                                    {notification.title}
                                  </h3>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatNotificationTime(notification.creationDate)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                  {notification.description}
                                </p>
                                
                                {!notification.isRead && (
                                  <div className="flex justify-end">
                                    <button 
                                      onClick={() => markAsRead(notification.idNotification)}
                                      className="text-xs text-primary hover:text-primary/80 font-medium"
                                    >
                                      Marcar como leída
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {!notification.isRead && (
                              <div className="absolute top-4 right-4">
                                <span className={clsx(
                                  "inline-block px-2 py-1 text-xs font-medium rounded-full",
                                  "bg-primary/10 text-primary"
                                )}>
                                  Nuevo
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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