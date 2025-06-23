"use client";

import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import {
  X,
  Image,
  Gift,
  AlertCircle,
  Edit,
  Plus,
  Star,
  Link,
  Calendar,
} from "lucide-react";
import { usePrimaryColor } from "@/context/primaryColor";
import { useTheme } from "@/context/ThemeContext";

export default function PromotionFormModal({
  isOpen,
  onClose,
  onSuccess,
  promotion = null,
}) {
  const { primaryColor } = usePrimaryColor();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fileInputRef = useRef(null);

  // Determinar si es modo edición
  const isEditMode = Boolean(promotion);

  // Estados del formulario
  const [formData, setFormData] = useState({
    description: "",
    imageBase64: "",
    urlReference: "",
    expirationDate: "",
  });

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && promotion) {
        // Modo edición: cargar datos existentes
        const expirationDate = promotion.expirationDate
          ? new Date(promotion.expirationDate).toISOString().split("T")[0]
          : "";

        setFormData({
          description: promotion.description || "",
          imageBase64: promotion.image || "",
          urlReference: promotion.urlReference || "",
          expirationDate: expirationDate,
        });

        // Mostrar imagen actual
        if (promotion.image) {
          setImagePreview(`data:image/jpeg;base64,${promotion.image}`);
        } else {
          setImagePreview("");
        }

        setImageChanged(false);
      } else {
        // Modo creación: resetear formulario
        setFormData({
          description: "",
          imageBase64: "",
          urlReference: "",
          expirationDate: "",
        });
        setImagePreview("");
        setImageChanged(false);
      }

      setErrors({});
      setIsSubmitting(false);
      setDragActive(false);
    }
  }, [isOpen, isEditMode, promotion]);

  // Verificar si el formulario tiene datos válidos
  const isFormValid = () => {
    const hasDescription = formData.description.trim().length > 0;
    const hasImage = formData.imageBase64.length > 0;
    const hasUrl = formData.urlReference.trim().length > 0;

    // Para promociones por defecto en edición, no requerir fecha
    const isDefaultPromotion = isEditMode && promotion?.isDefault;
    const hasDate = isDefaultPromotion || formData.expirationDate.length > 0;

    if (isEditMode) {
      return hasDescription && hasImage && hasUrl && hasDate && hasChanges();
    } else {
      return hasDescription && hasImage && hasUrl && hasDate;
    }
  };

  // Limpiar formulario cuando se cierra el modal
  const resetForm = () => {
    setFormData({
      description: "",
      imageBase64: "",
      urlReference: "",
      expirationDate: "",
    });
    setErrors({});
    setImagePreview("");
    setIsSubmitting(false);
    setDragActive(false);
    setImageChanged(false);
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Limpiar errores de servidor cuando el usuario haga cambios
    if (errors.server) {
      setErrors((prev) => ({
        ...prev,
        server: undefined,
      }));
    }
  };

  // Convertir archivo a base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remover el prefijo data:image/...;base64,
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Validar archivo de imagen
  const validateImageFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      return "Solo se permiten archivos de imagen (JPG, PNG, GIF)";
    }

    if (file.size > maxSize) {
      return "El archivo no puede ser mayor a 5MB";
    }

    return null;
  };

  // Validar URL
  const validateUrl = (url) => {
    if (!url.trim()) {
      return "La URL de referencia es requerida";
    }

    try {
      const urlObj = new URL(url);
      // Verificar que tenga un protocolo válido
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return "La URL debe comenzar con http:// o https://";
      }
      return null;
    } catch (error) {
      return "Ingresa una URL válida (ejemplo: https://ejemplo.com)";
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = async (file) => {
    const error = validateImageFile(file);
    if (error) {
      setErrors((prev) => ({ ...prev, image: error }));
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      const preview = `data:${file.type};base64,${base64}`;

      setFormData((prev) => ({
        ...prev,
        imageBase64: base64,
      }));
      setImagePreview(preview);

      if (isEditMode) {
        setImageChanged(true);
      }

      // Limpiar error de imagen si existía
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: undefined }));
      }
    } catch (error) {
      console.error("Error al convertir imagen:", error);
      setErrors((prev) => ({ ...prev, image: "Error al procesar la imagen" }));
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

  // Remover imagen seleccionada
  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageBase64: "" }));
    setImagePreview("");

    if (isEditMode) {
      setImageChanged(true);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    } else if (formData.description.trim().length < 3) {
      newErrors.description = "La descripción debe tener al menos 3 caracteres";
    } else if (formData.description.trim().length > 255) {
      newErrors.description = "La descripción no puede exceder 255 caracteres";
    }

    if (!formData.imageBase64) {
      newErrors.image = "La imagen es requerida";
    }

    // Validar URL
    const urlError = validateUrl(formData.urlReference);
    if (urlError) {
      newErrors.urlReference = urlError;
    }

    // Solo validar fecha si NO es promoción por defecto
    const isDefaultPromotion = isEditMode && promotion?.isDefault;
    if (!isDefaultPromotion) {
      if (!formData.expirationDate) {
        newErrors.expirationDate = "La fecha de expiración es requerida";
      } else {
        // Verificar que la fecha no sea anterior a hoy
        const selectedDate = new Date(formData.expirationDate);
        const today = new Date();

        // Establecer la hora a 0 para comparar solo fechas
        selectedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          newErrors.expirationDate =
            "La fecha de expiración no puede ser anterior a hoy";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar si hay cambios en el formulario (solo para modo edición)
  const hasChanges = () => {
    if (!isEditMode || !promotion) return false;

    const originalDate = promotion.expirationDate
      ? new Date(promotion.expirationDate).toISOString().split("T")[0]
      : "";

    return (
      formData.description !== promotion.description ||
      formData.urlReference !== (promotion.urlReference || "") ||
      formData.expirationDate !== originalDate ||
      imageChanged
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
      onSuccess({
        success: true,
        message: "No hay cambios para actualizar",
      });
      handleClose();
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para enviar
      const requestBody = {
        description: formData.description.trim(),
        imageBase64: formData.imageBase64,
        urlReference: formData.urlReference.trim(),
      };

      // Solo agregar fecha si NO es promoción por defecto
      const isDefaultPromotion = isEditMode && promotion?.isDefault;
      if (!isDefaultPromotion) {
        // Convertir fecha a formato ISO para el backend
        const dateObj = new Date(formData.expirationDate + "T23:59:59.999Z");
        requestBody.expirationDate = dateObj.toISOString();
      }

      const url = isEditMode
        ? `/api/promotions?id=${promotion.idPromotion}`
        : "/api/promotions";

      const method = isEditMode ? "PUT" : "POST";
      const expectedStatusCode = isEditMode ? "200" : "201";

      const response = await fetch(url, {
        method: method,
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok && result.statusCode === expectedStatusCode) {
        // Éxito
        const successData = {
          success: true,
          message:
            result.message ||
            (isEditMode
              ? "Promoción actualizada exitosamente"
              : "Promoción creada exitosamente"),
        };

        // En modo edición, incluir los datos actualizados
        if (isEditMode) {
          successData.data = {
            ...promotion,
            description: formData.description.trim(),
            image: formData.imageBase64,
            urlReference: formData.urlReference.trim(),
            expirationDate: formData.expirationDate,
          };
        }

        onSuccess(successData);

        // Cerrar automáticamente en caso de éxito
        handleClose();
      } else {
        // Error del servidor - agregar a errores de validación
        if (result.message) {
          if (
            result.message.toLowerCase().includes("descripción") ||
            result.message.toLowerCase().includes("promoción")
          ) {
            // Si es error relacionado con descripción/promoción duplicada, mostrar tanto en campo como en general
            setErrors((prev) => ({
              ...prev,
              description: result.message,
              server: result.message,
            }));
          } else if (result.message.toLowerCase().includes("url")) {
            setErrors((prev) => ({
              ...prev,
              urlReference: result.message,
              server: result.message,
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              server: result.message,
            }));
          }
        }
      }
    } catch (error) {
      console.error(
        `Error al ${isEditMode ? "actualizar" : "crear"} promoción:`,
        error
      );
      setErrors((prev) => ({
        ...prev,
        server: `Error de conexión al ${
          isEditMode ? "actualizar" : "crear"
        } la promoción`,
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

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1C1C24] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C2C38] flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditMode ? "Editar Promoción" : "Nueva Promoción"}
            </h2>
            {isEditMode && promotion && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                ID: {promotion.idPromotion} • Modifica los datos de la promoción
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
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="p-6 space-y-4">
            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción de la promoción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe la promoción..."
                rows={3}
                disabled={isSubmitting}
                className={clsx(
                  "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none resize-none",
                  errors.description
                    ? "border-red-300 dark:border-red-500"
                    : "border-gray-300 dark:border-[#2C2C38]"
                )}
                style={
                  !errors.description ? { "--tw-ring-color": primaryColor } : {}
                }
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
              <div className="text-right mt-1">
                <span
                  className={clsx(
                    "text-xs",
                    formData.description.length > 255
                      ? "text-red-500"
                      : "text-gray-400 dark:text-gray-500"
                  )}
                >
                  {formData.description.length}/255
                </span>
              </div>
            </div>

            {/* URL de Referencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL de referencia *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="url"
                  name="urlReference"
                  value={formData.urlReference}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com"
                  disabled={isSubmitting}
                  className={clsx(
                    "w-full pl-10 pr-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none",
                    errors.urlReference
                      ? "border-red-300 dark:border-red-500"
                      : "border-gray-300 dark:border-[#2C2C38]"
                  )}
                  style={
                    !errors.urlReference
                      ? { "--tw-ring-color": primaryColor }
                      : {}
                  }
                />
              </div>
              {errors.urlReference && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.urlReference}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                URL donde se redirigirá al usuario al hacer clic en la promoción
              </p>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imagen de la promoción *
              </label>

              {imagePreview ? (
                // Vista previa de imagen
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-200 dark:border-[#2C2C38] bg-gray-50 dark:bg-[#2C2C38]"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={openFileSelector}
                      disabled={isSubmitting}
                      className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50"
                      title={isEditMode ? "Cambiar imagen" : "Cambiar imagen"}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={isSubmitting}
                      className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50"
                      title="Quitar imagen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {isEditMode && imageChanged && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Imagen modificada
                    </div>
                  )}
                </div>
              ) : (
                // Zona de drop
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={openFileSelector}
                  className={clsx(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                    "hover:bg-gray-50 dark:hover:bg-[#2C2C38]",
                    dragActive && "border-primary bg-primary/5",
                    errors.image
                      ? "border-red-300 dark:border-red-500"
                      : "border-gray-300 dark:border-[#2C2C38]",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                  style={
                    dragActive
                      ? {
                          borderColor: primaryColor,
                          backgroundColor: `${primaryColor}0D`,
                        }
                      : {}
                  }
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={clsx(
                        "p-3 rounded-full",
                        dragActive
                          ? "bg-primary/10"
                          : "bg-gray-100 dark:bg-[#3C3C48]"
                      )}
                    >
                      <Image
                        className={clsx(
                          "w-6 h-6",
                          dragActive
                            ? "text-primary"
                            : "text-gray-400 dark:text-gray-500"
                        )}
                        style={dragActive ? { color: primaryColor } : {}}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Arrastra una imagen aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        JPG, PNG o GIF hasta 5MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isSubmitting}
              />

              {errors.image && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.image}
                </p>
              )}
            </div>

            {/* Fecha de expiración - Solo mostrar si NO es promoción por defecto */}
            {!(isEditMode && promotion?.isDefault) && (
              <>
                <style>
                  {`
                    html.dark input[type="date"]::-webkit-calendar-picker-indicator {
                      filter: brightness(0) invert(1);
                      opacity: 0.8;
                    }
                  `}
                </style>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de expiración *
                  </label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    disabled={isSubmitting}
                    className={clsx(
                      "w-full px-3 py-2 border rounded-md bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:outline-none focus:ring-primary",
                      errors.expirationDate
                        ? "border-red-300 dark:border-red-500"
                        : "border-gray-300 dark:border-[#2C2C38]"
                    )}
                    style={
                      !errors.expirationDate
                        ? { "--tw-ring-color": primaryColor }
                        : {}
                    }
                  />
                  {errors.expirationDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.expirationDate}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Mensaje informativo para promociones por defecto */}
            {isEditMode && promotion?.isDefault && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <Star className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">Promoción por defecto</p>
                    <p className="text-xs mt-1 text-yellow-700 dark:text-yellow-300">
                      Las promociones por defecto no tienen fecha de expiración
                      y permanecen activas de forma indefinida.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                {isSubmitting ? "Procesando..." : "Cancelar"}
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
                    {isEditMode ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <Edit className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {isEditMode ? "Actualizar Promoción" : "Crear Promoción"}
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
