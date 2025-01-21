'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const useModuleRequest = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const formatUrlName = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9]+/g, '-')     // Reemplazar caracteres especiales por guiones
      .replace(/^-+|-+$/g, '');        // Remover guiones al inicio y final
  };

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

      // Navegar usando el nombre formateado
      const urlName = formatUrlName(moduleName);
      setTimeout(() => {
        router.push(`/modulos/${urlName}`);
      }, 1000);

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