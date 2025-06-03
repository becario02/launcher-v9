// hooks/useSyncModules.js - Versión mejorada
import { useState, useCallback, useRef } from 'react';

export const useSyncModules = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ REF PARA CONTROLAR REQUESTS CONCURRENTES
  const activeRequestRef = useRef(null);

  // Funciones estables con useCallback
  const login = useCallback(async (urlErp) => {
    try {
      const response = await fetch(`${urlErp}/mserpservice/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'Hola'
        })
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      return data.accessToken;
    } catch (err) {
      console.error('Error en login:', err);
      return null;
    }
  }, []);

  const refreshToken = useCallback(async (urlErp) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await fetch(`${urlErp}/mserpservice/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) throw new Error('Refresh failed');

      const data = await response.json();
      localStorage.setItem('token', data.token);
      
      return data.token;
    } catch (err) {
      console.error('Error al refrescar token:', err);
      return null;
    }
  }, []);

  // ✅ FUNCIÓN PRINCIPAL MEJORADA CON CONTROL DE CONCURRENCIA
  const syncModules = useCallback(async (company) => {
    if (!company || !company.urlErp || !company.idUserCompanyConnection) {
      setError('Datos de empresa incompletos');
      return null;
    }

    // ✅ PREVENIR MÚLTIPLES REQUESTS SIMULTÁNEOS
    if (isLoading || activeRequestRef.current) {
      console.log('⏳ Sincronización ya en progreso, omitiendo request duplicado...');
      return null;
    }

    const requestId = Date.now(); // ID único para este request
    activeRequestRef.current = requestId;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Obteniendo token para:', company.name);
      let token = await login(company.urlErp);
      
      if (!token) {
        throw new Error('No se pudo obtener token de autenticación');
      }

      const payload = {
        urlErp: company.urlErp,
        idUserCompanyConnection: company.idUserCompanyConnection,
        accessToken: token
      };

      console.log('🔄 Sincronizando módulos para:', company.name);
      console.log('🆔 Request ID:', requestId);

      let response = await fetch('http://localhost:5173/mslauncher/api/v1/SyncCompanyModules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept-Language': 'es-MX' // ✅ AGREGAR HEADER REQUERIDO
        },
        body: JSON.stringify(payload)
      });

      // ✅ VERIFICAR SI ESTE REQUEST FUE CANCELADO
      if (activeRequestRef.current !== requestId) {
        console.log('🚫 Request cancelado (otro más reciente en progreso)');
        return null;
      }

      if (response.status === 401 || response.status === 404) {
        console.log('🔄 Token expirado, refrescando...');
        
        token = await refreshToken(company.urlErp);
        if (!token) {
          throw new Error('Error al refrescar token');
        }

        response = await fetch('http://localhost:5173/mslauncher/api/v1/SyncCompanyModules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept-Language': 'es-MX' // ✅ AGREGAR HEADER REQUERIDO
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Error al sincronizar tras refrescar token');
        }
      } else if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // ✅ VERIFICAR NUEVAMENTE SI EL REQUEST FUE CANCELADO
      if (activeRequestRef.current !== requestId) {
        console.log('🚫 Request completado pero cancelado (otro más reciente)');
        return null;
      }
      
      if (data.statusCode === '200') {
        console.log('✅ Módulos sincronizados exitosamente para:', company.name);
      } else {
        console.warn('⚠️ Problema en sincronización:', data.message);
      }
      
      return data;

    } catch (err) {
      console.error('❌ Error sincronizando módulos:', err);
      setError(err.message);
      return null;
    } finally {
      // ✅ LIMPIAR SOLO SI ES EL REQUEST ACTIVO
      if (activeRequestRef.current === requestId) {
        setIsLoading(false);
        activeRequestRef.current = null;
      }
    }
  }, [login, refreshToken, isLoading]);

  // ✅ FUNCIÓN PARA CANCELAR REQUESTS PENDIENTES
  const cancelPendingRequests = useCallback(() => {
    if (activeRequestRef.current) {
      console.log('🚫 Cancelando request pendiente:', activeRequestRef.current);
      activeRequestRef.current = null;
      setIsLoading(false);
    }
  }, []);

  return {
    syncModules,
    isLoading,
    error,
    cancelPendingRequests // ✅ Nueva función para cancelar
  };
};