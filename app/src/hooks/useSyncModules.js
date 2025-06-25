import { useState, useCallback, useRef } from 'react';
import { useCompany } from "@/context/CompanyContext";

export const useSyncModules = () => {
  const USERNAME = process.env.NEXT_PUBLIC_MSERPSERVICE_USERNAME;
  const PASSWORD = process.env.NEXT_PUBLIC_MSERPSERVICE_PASSWORD;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedCompany } = useCompany();

  // ✅ REF PARA CONTROLAR REQUESTS CONCURRENTES
  const activeRequestRef = useRef(null);

  // Funciones estables con useCallback
  const login = useCallback(async (urlErp) => {
    try {
      const response = await fetch(`${urlErp}/mserpservice/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: USERNAME,
          password: PASSWORD
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
      return null;
    }

    const requestId = Date.now(); // ID único para este request
    activeRequestRef.current = requestId;

    setIsLoading(true);
    setError(null);

    try {
      let token = await login(company.urlErp);
      
      if (!token) {
        throw new Error('No se pudo obtener token de autenticación');
      }

      const payload = {
        urlErp: company.urlErp,
        idUserCompanyConnection: company.idUserCompanyConnection,
        accessToken: token,
        Server_Erp_Db: selectedCompany.serverErpDb,
        Name_Erp_Db: selectedCompany.nameErpDb,
        User_Erp_Db: selectedCompany.userErpDb,
        Password_Erp_Db: decodedPassword
      };

      let response = await fetch('/api/sync-company-modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept-Language': 'es-MX'
        },
        body: JSON.stringify(payload)
      });

      // ✅ VERIFICAR SI ESTE REQUEST FUE CANCELADO
      if (activeRequestRef.current !== requestId) {
        return null;
      }

      if (response.status === 401 || response.status === 404) {
        
        token = await refreshToken(company.urlErp);
        if (!token) {
          throw new Error('Error al refrescar token');
        }

      const base64Password = selectedCompany.passwordErpDb;
      const decodedPassword = atob(base64Password);

        response = await fetch('/api/sync-company-modules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept-Language': 'es-MX'
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
        return null;
      }
      
      if (data.statusCode === '200') {
      } else {
      }
      
      return data;

    } catch (err) {
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
      activeRequestRef.current = null;
      setIsLoading(false);
    }
  }, []);

  return {
    syncModules,
    isLoading,
    error,
    cancelPendingRequests
  };
};