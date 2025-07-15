'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { usePrimaryColor } from '@/context/primaryColor';
import clsx from 'clsx';

export default function PrimaryPacConfirmModal({ isOpen, pac, onClose, onConfirm }) {
  const { theme } = useTheme();
  const { primaryColor } = usePrimaryColor();
  const isDark = theme === 'dark';

  if (!isOpen || !pac) return null;

  const handleConfirm = () => {
    onConfirm(pac.idProvider);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-[#1C1C24] rounded-lg w-full max-w-sm shadow-xl relative font-poppins">
        {/* Header con icono y título */}
        <div className="flex items-center gap-3 p-6 pb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6" style={{ color: primaryColor }} />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Establecer PAC primario
          </h2>
        </div>

        {/* Contenido del modal */}
        <div className="px-6 pb-6">
          {/* Mensaje */}
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
            ¿Estás seguro de que deseas establecer{' '}
            <span className="font-medium" style={{ color: primaryColor }}>
              "{pac.name}"
            </span>
            {' '}como PAC primario?
          </p>

          {/* Usuario */}
          <p className="text-gray-500 dark:text-gray-500 text-xs mb-6">
            Usuario: <span className="text-gray-700 dark:text-gray-300">{pac.user}</span>
          </p>

          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className={clsx(
                "px-4 py-2 text-sm border rounded transition-all duration-200",
                "text-gray-700 bg-white border-gray-300 hover:bg-gray-50",
                "dark:text-gray-300 dark:bg-[#1C1C24] dark:border-gray-600 dark:hover:bg-gray-800"
              )}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm text-white rounded transition-all duration-200"
              style={{ backgroundColor: primaryColor }}
            >
              Establecer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}