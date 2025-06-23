'use client';

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { X, Upload, FileText, CheckCircle, AlertCircle, Edit, Plus, Star } from 'lucide-react';
import { usePrimaryColor } from '@/context/primaryColor';
import { useTheme } from '@/context/ThemeContext';

export default function DocumentFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  document = null // Si es null, es crear; si tiene datos, es editar
}) {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef(null);

  // Determinar si es modo edición
  const isEditMode = Boolean(document);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file: null,
    status: 'ACTIVE'
  });

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [fileChanged, setFileChanged] = useState(false);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && document) {
        // Modo edición: cargar datos existentes
        setFormData({
          name: document.name || '',
          description: document.description || '',
          file: null, // En modo editar, el archivo es opcional
          status: document.status || 'ACTIVE'
        });
        setFileChanged(false);
      } else {
        // Modo creación: resetear formulario
        setFormData({
          name: '',
          description: '',
          file: null,
          status: 'ACTIVE'
        });
        setFileChanged(false);
      }

      setErrors({});
      setIsSubmitting(false);
      setDragActive(false);
    }
  }, [isOpen, isEditMode, document]);

  // Verificar si el formulario tiene datos válidos
  const isFormValid = () => {
    const hasName = formData.name.trim().length > 0;
    const hasDescription = formData.description.trim().length > 0;
    const hasFile = formData.file !== null;
    
    if (isEditMode) {
      return hasName && hasDescription && hasChanges();
    } else {
      return hasName && hasDescription && hasFile;
    }
  };

  // Limpiar formulario cuando se cierra el modal
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      file: null,
      status: 'ACTIVE'
    });
    setErrors({});
    setIsSubmitting(false);
    setDragActive(false);
    setFileChanged(false);
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Limpiar errores de servidor cuando el usuario haga cambios
    if (errors.server) {
      setErrors(prev => ({
        ...prev,
        server: undefined
      }));
    }
  };

  // Convertir archivo a base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remover el prefijo "data:...;base64," para obtener solo el base64
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Validar archivo
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf'];
    const allowedExtensions = ['.pdf'];

    // Verificar tipo MIME
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos PDF';
    }

    // Verificar extensión como backup
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return 'Solo se permiten archivos con extensión .pdf';
    }

    if (file.size > maxSize) {
      return 'El archivo no puede ser mayor a 10MB';
    }

    return null;
  };

  // Manejar selección de archivo
  const handleFileSelect = (file) => {
    const error = validateFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, file: error }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      file: file
    }));
    
    if (isEditMode) {
      setFileChanged(true);
    }
    
    // Limpiar error de archivo si existía
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: undefined }));
    }
  };

  // Manejar drop de archivos
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Manejar drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  // Manejar drag leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  // Manejar clic en input de archivo
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Abrir selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Remover archivo seleccionado
  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
    
    if (isEditMode) {
      setFileChanged(true);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'El nombre no puede exceder 50 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'La descripción debe tener al menos 3 caracteres';
    } else if (formData.description.trim().length > 150) {
      newErrors.description = 'La descripción no puede exceder 150 caracteres';
    }

    // Solo validar archivo si es modo crear
    if (!isEditMode && !formData.file) {
      newErrors.file = 'El archivo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar si hay cambios en el formulario (solo para modo edición)
  const hasChanges = () => {
    if (!isEditMode || !document) return false;

    return (
      formData.name !== document.name ||
      formData.description !== document.description ||
      fileChanged
    );
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // En modo edición, verificar si hay cambios
    if (isEditMode && !hasChanges()) {
      onSubmit({
        success: true,
        message: 'No hay cambios para actualizar'
      });
      handleClose();
      return;
    }

    setIsSubmitting(true);

    try {
      let fileBase64 = null;
      
      // Solo procesar archivo si está presente
      if (formData.file) {
        fileBase64 = await fileToBase64(formData.file);
      }

      // Preparar datos para envío
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status
      };

      // En modo editar, agregar ID del documento
      if (isEditMode) {
        submitData.idDocument = document.idDocument;
      }

      // Solo agregar archivo si está presente
      if (fileBase64) {
        submitData.file = fileBase64;
      } else if (!isEditMode) {
        // En modo crear, el archivo es obligatorio
        throw new Error('El archivo es obligatorio');
      }

      // Determinar endpoint y método según el modo
      let endpoint, method;
      
      if (isEditMode) {
        endpoint = `/api/documents/${document.idDocument}`;
        method = 'PUT';
      } else {
        endpoint = '/api/documents/all';
        method = 'POST';
      }

      // Enviar al endpoint
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (response.ok && result.statusCode === "200") {
        // Éxito
        const successData = {
          success: true,
          message: result.message || (isEditMode ? 'Documento actualizado exitosamente' : 'Documento creado exitosamente')
        };

        // En modo edición, incluir los datos actualizados
        if (isEditMode) {
          successData.data = {
            ...document,
            name: formData.name.trim(),
            description: formData.description.trim()
          };
        }

        onSubmit(successData);
        
        // Cerrar automáticamente en caso de éxito
        handleClose();
      } else {
        // Error del servidor - agregar a errores de validación
        if (result.message) {
          if (result.message.toLowerCase().includes('nombre') || result.message.toLowerCase().includes('documento')) {
            // Si es error relacionado con nombre/documento duplicado, mostrar tanto en campo como en general
            setErrors(prev => ({
              ...prev,
              name: result.message,
              server: result.message
            }));
          } else if (result.message.toLowerCase().includes('descripción')) {
            setErrors(prev => ({
              ...prev,
              description: result.message,
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
      console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} documento:`, error);
      setErrors(prev => ({
        ...prev,
        server: `Error de conexión al ${isEditMode ? 'actualizar' : 'crear'} el documento`
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
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
      <div className="relative bg-white dark:bg-[#1C1C24] rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditMode ? 'Editar Documento' : 'Nuevo Documento'}
            </h2>
            {isEditMode && document && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                ID: {document.idDocument} • Modifica los datos del documento
              </p>
            )}
          </div>
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
            
            {/* Nombre del documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del documento *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ingrese el nombre del documento"
                maxLength={50}
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
              <div className="text-right mt-1">
                <span className={clsx(
                  "text-xs",
                  formData.name.length > 50 
                    ? "text-red-500" 
                    : "text-gray-400 dark:text-gray-500"
                )}>
                  {formData.name.length}/50
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción del documento *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe el contenido del documento..."
                rows={3}
                maxLength={150}
                disabled={isSubmitting}
                className={clsx(
                  "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50 resize-none",
                  errors.description
                    ? "border-red-300 dark:border-red-500"
                    : "border-gray-300 dark:border-[#2C2C38]"
                )}
                style={!errors.description ? { '--tw-ring-color': primaryColor } : {}}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
              <div className="text-right mt-1">
                <span className={clsx(
                  "text-xs",
                  formData.description.length > 150 
                    ? "text-red-500" 
                    : "text-gray-400 dark:text-gray-500"
                )}>
                  {formData.description.length}/150
                </span>
              </div>
            </div>

            {/* Archivo PDF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Archivo PDF {isEditMode ? '' : '*'}
                {isEditMode && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    ({formData.file ? 'Nuevo archivo seleccionado' : 'Archivo actual'})
                  </span>
                )}
              </label>
              
              {formData.file ? (
                // Vista previa de archivo nuevo seleccionado
                <div className="relative border border-gray-200 dark:border-[#2C2C38] rounded-lg p-4 bg-gray-50 dark:bg-[#2C2C38]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
                      <FileText className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {formData.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB • PDF
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={openFileSelector}
                        disabled={isSubmitting}
                        className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-md transition-colors disabled:opacity-50"
                        title="Cambiar archivo"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={removeFile}
                        disabled={isSubmitting}
                        className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-md transition-colors disabled:opacity-50"
                        title="Quitar archivo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : isEditMode && document ? (
                // Mostrar archivo actual en modo edición
                <div className="relative border border-gray-200 dark:border-[#2C2C38] rounded-lg p-4 bg-gray-50 dark:bg-[#2C2C38]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
                      <FileText className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {document.name}.pdf
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Archivo actual • PDF
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={openFileSelector}
                        disabled={isSubmitting}
                        className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-md transition-colors disabled:opacity-50"
                        title="Reemplazar archivo"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Zona de drop para modo crear
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={openFileSelector}
                  className={clsx(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                    "hover:bg-gray-50 dark:hover:bg-[#2C2C38]",
                    dragActive && "border-primary bg-primary/5",
                    errors.file
                      ? "border-red-300 dark:border-red-500"
                      : "border-gray-300 dark:border-[#2C2C38]",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                  style={dragActive ? { borderColor: primaryColor, backgroundColor: `${primaryColor}0D` } : {}}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={clsx(
                      "p-3 rounded-full",
                      dragActive ? "bg-primary/10" : "bg-gray-100 dark:bg-[#3C3C48]"
                    )}>
                      <Upload className={clsx(
                        "w-6 h-6",
                        dragActive ? "text-primary" : "text-gray-400 dark:text-gray-500"
                      )} 
                      style={dragActive ? { color: primaryColor } : {}}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Arrastra un archivo PDF aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Solo archivos PDF hasta 10MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isSubmitting}
              />

              {errors.file && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.file}
                </p>
              )}
            </div>

            {/* Indicador de cambios (solo en modo edición) */}
            {isEditMode && hasChanges() && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Hay cambios sin guardar
                  </span>
                </div>
              </div>
            )}

            {/* Errores generales */}
            {errors.server && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.server}
                </p>
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
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditMode ? 'Actualizando...' : 'Subiendo...'}
                  </>
                ) : (
                  <>
                    {isEditMode ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isEditMode ? 'Actualizar Documento' : 'Subir Documento'}
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