import React from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  updateInterval, 
  setUpdateInterval 
}) => {
  const { primaryColor } = usePrimaryColor();

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ top: 0, left: 0, right: 0, bottom: 0, position: 'fixed' }}>
      <div className="bg-white dark:bg-[#1C1C24] rounded-lg p-6 w-96 mx-4 relative z-[10000]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuración de Actualización
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Intervalo de actualización (minutos)
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              value={updateInterval}
              onChange={(e) => setUpdateInterval(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ '--tw-ring-color': primaryColor }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Rango: 5 minutos - 1440 minutos (24 horas)
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Próxima actualización en {updateInterval} minutos</span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizar en un portal para evitar problemas de z-index
  return createPortal(modalContent, document.body);
};

export default SettingsModal;