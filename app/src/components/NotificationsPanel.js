'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNotifications } from '@/context/NotificationContext';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { panelRefresh } = useNotifications();

  // Obtener el ID de usuario de las cookies
  const userId = Cookies.get('idUser') || '2'; // Fallback a 2 si no hay cookie

  // Función para obtener las notificaciones no leídas
  const fetchNotifications = async () => {
    setIsLoading(true);
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
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar notificaciones al montar el componente y cuando cambie panelRefresh
  useEffect(() => {
    fetchNotifications();
    
    // Configurar un intervalo para actualizar las notificaciones cada 2 minutos
    const interval = setInterval(fetchNotifications, 120000);
    
    return () => clearInterval(interval);
  }, [panelRefresh]); // Añadir panelRefresh como dependencia para que se actualice cuando cambie

  // Función para obtener la ruta del icono y el color de fondo según la categoría
  const getNotificationStyles = (category) => {
    switch (category) {
      case 'SYSTEMUPDATE':
        return {
          icon: '/assets/notifications/icon-alerta.svg',
          bgColor: '#ff000019'
        };
      case 'NEWVIDEO':
        return {
          icon: '/assets/notifications/icon-play.svg',
          bgColor: '#0080ff19'
        };
      case 'NEWARTICLE':
        return {
          icon: '/assets/notifications/icon-news.svg',
          bgColor: '#0a910119'
        };
      default:
        return {
          icon: '/assets/notifications/icon-medalla.svg',
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

  return (
    <section className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-xl p-5 shadow-md h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] leading-[24px] md:text-[14px] md:leading-[21px] font-medium text-black dark:text-gray-200 font-poppins">
          Mis notificaciones
        </h3>
        <Link href="/notifications">
          <button className="text-[14px] leading-[20px] md:text-[12px] md:leading-[18px] font-medium text-black dark:text-gray-200 hover:underline font-poppins">
            Ver más
          </button>
        </Link>
      </div>

      {/* Lista de notificaciones */}
      <div className="flex flex-col flex-1 gap-4 md:gap-2">
        {isLoading ? (
          // Skeleton loading state
          <>
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-start gap-4 md:gap-3 min-h-[64px] md:min-h-[48px]">
                <div className="w-[36px] h-[36px] md:w-[28px] md:h-[28px] bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-[15px] md:h-[12px] bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-[13px] md:h-[10px] bg-gray-100 dark:bg-gray-800 rounded w-full mb-1 animate-pulse"></div>
                  <div className="h-[10px] md:h-[8px] bg-gray-100 dark:bg-gray-800 rounded w-1/4 mt-1 animate-pulse"></div>
                </div>
              </div>
            ))}
          </>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[14px] text-gray-500 dark:text-gray-400">
              No tienes notificaciones sin leer
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const { icon, bgColor } = getNotificationStyles(notification.category);
            return (
              <div
                key={notification.idNotification}
                className="flex items-start gap-4 md:gap-3 min-h-[64px] md:min-h-[48px]"
              >
                <div
                  className="w-[36px] h-[36px] md:w-[28px] md:h-[28px] flex items-center justify-center rounded-md shrink-0"
                  style={{ backgroundColor: bgColor }}
                >
                  <Image
                    src={icon}
                    alt="icono"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>

                <div className="flex-1 overflow-hidden">
                  <h4 className="text-[15px] leading-[22px] md:text-[12px] md:leading-[18px] font-medium text-[#171725] dark:text-gray-200 font-poppins truncate">
                    {notification.title}
                  </h4>
                  <p className="text-[13px] leading-[19px] md:text-[10px] md:leading-[15px] text-[#92929d] dark:text-gray-400 font-poppins truncate">
                    {notification.description}
                  </p>
                  <p className="text-[10px] leading-[15px] md:text-[8px] md:leading-[12px] text-[#92929d] dark:text-gray-500 font-poppins mt-1">
                    {formatDate(notification.creationDate)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default NotificationsPanel;