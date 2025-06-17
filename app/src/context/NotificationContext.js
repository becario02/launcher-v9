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
  const [bannerRefresh, setBannerRefresh] = useState(Date.now());
  const [panelRefresh, setPanelRefresh] = useState(Date.now());

  const userId = Cookies.get('idUser');

  // Función para obtener el conteo de notificaciones no leídas
  const fetchUnreadCount = async () => {
    setIsLoadingCount(true);
    try {
      const response = await axios.get('/api/notifications/unread-count', {
          params: { userId },
          headers: {
            'Accept-Language': 'es-MX'
          }
      });
      
      if (response.data && response.data.data) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
    } finally {
      setIsLoadingCount(false);
    }
  };

  // Función para marcar una notificación como leída
  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.post('/api/notifications/read', {}, {
        params: {
          notificationId,
          userId
        },
        headers: {
          'Accept-Language': 'es-MX'
        }
      });
      
      // Actualizar el contador inmediatamente (optimista)
      if (unreadCount > 0) {
        setUnreadCount(prev => prev - 1);
      }
      
      // Refrescar el banner y el panel
      setBannerRefresh(Date.now());
      setPanelRefresh(Date.now());
    } catch (error) {
      fetchUnreadCount();
    }
  };

  // Función para forzar una actualización del contador
  const refreshUnreadCount = () => {
    fetchUnreadCount();
  };

  // Función para forzar actualización del panel de notificaciones
  const refreshNotificationPanel = () => {
    setPanelRefresh(Date.now());
  };

  // Función para forzar actualización del banner de notificaciones
  const refreshNotificationBanner = () => {
    setBannerRefresh(Date.now());
  };

  // Efecto para cargar el conteo inicial y configurar intervalos
  useEffect(() => {
    fetchUnreadCount();
    
    // Configurar un intervalo para actualizar el conteo cada 1 minuto
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const value = {
    unreadCount,
    isLoadingCount,
    markNotificationAsRead,
    refreshUnreadCount,
    refreshNotificationPanel,
    refreshNotificationBanner,
    bannerRefresh,
    panelRefresh
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;