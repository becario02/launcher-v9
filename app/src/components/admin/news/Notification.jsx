"use client";

import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function Notification({ 
  type = 'error', // 'error', 'success', 'info', 'warning'
  message = '', 
  visible = false,
  style = 'inline', // 'inline', 'toast'
  position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  duration = 4000, // tiempo en ms, 0 para que no desaparezca automáticamente
  onClose = () => {}
}) {
  const [isVisible, setIsVisible] = useState(visible);
  
  // Efecto para manejar la visibilidad
  useEffect(() => {
    setIsVisible(visible);
    
    // Configurar temporizador para ocultar la notificación
    let timer;
    if (visible && duration > 0) {
      timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, duration, onClose]);
  
  // Si no es visible, no renderizar nada
  if (!isVisible) return null;
  
  // Configurar colores según el tipo
  const colors = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-700',
      icon: <AlertCircle className="text-red-500" size={20} />
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-700',
      icon: <CheckCircle className="text-green-500" size={20} />
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-700',
      icon: <Info className="text-blue-500" size={20} />
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-700',
      icon: <AlertCircle className="text-yellow-500" size={20} />
    }
  };
  
  // Obtener configuración de color
  const { bg, border, text, icon } = colors[type] || colors.error;
  
  // Configurar posición para notificaciones toast
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };
  
  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  // Render según estilo
  if (style === 'inline') {
    return (
      <div className={`w-full border-l-4 ${border} ${bg} p-4 my-3 flex items-center justify-between animate-fadeIn relative z-[9999]`}>
        <div className="flex items-center">
          {icon}
          <span className={`ml-2 ${text}`}>{message}</span>
        </div>
        <button
          onClick={handleClose}
          className={`${text} hover:text-gray-900 focus:outline-none`}
        >
          <X size={16} />
        </button>
      </div>
    );
  }
  
  // Estilo toast
  return (
    <div className={`fixed ${positionClasses[position]} z-[9999] animate-slideIn`}>
      <div className={`shadow-lg rounded-lg border ${border} ${bg} p-4 min-w-[300px] max-w-md flex items-center justify-between`}>
        <div className="flex items-center">
          {icon}
          <span className={`ml-2 ${text}`}>{message}</span>
        </div>
        <button
          onClick={handleClose}
          className={`${text} hover:text-gray-900 focus:outline-none ml-3`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}