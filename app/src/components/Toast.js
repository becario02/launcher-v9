'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const timer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 300);
  };

  if (!shouldRender) return null;

  const styles = {
    success: {
      container: 'bg-white border-l-4 border-green-500',
      icon: 'text-green-500',
      progress: 'bg-green-500'
    },
    error: {
      container: 'bg-white border-l-4 border-red-500',
      icon: 'text-red-500',
      progress: 'bg-red-500'
    }
  };

  const currentStyle = styles[type];

  return (
    <div 
      className={`fixed bottom-4 right-4 flex items-start gap-3 p-4 rounded-lg shadow-lg
        transition-all duration-300 ease-in-out transform max-w-sm w-full
        ${currentStyle.container}
        ${isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }`}
    >
      <div className={`flex-shrink-0 ${currentStyle.icon}`}>
        {type === 'success' ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <XCircle className="w-6 h-6" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {type === 'success' ? 'Éxito' : 'Error'}
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
            transitionDuration: '3000ms',
            transitionTimingFunction: 'linear'
          }}
        />
      </div>
    </div>
  );
};

export default Toast;