'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function ImageViewerModal({ 
  isOpen, 
  onClose, 
  imageSrc, 
  imageAlt = 'Imagen'
}) {
  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative z-50 max-w-4xl">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg transition-colors"
          title="Cerrar (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Imagen con tamaños máximos adaptativos */}
        <img
          src={imageSrc}
          alt={imageAlt}
          className="max-w-full max-h-96 object-contain rounded-lg shadow-2xl bg-white"
          onClick={(e) => e.stopPropagation()} // Prevenir cerrar al hacer clic en la imagen
        />
      </div>
    </div>
  );
}