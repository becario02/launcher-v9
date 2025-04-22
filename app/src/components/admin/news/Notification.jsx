'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function Notification({
  type = 'error',    // 'error', 'success', 'info', 'warning'
  message = '',
  visible = false,
  style = 'toast',   // 'inline', 'toast'
  position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  duration = 3000,   // ms, 0 = stay visible
  onClose = () => {}
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      // Pequeño retraso para permitir que el componente se monte antes de mostrarlo
      requestAnimationFrame(() => {
        setIsVisible(true);
      });

      // Configurar temporizador para cerrar automáticamente
      let timer;
      if (duration > 0) {
        timer = setTimeout(() => {
          handleClose();
        }, duration);
      }
      return () => {
        if (timer) clearTimeout(timer);
      };
    } else {
      handleClose();
    }
  }, [visible, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 300);
  };

  if (!shouldRender) return null;

  // Obtenemos el icono según el tipo
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6" />;
      case 'info':
        return <Info className="w-6 h-6" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6" />;
      case 'error':
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  // Estilos según el tipo
  const styles = {
    success: {
      container: 'bg-white border-l-4 border-green-500',
      icon: 'text-green-500',
      progress: 'bg-green-500',
      title: 'Éxito'
    },
    error: {
      container: 'bg-white border-l-4 border-red-500',
      icon: 'text-red-500',
      progress: 'bg-red-500',
      title: 'Error'
    },
    info: {
      container: 'bg-white border-l-4 border-blue-500',
      icon: 'text-blue-500',
      progress: 'bg-blue-500',
      title: 'Información'
    },
    warning: {
      container: 'bg-white border-l-4 border-yellow-500',
      icon: 'text-yellow-500',
      progress: 'bg-yellow-500',
      title: 'Advertencia'
    }
  };

  const currentStyle = styles[type] || styles.error;

  // Clases para la posición
  const positionClasses = {
    'top-right': 'top-28 right-12',
    'top-left': 'top-28 left-12',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };
  
  const positionClass = positionClasses[position] || positionClasses['top-right'];

  if (style === 'inline') {
    // Estilo inline para usar dentro de formularios o secciones
    return (
      <div 
        className={`flex items-start gap-3 p-4 rounded-lg my-3 w-full shadow-sm
          ${currentStyle.container}
          transition-all duration-300 ease-in-out transform
          ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className={`flex-shrink-0 ${currentStyle.icon}`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {currentStyle.title}
          </p>
          <p className="mt-1 text-sm text-gray-500 break-words">
            {message}
          </p>
        </div>

        <button 
          onClick={handleClose}
          className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity text-gray-400 hover:text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Estilo toast para notificaciones flotantes
  return (
    <div 
      className={`fixed ${positionClass} flex items-start gap-3 p-4 rounded-lg shadow-lg
        transition-all duration-300 ease-in-out transform max-w-sm w-full z-[70]
        ${currentStyle.container}
        ${isVisible 
          ? 'translate-x-0 opacity-100' 
          : position.includes('right') 
            ? 'translate-x-full opacity-0' 
            : 'translate-x-[-100%] opacity-0'
        }`}
    >
      <div className={`flex-shrink-0 ${currentStyle.icon}`}>
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {currentStyle.title}
        </p>
        <p className="mt-1 text-sm text-gray-500 break-words">
          {message}
        </p>
      </div>

      <button 
        onClick={handleClose}
        className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity text-gray-400 hover:text-gray-500"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-lg">
        <div 
          className={`h-full ${currentStyle.progress} transition-all duration-300`}
          style={{
            width: isVisible ? '0%' : '100%',
            transitionDuration: `${duration}ms`,
            transitionTimingFunction: 'linear'
          }}
        />
      </div>
    </div>
  );
}