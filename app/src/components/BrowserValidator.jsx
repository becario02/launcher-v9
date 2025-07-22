'use client';

import { useState, useEffect } from 'react';
import UnsupportedBrowserScreen from './UnsupportedBrowserScreen';

const BrowserValidator = ({ children }) => {
  const [isValidBrowser, setIsValidBrowser] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectBrowser = () => {
      // Detectar si es Chrome
      const isChrome = () => {
        const userAgent = navigator.userAgent;
        const vendor = navigator.vendor;
        
        // Verificar que sea Chrome y no otros navegadores basados en Chromium
        return (
          userAgent.includes('Chrome') &&
          vendor.includes('Google Inc.') &&
          !userAgent.includes('Edg') && // No Microsoft Edge
          !userAgent.includes('OPR') && // No Opera
          !userAgent.includes('Samsung') // No Samsung Internet
        );
      };

      const validBrowser = isChrome();
      setIsValidBrowser(validBrowser);
      setIsLoading(false);
    };

    // Pequeño delay para evitar flash en la carga
    const timer = setTimeout(detectBrowser, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Mostrar loading mientras detecta
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no es un navegador válido, mostrar pantalla de error
  if (!isValidBrowser) {
    return <UnsupportedBrowserScreen />;
  }

  // Si es Chrome, renderizar la aplicación normal
  return children;
};

export default BrowserValidator;