'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { X, Shield, AlertCircle, Save } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

export default function EditPacModal({ 
  isOpen, 
  pac,
  onClose, 
  onSubmit
}) {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    contract: '',
    user: '',
    password: '',
    status: 'ACTIVE',
    primaryPac: false
  });

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar datos del PAC cuando se abre el modal
  useEffect(() => {
    if (isOpen && pac) {
      setFormData({
        name: pac.name || '',
        contract: pac.contract || '',
        user: pac.user || '',
        password: pac.password || '',
        status: pac.status || 'ACTIVE',
        primaryPac: pac.primaryPac === pac.idProvider
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, pac]);

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        contract: '',
        user: '',
        password: '',
        status: 'ACTIVE',
        primaryPac: false
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Verificar si el formulario tiene datos válidos
  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.user.trim() &&
      formData.password.trim()
    );
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar errores del campo modificado
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

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del PAC es requerido';
    }

    if (!formData.user.trim()) {
      newErrors.user = 'El usuario es requerido';
    } else {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.user.trim())) {
        newErrors.user = 'El formato del email no es válido';
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.trim().length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar contrato si se proporciona
    if (formData.contract && formData.contract.trim().length > 0) {
      if (formData.contract.trim().length < 10) {
        newErrors.contract = 'El contrato debe tener al menos 10 caracteres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        IdProvider: pac.idProvider.toString(),
        Name: formData.name.trim(),
        Contract: formData.contract.trim() || null,
        User: formData.user.trim(),
        Password: formData.password.trim(),
        Status: formData.status,
        PrimaryPac: formData.primaryPac ? pac.idProvider.toString() : "0"
      };

      const response = await fetch('http://10.50.77.181:83/msadvan_pac/api/v1/pacprovider', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (response.ok && result.statusCode === "200") {
        onSubmit({
          success: true,
          message: result.message || 'PAC actualizado exitosamente'
        });
        
        handleClose();
      } else {
        // Manejar errores específicos de la API
        if (result.message) {
          if (result.message.toLowerCase().includes('nombre') || result.message.toLowerCase().includes('name')) {
            setErrors(prev => ({
              ...prev,
              name: result.message,
              server: result.message
            }));
          } else if (result.message.toLowerCase().includes('usuario') || result.message.toLowerCase().includes('user')) {
            setErrors(prev => ({
              ...prev,
              user: result.message,
              server: result.message
            }));
          } else if (result.message.toLowerCase().includes('contraseña') || result.message.toLowerCase().includes('password')) {
            setErrors(prev => ({
              ...prev,
              password: result.message,
              server: result.message
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              server: result.message
            }));
          }
        } else {
          setErrors(prev => ({
            ...prev,
            server: 'Error al procesar la solicitud'
          }));
        }
      }
    } catch (error) {
      console.error('Error al actualizar PAC:', error);
      setErrors(prev => ({
        ...prev,
        server: 'Error de conexión al actualizar el PAC'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !pac) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      <div className="relative bg-white dark:bg-[#1C1C24] rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Editar PAC
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Modifica la información del proveedor autorizado de certificación
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
            
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del PAC *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="ej. Finkok"
                    disabled={isSubmitting}
                    className={clsx(
                      "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                      errors.name
                        ? "border-red-300 dark:border-red-500"
                        : "border-gray-300 dark:border-[#2C2C38]"
                    )}
                    style={!errors.name ? { '--tw-ring-color': primaryColor } : {}}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contrato
                  </label>
                  <input
                    type="text"
                    name="contract"
                    value={formData.contract}
                    onChange={handleInputChange}
                    placeholder="ej. 17c402ed-3c1d-4b0c-a35f-be5af4c64936"
                    disabled={isSubmitting}
                    className={clsx(
                      "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                      errors.contract
                        ? "border-red-300 dark:border-red-500"
                        : "border-gray-300 dark:border-[#2C2C38]"
                    )}
                    style={!errors.contract ? { '--tw-ring-color': primaryColor } : {}}
                  />
                  {errors.contract && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.contract}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Opcional. Algunos PACs requieren un contrato específico.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Usuario (Email) *
                  </label>
                  <input
                    type="email"
                    name="user"
                    value={formData.user}
                    onChange={handleInputChange}
                    placeholder="usuario@dominio.com"
                    disabled={isSubmitting}
                    className={clsx(
                      "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                      errors.user
                        ? "border-red-300 dark:border-red-500"
                        : "border-gray-300 dark:border-[#2C2C38]"
                    )}
                    style={!errors.user ? { '--tw-ring-color': primaryColor } : {}}
                  />
                  {errors.user && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.user}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    className={clsx(
                      "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                      errors.password
                        ? "border-red-300 dark:border-red-500"
                        : "border-gray-300 dark:border-[#2C2C38]"
                    )}
                    style={!errors.password ? { '--tw-ring-color': primaryColor } : {}}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Configuración */}
            <div className="border-t border-gray-200 dark:border-[#2C2C38] pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configuración
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50"
                    style={{ '--tw-ring-color': primaryColor }}
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="primaryPac"
                    name="primaryPac"
                    checked={formData.primaryPac}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-opacity-50"
                    style={{ '--tw-ring-color': primaryColor, 'accentColor': primaryColor }}
                  />
                  <label htmlFor="primaryPac" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Establecer como PAC primario
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Solo puede haber un PAC primario activo a la vez.
                </p>
              </div>
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
                disabled={isSubmitting || !isFormValid()}
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Actualizando PAC...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Cambios
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