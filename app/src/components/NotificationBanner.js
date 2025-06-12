'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import Cookies from 'js-cookie';
import { usePrimaryColor } from '@/context/primaryColor';
import { useNotifications } from '@/context/NotificationContext';

const NotificationBanner = () => {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [truncatedDescription, setTruncatedDescription] = useState('');
  const [windowWidth, setWindowWidth] = useState(0);
  const descriptionRef = useRef(null);
  const { primaryColor } = usePrimaryColor();
  const { markNotificationAsRead, bannerRefresh } = useNotifications();

  // Obtener el ID de usuario de las cookies
  const userId = Cookies.get('idUser')

  // Actualizar el ancho de la ventana
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // Establecer el ancho inicial
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Truncar la descripción basado en el ancho de la pantalla
  useEffect(() => {
    if (!currentNotification) return;
    
    const truncateText = (text, maxLength) => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };
    
    // Definir longitud máxima según el ancho de la pantalla
    let maxLength;
    if (windowWidth < 640) { // móvil
      maxLength = 0; // No mostrar en móvil
    } else if (windowWidth < 768) { // tablet pequeña
      maxLength = 30;
    } else if (windowWidth < 1024) { // tablet/laptop
      maxLength = 60;
    } else if (windowWidth < 1280) { // laptop/desktop
      maxLength = 100;
    } else { // pantallas grandes
      maxLength = 150;
    }
    
    // Aplicar truncado
    if (maxLength > 0) {
      setTruncatedDescription(truncateText(currentNotification.description, maxLength));
    } else {
      setTruncatedDescription('');
    }
  }, [currentNotification, windowWidth]);

  // Función para obtener las notificaciones no leídas
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        '/api/notificaciones',
        {
          params: { 
            userId,
            page: 1, 
            pageSize: 10, 
            isRead: false 
          },
          headers: {
            'Accept-Language': 'es-MX'
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
  }, [bannerRefresh]);

  if (isLoading || !currentNotification) return null;

  return (
    <div 
      className="w-full text-white py-3 px-12 relative" 
      style={{ 
        backgroundColor: primaryColor
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 flex-grow">
          <Bell size={16} className="text-white shrink-0" />
          <div className="flex flex-col md:flex-row md:items-center w-full">
            <span className="text-sm font-medium whitespace-nowrap mr-4">{currentNotification.title}</span>
            <span ref={descriptionRef} className="text-xs text-gray-200 hidden md:inline">
              {truncatedDescription || currentNotification.description}
            </span>
          </div>
        </div>
        <div className="flex items-center ml-3 shrink-0">
          <button
            className="text-xs font-medium px-3 py-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/30 transition"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }}
            onClick={() => handleMarkAsRead(currentNotification.idNotification)}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;