'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Bell, Video, FileText, Info, RefreshCw } from 'lucide-react';
import Toast from '@/components/Toast';
import clsx from 'clsx';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/theme';
import { useNotifications } from '@/context/NotificationContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import NotificationsSkeletonLoader from '@/components/NotificationsSkeletonLoader';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const { primaryColor } = usePrimaryColor();
  const { 
    refreshUnreadCount, 
    markNotificationAsRead, 
    panelRefresh,
    refreshNotificationPanel 
  } = useNotifications();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [markingAsRead, setMarkingAsRead] = useState(null); // ID de la notificación que se está marcando como leída
  
  // Obtener el ID de usuario de las cookies
  const userId = Cookies.get('idUser') || '2'; // Fallback a 2 si no hay cookie

  // Cargar notificaciones desde la API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        '/api/notificaciones/user',
        {
          params: {
            userId,
            page: 1,
            pageSize: 50, 
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

  // Manejar marcar como leída una notificación
  const handleMarkAsRead = async (notificationId) => {
    if (markingAsRead) return; // Prevenir múltiples clics
    
    try {
      setMarkingAsRead(notificationId);
      
      // Usar la función del contexto para marcar como leída
      await markNotificationAsRead(notificationId);
      
      // Actualizar la interfaz local
      setNotifications(prev => 
        prev.map(notif => 
          notif.idNotification === notificationId 
            ? { ...notif, isRead: true } 
            : notif
        )
      );
      
      // Mostrar toast de éxito
      setToast({
        show: true,
        message: 'Notificación marcada como leída',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      setToast({
        show: true,
        message: 'Error al marcar la notificación como leída',
        type: 'error'
      });
    } finally {
      setMarkingAsRead(null);
    }
  };

  // Cargar notificaciones al montar el componente y cuando panelRefresh cambie
  useEffect(() => {
    fetchNotifications();
  }, [panelRefresh]);

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
          <div className="w-full max-w-4xl px-4 md:px-12 lg:px-6 mx-auto md:ml-0 lg:ml-24 xl:ml-32 space-y-12">
            
            {/* TÍTULO PRINCIPAL */}
            <div className="flex items-center mb-6 pt-4">
              <Bell className="w-6 h-6 mr-3 text-primary" />
              <h1 className="text-xl md:text-2xl font-semibold font-poppins text-[#44444f] dark:text-[#e2e2ea]">
                Notificaciones
              </h1>
            </div>

            {loading ? (
              <NotificationsSkeletonLoader />
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 my-4">
                <p className="text-red-700 dark:text-red-400">{error}</p>
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
                      <div className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-2xl shadow-sm overflow-hidden p-0 md:p-0">
                        {notifications.map((notification, index) => (
                          <div 
                            key={notification.idNotification}
                            className={clsx(
                              "relative p-4 md:p-5 lg:p-6",
                              !notification.isRead && "bg-blue-50/30 dark:bg-blue-900/5",
                              index !== notifications.length - 1 && "border-b border-gray-100 dark:border-[#2C2C38]"
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
                              </div>
                              
                              {!notification.isRead && (
                                <button
                                  disabled={markingAsRead === notification.idNotification}
                                  onClick={() => handleMarkAsRead(notification.idNotification)}
                                  className={clsx(
                                    "ml-2 inline-block px-4 py-2 text-xs font-medium rounded-full",
                                    "transition-all duration-150",
                                    markingAsRead === notification.idNotification
                                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-wait"
                                      : "bg-primary text-white"
                                  )}
                                >
                                  {markingAsRead === notification.idNotification ? 
                                    "Procesando..." : "Nuevo"
                                  }
                                </button>
                              )}
                            </div>
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