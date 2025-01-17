'use client'

import { useState } from 'react';

export const useModuleRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleModuleClick = async (moduleId) => {
    try {
      setLoading(true);
      setError(null);
      
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
      console.log('Respuesta del servidor:', data);
      return data;
      
    } catch (error) {
      setError(error.message);
      console.error('Error al hacer la petición:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleModuleClick,
    loading,
    error,
  };
};