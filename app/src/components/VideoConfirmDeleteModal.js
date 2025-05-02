'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { usePrimaryColor } from '@/context/primaryColor';
import clsx from 'clsx';

export default function VideoConfirmDeleteModal({ isOpen, video, onClose, onConfirm }) {
  const { theme } = useTheme();
  const { primaryColor } = usePrimaryColor();
  const isDark = theme === 'dark';

  if (!isOpen || !video) return null;

  const handleConfirm = () => {
    onConfirm(video.idVideo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-[#1C1C24] rounded-xl w-full max-w-md shadow-xl relative font-poppins">
        {/* Botón cerrar */}
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" 
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contenido del modal */}
        <div className="p-6">
          {/* Ícono de advertencia */}
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
            Confirmar eliminación
          </h2>

          {/* Mensaje */}
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            ¿Estás seguro de que deseas eliminar el video{' '}
            <span className="font-medium text-gray-900 dark:text-white">"{video.title}"</span>?
            <br />
            <span className="text-sm">Esta acción no se puede deshacer.</span>
          </p>

          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className={clsx(
                "px-4 py-2 text-sm border rounded-md transition-all duration-200",
                "text-gray-700 bg-white border-gray-300 hover:bg-gray-50",
                "dark:text-gray-300 dark:bg-[#1C1C24] dark:border-gray-600 dark:hover:bg-gray-800"
              )}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className={clsx(
                "px-4 py-2 text-sm text-white rounded-md transition-all duration-200",
                "bg-red-600 hover:bg-red-700",
                "dark:bg-red-600 dark:hover:bg-red-700"
              )}
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}