'use client';

import { useState } from 'react';

export const useModuleRequest = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleModuleClick = async (moduleId, moduleName) => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3002/notepad/open', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setToast({ 
        type: 'success', 
        message: `${moduleName} abierto correctamente` 
      });
      return data;
      
    } catch (error) {
      console.error('Error al hacer la petición:', error);
      setToast({ 
        type: 'error', 
        message: `Error al abrir ${moduleName}: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const closeToast = () => setToast(null);

  return {
    handleModuleClick,
    loading,
    toast,
    closeToast
  };
};