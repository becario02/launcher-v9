'use client';

import { createContext, useContext, useLayoutEffect, useState } from 'react';

const PrimaryColorContext = createContext();

export const PrimaryColorProvider = ({ children }) => {
  const [primaryColor, setPrimaryColorState] = useState(null);

  useLayoutEffect(() => {
    const savedColor = localStorage.getItem('primaryColor');
    const colorToApply = savedColor || '#0080FF'; // Default azul
    setPrimaryColorState(colorToApply);
    applyPrimaryColorToCSS(colorToApply);
  }, []);

  const applyPrimaryColorToCSS = (color) => {
    document.documentElement.style.setProperty('--primary-color', color);
  };

  const setPrimaryColor = (newColor) => {
    setPrimaryColorState(newColor);
    localStorage.setItem('primaryColor', newColor);
    applyPrimaryColorToCSS(newColor);
  };

  if (primaryColor === null) return null;

  return (
    <PrimaryColorContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </PrimaryColorContext.Provider>
  );
};

export const usePrimaryColor = () => useContext(PrimaryColorContext);
