'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Video, FileText, HelpCircle } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useNotifications } from '@/context/NotificationContext';

const NotificationsPopup = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { refreshUnreadCount } = useNotifications();

  // Obtener el ID de usuario de las cookies
  const userId = Cookies.get('idUser') || '2'; // Fallback a 2 si no hay cookie

  // Función para obtener las notificaciones no leídas
  const fetchNotifications = async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5173/mslauncher/api/v1/notifications/user/${userId}`,
        {
          params: { 
            page: 1, 
            pageSize: 4, 
            isRead: false 
          },
          headers: {
            'Accept-Language': 'es'
          }
        }
      );
      
      if (response.data && response.data.data) {
        setNotifications(response.data.data.slice(0, 4)); // Tomar solo las primeras 4
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timers = [];
    if (isOpen) {
      setMounted(true);
      timers.push(setTimeout(() => setShowAnimation(true), 50));
      fetchNotifications();
    } else {
      setShowAnimation(false);
      timers.push(setTimeout(() => setMounted(false), 200));
      // Refrescar el conteo cuando se cierra el popup
      refreshUnreadCount();
    }
    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  // Obtener icono y color de fondo según la categoría
  const getNotificationStyles = (category) => {
    switch (category) {
      case 'SYSTEMUPDATE':
        return {
          icon: <RefreshCw size={20} className="text-red-500" />,
          bgColor: '#ff000019'
        };
      case 'NEWVIDEO':
        return {
          icon: <Video size={20} className="text-blue-500" />,
          bgColor: '#0080ff19'
        };
      case 'NEWARTICLE':
        return {
          icon: <FileText size={20} className="text-green-500" />,
          bgColor: '#0a910119'
        };
      default:
        return {
          icon: <HelpCircle size={20} className="text-gray-500" />,
          bgColor: '#ff740d19'
        };
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch (e) {
      return '';
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Click-outside close */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className={`fixed top-0 right-0 mt-[110px] mr-4 sm:mr-4 md:mr-36 w-[292px] h-[351px] 
          bg-white dark:bg-[#1C1C24] rounded-2xl shadow-xl border border-gray-100 dark:border-[#2C2C38] 
          z-50 transition-all duration-200
          ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      >
        <div className="p-5 h-full flex flex-col justify-between">
          {/* Header */}
          <h3 className="text-[14px] leading-[21px] font-medium text-black dark:text-gray-200 font-poppins">
            Mis notificaciones
          </h3>

          {/* Notificaciones */}
          <div className="flex flex-col gap-y-[20px] py-2 overflow-auto flex-1">
            {loading ? (
              // Skeleton loading state
              <>
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-start gap-3 min-h-[36px]">
                    <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-[14px] bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                      <div className="h-[10px] bg-gray-100 dark:bg-gray-800 rounded w-full mb-1 animate-pulse"></div>
                      <div className="h-[8px] bg-gray-100 dark:bg-gray-800 rounded w-1/4 mt-1 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[12px] text-gray-500 dark:text-gray-400">
                  No tienes notificaciones sin leer
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const { icon, bgColor } = getNotificationStyles(notification.category);
                return (
                  <div key={notification.idNotification} className="flex items-start gap-3 min-h-[36px]">
                    <div
                      className="w-9 h-9 flex items-center justify-center rounded-md shrink-0"
                      style={{ backgroundColor: bgColor }}
                    >
                      {icon}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-[12px] leading-[18px] font-medium text-[#171725] dark:text-gray-200 font-poppins truncate">
                        {notification.title}
                      </h4>
                      <p className="text-[10px] leading-[15px] text-[#92929d] dark:text-gray-400 font-poppins truncate">
                        {notification.description}
                      </p>
                      <p className="text-[8px] leading-[12px] text-[#92929d] dark:text-gray-500 font-poppins mt-1">
                        {formatDate(notification.creationDate)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="pt-2">
            <Link href="/notifications">
              <button 
                onClick={onClose}
                className="w-full border border-gray-300 dark:border-[#3A3A46] text-[12px] font-medium text-[#171725] dark:text-gray-200 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2C2C38] transition font-poppins"
              >
                Ver todas las notificaciones
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPopup;