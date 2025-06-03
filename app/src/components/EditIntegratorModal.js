'use client';

import { useState, useEffect } from 'react';
import { X, Edit, AlertCircle, CheckCircle } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

export default function EditIntegratorModal({ 
  isOpen, 
  onClose, 
  integrator,
  onSuccess
}) {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    uploadFileTypes: ''
  });

  // Estados para el envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Inicializar formulario con datos del integrador
  useEffect(() => {
    if (isOpen && integrator) {
      setFormData({
        name: integrator.name || '',
        description: integrator.description || '',
        uploadFileTypes: integrator.uploadFileTypes || ''
      });
      setSubmitMessage(null);
      setSubmitSuccess(false);
    }
  }, [isOpen, integrator]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!integrator?.idIntegrator) {
      console.error('No hay integrador seleccionado');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch(`http://localhost:5173/mslauncher/api/v1/integrator/${integrator.idIntegrator}`, {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          uploadFileTypes: formData.uploadFileTypes.trim()
        })
      });

      const result = await response.json();

      if (response.ok && result.statusCode === "200") {
        // Llamar al callback del padre si existe
        if (onSuccess) {
          onSuccess({
            success: true,
            data: {
              ...integrator,
              ...formData
            },
            message: result.message || 'Integrador actualizado correctamente'
          });
        }

        // Cerrar modal inmediatamente
        handleClose();

      } else {
        throw new Error(result.message || 'Error desconocido en el servidor');
      }

    } catch (error) {
      console.error('Error al actualizar integrador:', error);
      setSubmitSuccess(false);
      setSubmitMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      uploadFileTypes: ''
    });
    setSubmitMessage(null);
    setSubmitSuccess(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // Validación del formulario
  const isFormValid = () => {
    return formData.name.trim() && 
           formData.description.trim() && 
           formData.uploadFileTypes.trim();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1C1C24] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Editar Integrador
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#2C2C38] rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Mensaje de resultado */}
        {submitMessage && !submitSuccess && (
          <div className="mx-6 mt-4 p-4 rounded-lg flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">
              {submitMessage}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-4">
            {/* Primera fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Integrador
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Integrador Walmart"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  style={{ '--tw-ring-color': primaryColor }}
                  required
                  disabled={isSubmitting}
                  maxLength={100}
                />
              </div>

              {/* Tipos de archivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipos de Archivo Permitidos
                </label>
                <input
                  type="text"
                  name="uploadFileTypes"
                  value={formData.uploadFileTypes}
                  onChange={handleInputChange}
                  placeholder="Ej: txt, xml, csv"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  style={{ '--tw-ring-color': primaryColor }}
                  required
                  disabled={isSubmitting}
                  maxLength={50}
                />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Separados por comas. Ej: txt, xml, csv
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe la funcionalidad del integrador..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2C2C38] rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"
                style={{ '--tw-ring-color': primaryColor }}
                required
                disabled={isSubmitting}
                maxLength={500}
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.description.length}/500 caracteres
              </div>
            </div>

            {/* Información actual */}
            {integrator && (
              <div className="bg-gray-50 dark:bg-[#262631] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Edit className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {integrator.name}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {integrator.description}
                </p>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  ID: <span className="font-medium">{integrator.idIntegrator}</span> • 
                  Estado: <span className="font-medium">{integrator.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}</span> •
                  Tipos de archivo: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">
                    {integrator.uploadFileTypes?.split(',').map(type => type.trim()).join(', ')}
                  </span>
                </div>
              </div>
            )}

            {/* Botones */}
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
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isSubmitting ? 'Actualizando Integrador...' : 'Actualizar Integrador'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}