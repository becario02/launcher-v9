'use client';

import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  // Inicializamos con un valor neutro
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Este useEffect se ejecuta una vez en el cliente
  useEffect(() => {
    setMounted(true);
    // Detectamos el tema actual en base a la clase del documento
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Actualizamos la clase en el documento HTML
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0B0B10'; // Tu color dark
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
    }
    
    // Guardamos la preferencia
    localStorage.setItem('theme', newTheme);
  };

  // Si no está montado todavía, renderizamos el contenido sin manipular el tema
  // Esto evita errores de hidratación
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}