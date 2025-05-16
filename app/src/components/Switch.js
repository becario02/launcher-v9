'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/theme'; // Importar el contexto de tema

const Switch = ({ 
  checked = false, 
  onChange, 
  disabled = false,
  size = 'default',
  label = null
}) => {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme(); // Obtener el tema directamente del contexto
  const [isChecked, setIsChecked] = useState(checked);
  
  // Actualizamos el estado local cuando cambia el prop checked
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  // Determinar dimensiones basadas en el tamaño (versión "gordita" y un poco más grande)
  const dimensions = {
    small: { width: 38, height: 20, circleSize: 16 },
    default: { width: 48, height: 26, circleSize: 20 },
    large: { width: 56, height: 30, circleSize: 24 }
  };
  
  const { width, height, circleSize } = dimensions[size] || dimensions.default;
  
  // Colores para un diseño minimalista
  const bgColorActive = primaryColor;
  const bgColorInactive = '#E5E7EB'; // gray-200
  const darkBgColorInactive = '#374151'; // gray-700

  const handleChange = () => {
    if (disabled) return;
    
    const newValue = !isChecked;
    setIsChecked(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        role="switch"
        aria-checked={isChecked}
        onClick={handleChange}
        className={`relative inline-flex flex-shrink-0 transition-colors duration-200 ease-in-out focus:outline-none ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          backgroundColor: isChecked 
            ? bgColorActive 
            : theme === 'dark' ? darkBgColorInactive : bgColorInactive, // Usar el tema del contexto
          borderRadius: `${height}px`,
          padding: '2px'
        }}
        disabled={disabled}
      >
        <span className="sr-only">{isChecked ? 'Activo' : 'Inactivo'}</span>
        <motion.span
          className="inline-block bg-white"
          initial={false}
          animate={{
            x: isChecked ? width - circleSize - 4 : 0, // -4 para manejar el padding
            transition: { type: 'spring', stiffness: 500, damping: 30 }
          }}
          style={{ 
            width: `${circleSize}px`, 
            height: `${circleSize}px`,
            borderRadius: `${circleSize}px`
          }}
        ></motion.span>
      </button>
      {label && (
        <span 
          className={`text-sm font-medium ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}
          onClick={!disabled ? handleChange : undefined}
          style={{ cursor: disabled ? 'default' : 'pointer' }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default Switch;