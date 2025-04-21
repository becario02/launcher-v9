'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ConfirmModal({
  isOpen,
  currentNews,
  confirmAction,
  handleCloseConfirmModal
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.classList.add('overflow-hidden');
    else document.body.classList.remove('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen]);

  if (!isOpen || !currentNews) return null;
  const isActive = currentNews.status === 'ACTIVE';

  const handleConfirmClick = async () => {
    setIsLoading(true);
    try {
      await confirmAction();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="
          bg-white dark:bg-gray-7
          rounded-xl shadow-xl w-full max-w-md overflow-hidden
          transform transition-all duration-300 animate-fadeIn my-4
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 flex justify-between items-center bg-primary-blue">
          <h2 className="text-base sm:text-lg font-medium text-white">
            Confirmar {isActive ? 'Desactivación' : 'Activación'}
          </h2>
          <button
            onClick={handleCloseConfirmModal}
            className="p-1 rounded-full text-white hover:text-primary-blue hover:bg-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-5 sm:py-6">
          <p className="mb-4 text-p sm:text-base text-gray-4 dark:text-gray-3">
            ¿Estás seguro que deseas {isActive ? 'desactivar' : 'activar'} la noticia{' '}
            <span className="font-medium">&quot;{currentNews.title}&quot;</span>?
          </p>
          <div className="p-3 rounded-lg border bg-gray-1 border-gray-2 dark:bg-gray-8 dark:border-gray-6">
            <p className="text-p-small sm:text-p text-gray-4 dark:text-gray-3">
              {isActive
                ? 'La noticia ya no será visible para los usuarios.'
                : 'La noticia será visible nuevamente para todos los usuarios.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t flex justify-end gap-3 bg-gray-1 border-gray-2 dark:bg-gray-8 dark:border-gray-6">
          {/* Cancelar */}
          <button
            onClick={handleCloseConfirmModal}
            disabled={isLoading}
            className="
              px-3 sm:px-4 py-2 text-p sm:text-p border rounded-full
              text-semantic.red bg-white hover:bg-gray-1 transition-all duration-200 shadow-sm transform hover:-translate-y-0.5
              dark:text-semantic.red dark:bg-gray-7 dark:border-semantic.red dark:hover:bg-gray-6
            "
          >
            Cancelar
          </button>

          {/* Confirmar */}
          <button
            onClick={handleConfirmClick}
            disabled={isLoading}
            className={`
              px-3 sm:px-4 py-2 text-p sm:text-p text-white rounded-full transition-all duration-200
              transform hover:-translate-y-0.5 hover:shadow-md flex items-center justify-center
              ${isActive
                ? 'bg-semantic.red hover:bg-semantic.red-dark dark:bg-semantic.red dark:hover:bg-semantic.red-dark'
                : 'bg-semantic.green hover:bg-semantic.green-dark dark:bg-semantic.green dark:hover:bg-semantic.green-dark'
              }
            `}
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full" />
            ) : (
              isActive ? 'Desactivar' : 'Activar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
