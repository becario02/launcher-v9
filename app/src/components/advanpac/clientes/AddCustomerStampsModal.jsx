'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { X, Package, Plus, AlertCircle, Calendar } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

export default function AddCustomerStampsModal({ 
  isOpen, 
  cliente,
  onClose, 
  onSubmit
}) {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    selectedProvider: '',
    count: '',
    buyDate: new Date().toISOString().split('T')[0] // Fecha actual por defecto
  });

  // Estados de UI
  const [errors, setErrors] = useState({});

  // Cargar proveedores cuando se abre el modal
  useEffect(() => {
    if (isOpen && cliente) {
      fetchProviders();
      setFormData({
        selectedProvider: '',
        count: '',
        buyDate: new Date().toISOString().split('T')[0]
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, cliente]);

  // Función para cargar proveedores (PACs) activos
  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/advanpac/pacs');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const data = Array.isArray(result) ? result : (result.data || []);
      
      // Filtrar solo PACs activos
      const activeProviders = data.filter(pac => pac.status === 'ACTIVE');
      setProviders(activeProviders);
      
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Limpiar errores del servidor
    if (errors.server) {
      setErrors(prev => ({
        ...prev,
        server: undefined
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.selectedProvider) {
      newErrors.selectedProvider = 'Debe seleccionar un proveedor';
    }

    if (!formData.count || formData.count <= 0) {
      newErrors.count = 'La cantidad debe ser mayor a 0';
    }

    if (!formData.buyDate) {
      newErrors.buyDate = 'La fecha de compra es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Crear nuevo paquete de timbres para el cliente
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/advanpac/customer-stamps/add-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          IdProvider: parseInt(formData.selectedProvider),
          IdCustomer: cliente.idCustomerAdvanPac,
          count: parseInt(formData.count),
          buyDate: formData.buyDate
        })
      });

      const result = await response.json();

      if (response.ok && result.idStampPackage) {
        onSubmit({
          success: true,
          message: `Paquete de ${result.count} timbres agregado exitosamente al cliente "${cliente.name}"`
        });
        
        handleClose();
      } else {
        setErrors({ 
          server: result.message || 'Error al crear el paquete de timbres'
        });
      }
    } catch (error) {
      console.error('Error al crear paquete:', error);
      setErrors({ 
        server: 'Error de conexión al crear el paquete' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        selectedProvider: '',
        count: '',
        buyDate: new Date().toISOString().split('T')[0]
      });
      setErrors({});
      setIsSubmitting(false);
      onClose();
    }
  };

  if (!isOpen || !cliente) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      <div className="relative bg-white dark:bg-[#1C1C24] rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Agregar Timbres al Cliente
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Cliente: <span className="font-medium">{cliente.name}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#2C2C38] rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            
            {/* Selector de Proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proveedor (PAC) *
              </label>
              {isLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-gray-50 dark:bg-[#2C2C38] flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Cargando proveedores...</span>
                </div>
              ) : (
                <select
                  name="selectedProvider"
                  value={formData.selectedProvider}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={clsx(
                    "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                    errors.selectedProvider
                      ? "border-red-300 dark:border-red-500"
                      : "border-gray-300 dark:border-[#2C2C38]"
                  )}
                  style={!errors.selectedProvider ? { '--tw-ring-color': primaryColor } : {}}
                >
                  <option value="">Seleccionar proveedor</option>
                  {providers.map((provider) => (
                    <option key={provider.idProvider} value={provider.idProvider}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.selectedProvider && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.selectedProvider}
                </p>
              )}
              {providers.length === 0 && !isLoading && (
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                  No hay proveedores activos disponibles
                </p>
              )}
            </div>

            {/* Cantidad de Timbres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cantidad de Timbres *
              </label>
              <input
                type="number"
                name="count"
                value={formData.count}
                onChange={handleInputChange}
                placeholder="100"
                min="1"
                disabled={isSubmitting}
                className={clsx(
                  "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                  errors.count
                    ? "border-red-300 dark:border-red-500"
                    : "border-gray-300 dark:border-[#2C2C38]"
                )}
                style={!errors.count ? { '--tw-ring-color': primaryColor } : {}}
              />
              {errors.count && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.count}
                </p>
              )}
            </div>

            {/* Fecha de Compra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Compra *
              </label>
              <input
                type="date"
                name="buyDate"
                value={formData.buyDate}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={clsx(
                  "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                  errors.buyDate
                    ? "border-red-300 dark:border-red-500"
                    : "border-gray-300 dark:border-[#2C2C38]"
                )}
                style={!errors.buyDate ? { '--tw-ring-color': primaryColor } : {}}
              />
              {errors.buyDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.buyDate}
                </p>
              )}
            </div>
            
            {errors.server && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.server}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2C2C38] border border-gray-300 dark:border-[#3C3C48] rounded-md hover:bg-gray-50 dark:hover:bg-[#3C3C48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Procesando...' : 'Cancelar'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.selectedProvider || !formData.count || !formData.buyDate}
                className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Agregando Timbres...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Agregar Timbres
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}