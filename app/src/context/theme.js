'use client';
import { createContext, useContext, useLayoutEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Inicializamos en null para no asumir un tema antes de leer localStorage
  const [theme, setThemeState] = useState(null);

  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    // Definimos el tema que se debe aplicar
    const themeToApply = savedTheme === 'dark' ? 'dark' : 'light';
    setThemeState(themeToApply);
    
    // Aplicamos o removemos la clase "dark" de manera inmediata
    if (themeToApply === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Actualizamos la clase en el elemento <html>
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Mientras no se determine el tema, no renderizamos nada para evitar el flash
  if (theme === null) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
