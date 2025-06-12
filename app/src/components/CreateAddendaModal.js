// Manejar cierre del modal'use client';

import { useState } from 'react';
import { X, Plus, Code, AlertCircle, Loader2 } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';
import clsx from 'clsx';

export default function CreateAddendaModal({ isOpen, onClose, onSuccess }) {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    structureTravel: '',
    structureAdditionalInvoice: '',
    structureCreditNote: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Limpiar formulario y errores al abrir/cerrar
  const resetForm = () => {
    setFormData({
      name: '',
      structureTravel: '',
      structureAdditionalInvoice: '',
      structureCreditNote: ''
    });
    setErrors({});
    setIsSubmitting(false);
  };

  // Verificar si el formulario tiene datos válidos
  const isFormValid = () => {
    const hasName = formData.name.trim().length > 0;
    const hasStructure = formData.structureTravel.trim() || 
                        formData.structureAdditionalInvoice.trim() || 
                        formData.structureCreditNote.trim();
    return hasName && hasStructure;
  };
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre (requerido)
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar que al menos una estructura esté presente
    const hasStructure = formData.structureTravel.trim() || 
                        formData.structureAdditionalInvoice.trim() || 
                        formData.structureCreditNote.trim();
    
    if (!hasStructure) {
      newErrors.structures = 'Debe proporcionar al menos una estructura XML';
    }

    // Validar estructuras XML (opcional, pero si se proporciona debe ser válida)
    const validateXML = (xml, fieldName) => {
      if (xml.trim()) {
        // Validación básica de XML
        if (!xml.trim().startsWith('<') || !xml.trim().endsWith('>')) {
          newErrors[fieldName] = 'La estructura debe ser un XML válido';
        } else if (xml.trim().length > 10000) {
          newErrors[fieldName] = 'La estructura XML es demasiado larga (máximo 10,000 caracteres)';
        }
      }
    };

    validateXML(formData.structureTravel, 'structureTravel');
    validateXML(formData.structureAdditionalInvoice, 'structureAdditionalInvoice');
    validateXML(formData.structureCreditNote, 'structureCreditNote');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Limpiar errores de servidor cuando el usuario haga cambios
    if (errors.server) {
      setErrors(prev => ({
        ...prev,
        server: undefined
      }));
    }

    // Limpiar error de estructuras si ya hay al menos una
    if ((field === 'structureTravel' || field === 'structureAdditionalInvoice' || field === 'structureCreditNote') && value.trim() && errors.structures) {
      setErrors(prev => ({
        ...prev,
        structures: undefined
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para enviar (solo enviar estructuras que no estén vacías)
      const dataToSend = {
        name: formData.name.trim()
      };

      if (formData.structureTravel.trim()) {
        dataToSend.structureTravel = formData.structureTravel.trim();
      }

      if (formData.structureAdditionalInvoice.trim()) {
        dataToSend.structureAdditionalInvoice = formData.structureAdditionalInvoice.trim();
      }

      if (formData.structureCreditNote.trim()) {
        dataToSend.structureCreditNote = formData.structureCreditNote.trim();
      }

      const response = await fetch('/api/addenda', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();

      if (response.ok && result.statusCode === "201") {
        // Éxito
        onSuccess({
          success: true,
          message: result.message || 'Addenda creada exitosamente',
          data: result.data
        });
        
        // Cerrar automáticamente en caso de éxito
        handleClose();

      } else {
        // Error del servidor - agregar a errores de validación
        if (result.message) {
          if (result.message.toLowerCase().includes('nombre') || result.message.toLowerCase().includes('addenda')) {
            // Si es error relacionado con nombre/addenda duplicada, mostrar tanto en campo como en general
            setErrors(prev => ({
              ...prev,
              name: result.message,
              server: result.message
            }));
          } else {
            setErrors(prev => ({
              ...prev,
              server: result.message
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error al crear addenda:', error);
      setErrors(prev => ({
        ...prev,
        server: 'Error de conexión al crear la addenda'
      }));
    } finally {
      setIsSubmitting(false);
    }
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
            Crear Nueva Addenda
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#2C2C38] rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>



        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la Addenda *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={clsx(
                  "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50",
                  errors.name
                    ? "border-red-300 dark:border-red-500"
                    : "border-gray-300 dark:border-[#2C2C38]"
                )}
                style={!errors.name ? { '--tw-ring-color': primaryColor } : {}}
                placeholder="Ej: Walmart, Amazon, etc."
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>



            {/* Estructuras XML */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  Estructuras XML
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure las estructuras XML para cada tipo de documento. Debe proporcionar al menos una estructura.
              </p>

              {/* Structure Travel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estructura de Viaje
                </label>
                <textarea
                  value={formData.structureTravel}
                  onChange={(e) => handleChange('structureTravel', e.target.value)}
                  className={clsx(
                    "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50 font-mono text-sm",
                    errors.structureTravel
                      ? "border-red-300 dark:border-red-500"
                      : "border-gray-300 dark:border-[#2C2C38]"
                  )}
                  style={!errors.structureTravel ? { '--tw-ring-color': primaryColor } : {}}
                  rows={4}
                  placeholder="<xml>...</xml>"
                  disabled={isSubmitting}
                />
                {errors.structureTravel && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.structureTravel}
                  </p>
                )}
              </div>

              {/* Structure Additional Invoice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estructura de Factura Adicional
                </label>
                <textarea
                  value={formData.structureAdditionalInvoice}
                  onChange={(e) => handleChange('structureAdditionalInvoice', e.target.value)}
                  className={clsx(
                    "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50 font-mono text-sm",
                    errors.structureAdditionalInvoice
                      ? "border-red-300 dark:border-red-500"
                      : "border-gray-300 dark:border-[#2C2C38]"
                  )}
                  style={!errors.structureAdditionalInvoice ? { '--tw-ring-color': primaryColor } : {}}
                  rows={4}
                  placeholder="<xml>...</xml>"
                  disabled={isSubmitting}
                />
                {errors.structureAdditionalInvoice && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.structureAdditionalInvoice}
                  </p>
                )}
              </div>

              {/* Structure Credit Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estructura de Nota de Crédito
                </label>
                <textarea
                  value={formData.structureCreditNote}
                  onChange={(e) => handleChange('structureCreditNote', e.target.value)}
                  className={clsx(
                    "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50 font-mono text-sm",
                    errors.structureCreditNote
                      ? "border-red-300 dark:border-red-500"
                      : "border-gray-300 dark:border-[#2C2C38]"
                  )}
                  style={!errors.structureCreditNote ? { '--tw-ring-color': primaryColor } : {}}
                  rows={4}
                  placeholder="<xml>...</xml>"
                  disabled={isSubmitting}
                />
                {errors.structureCreditNote && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.structureCreditNote}
                  </p>
                )}
              </div>
            </div>

            {/* Errores generales */}
            {(errors.structures || errors.server) && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                {errors.structures && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.structures}
                  </p>
                )}
                {errors.server && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.server}
                  </p>
                )}
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Crear Addenda
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