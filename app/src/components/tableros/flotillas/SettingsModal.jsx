import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useDashboardReload } from '@/hooks/useDashboardReload';

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  updateInterval, 
  setUpdateInterval,
  lastUpdate,
  intervalChangeTime, // Receive from parent
  onIntervalChange // New prop to notify parent about interval changes
}) => {
  const { primaryColor } = usePrimaryColor();
  const { 
    getReloadTime, 
    updateReloadTime, 
    currentDashboardId 
  } = useDashboardReload();

  const [localInterval, setLocalInterval] = useState(updateInterval);
  const [isSaving, setIsSaving] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Calculate time remaining until next update
  useEffect(() => {
    if (!isOpen || !lastUpdate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      
      // Use intervalChangeTime if available (when interval was recently changed)
      // Otherwise use lastUpdate (when data was last fetched)
      const referenceTime = intervalChangeTime || lastUpdate.getTime();
      const nextUpdateTime = referenceTime + (updateInterval * 60 * 1000);
      const remaining = Math.max(0, nextUpdateTime - now);
      
      setTimeRemaining(Math.ceil(remaining / 1000)); // Convert to seconds
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isOpen, lastUpdate, updateInterval, intervalChangeTime]);

  // Load current reload time when modal opens
  useEffect(() => {
    if (isOpen && currentDashboardId) {
      const loadReloadTime = async () => {
        try {
          const reloadTime = await getReloadTime();
          setLocalInterval(reloadTime);
          setUpdateInterval(reloadTime);
        } catch (err) {
          console.error('Failed to load reload time:', err);
        }
      };
      
      loadReloadTime();
    }
  }, [isOpen, currentDashboardId, getReloadTime, setUpdateInterval]);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalInterval(updateInterval);
    }
  }, [isOpen, updateInterval]);

  const handleSave = async () => {
    if (localInterval < 1 || localInterval > 1440) {
      return;
    }

    try {
      setIsSaving(true);
      
      await updateReloadTime(localInterval);
      setUpdateInterval(localInterval);
      
      // Set the time when interval was changed to reset countdown
      const changeTime = new Date().getTime();
      
      // Notify parent component about the interval change
      if (onIntervalChange) {
        onIntervalChange(changeTime);
      }
      
      // Close modal after successful save
      onClose();
    } catch (err) {
      console.error('Error saving reload time:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalInterval(updateInterval);
    onClose();
  };

  const handleInputChange = (e) => {
    const value = Number(e.target.value);
    setLocalInterval(value);
  };

  // Format time remaining for display
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return 'Actualizando...';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ top: 0, left: 0, right: 0, bottom: 0, position: 'fixed' }}>
      <div className="bg-white dark:bg-[#1C1C24] rounded-lg p-6 w-96 mx-4 relative z-[10000]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuración de Actualización
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
            disabled={isSaving}
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
              min="1"
              max="1440"
              value={localInterval}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-lg bg-white dark:bg-[#1C1C24] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ '--tw-ring-color': primaryColor }}
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Rango: 1 minuto - 1440 minutos (24 horas)
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>
              {lastUpdate ? (
                timeRemaining > 0 ? 
                  `Próxima actualización en ${formatTimeRemaining(timeRemaining)}` :
                  'Actualizando datos...'
              ) : (
                `Los datos se actualizarán cada ${localInterval} minuto${localInterval !== 1 ? 's' : ''}`
              )}
            </span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || localInterval < 1 || localInterval > 1440}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizar en un portal para evitar problemas de z-index
  return createPortal(modalContent, document.body);
};

export default SettingsModal;