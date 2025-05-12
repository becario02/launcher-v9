'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

// Crear el contexto
const NotificationContext = createContext();

// Hook personalizado para usar el contexto
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }
  return context;
};

// Proveedor del contexto
export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Obtener el ID de usuario de las cookies
  const userId = Cookies.get('idUser') || '2'; // Fallback a 2 si no hay cookie

  // Función para obtener el conteo de notificaciones no leídas
  const fetchUnreadCount = async () => {
    setIsLoadingCount(true);
    try {
      const response = await axios.get(
        `http://localhost:5173/mslauncher/api/v1/notifications/user/${userId}/unread/count`,
        {
          headers: {
            'Accept-Language': 'es'
          }
        }
      );
      
      if (response.data && response.data.data) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Error al obtener conteo de notificaciones:', error);
    } finally {
      setIsLoadingCount(false);
    }
  };

  // Función para marcar una notificación como leída
  const markNotificationAsRead = async (notificationId) => {
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
      
      // Actualizar el contador inmediatamente (optimista)
      if (unreadCount > 0) {
        setUnreadCount(prev => prev - 1);
      }
      
      // Refrescar para asegurarnos que el contador esté sincronizado
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      // Si hay error, refrescar para obtener el contador actualizado
      fetchUnreadCount();
    }
  };

  // Función para forzar una actualización
  const refreshUnreadCount = () => {
    setLastRefresh(Date.now());
  };

  // Efecto para cargar el conteo inicial y configurar intervalos
  useEffect(() => {
    fetchUnreadCount();
    
    // Configurar un intervalo para actualizar el conteo cada 1 minuto
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Efecto para recargar cuando se solicita explícitamente
  useEffect(() => {
    fetchUnreadCount();
  }, [lastRefresh]);

  const value = {
    unreadCount,
    isLoadingCount,
    markNotificationAsRead,
    refreshUnreadCount,
    lastRefresh
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;