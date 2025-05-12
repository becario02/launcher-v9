'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, X } from 'lucide-react';
import Cookies from 'js-cookie';
import { usePrimaryColor } from '@/context/primaryColor';
import { useNotifications } from '@/context/NotificationContext';

const NotificationBanner = () => {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { markNotificationAsRead } = useNotifications();

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
            pageSize: 10, 
            isRead: false 
          },
          headers: {
            'Accept-Language': 'es'
          }
        }
      );
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        setNotifications(response.data.data);
        setCurrentNotification(response.data.data[0]);
      } else {
        setNotifications([]);
        setCurrentNotification(null);
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      setNotifications([]);
      setCurrentNotification(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar cuando el usuario marca como leída una notificación
  const handleMarkAsRead = async (notificationId) => {
    try {
      // Usar la función del contexto para marcar como leída
      await markNotificationAsRead(notificationId);
      
      // Actualizar la interfaz local para mostrar la siguiente notificación
      const updatedNotifications = notifications.filter(
        (notif) => notif.idNotification !== notificationId
      );
      
      setNotifications(updatedNotifications);
      
      // Mostrar la siguiente notificación si existe
      if (updatedNotifications.length > 0) {
        setCurrentNotification(updatedNotifications[0]);
      } else {
        setCurrentNotification(null);
      }
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    fetchNotifications();
    
    // Configurar un intervalo para actualizar las notificaciones cada 2 minutos
    const interval = setInterval(fetchNotifications, 120000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !currentNotification) return null;

  // Formatear la hora de la notificación (si se necesita mostrar)
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} hrs`;
  };

  // Detectar si es una notificación de actualización de sistema
  const isSystemUpdate = currentNotification.category === 'SYSTEMUPDATE';

  return (
    <div 
      className="w-full text-white py-3 px-4 relative" 
      style={{ 
        backgroundColor: primaryColor
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell size={16} className="text-white" />
          <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
            <span className="text-sm font-medium">{currentNotification.title}</span>
            {isSystemUpdate && (
              <span className="text-xs text-gray-300 hidden md:inline">
                {formatTime(currentNotification.creationDate)}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-200 hidden md:inline truncate max-w-md">
            {currentNotification.description}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="text-xs font-medium px-3 py-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/30 transition"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }}
            onClick={() => handleMarkAsRead(currentNotification.idNotification)}
          >
            Entendido
          </button>
          <button 
            className="text-white hover:text-gray-300 transition focus:outline-none"
            onClick={() => handleMarkAsRead(currentNotification.idNotification)}
            aria-label="Cerrar notificación"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;