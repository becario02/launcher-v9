'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function NewsModal({
  isOpen,
  modalType,
  formData,
  handleFormChange,
  handleCloseModal,
  handleSaveNews
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [previewImage, setPreviewImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalNotification, setModalNotification] = useState({
    visible: false,
    type: 'error',
    message: ''
  });

  // Nuevas categorías de noticias
  const newsCategories = [
    { value: 'COMMUNICATION', label: 'Comunicados' },
    { value: 'MAINTENANCE_EXTERNAL', label: 'Ventana de mantenimiento externas' },
    { value: 'GENERAL_NEWS', label: 'Noticias' },
    { value: 'LEGAL_NEWS', label: 'Noticias normativas y fiscales' },
    { value: 'BLOG', label: 'Blog' },
    { value: 'PRODUCTS_SERVICES', label: 'Productos y servicios Advan' },
    { value: 'SUCCESS_STORY', label: 'Casos de éxito - Productos o servicios Advan' },
    { value: 'PROMOTIONAL', label: 'Promocional' },
    { value: 'CLOUD_PROMO', label: 'Nube - Promocional' },
    { value: 'UPCOMING_EVENTS', label: 'Eventos próximos' }
  ];

  // Reset notification & preview on close
  useEffect(() => {
    if (!isOpen) {
      setModalNotification({ visible: false, type: 'error', message: '' });
      setPreviewImage(null);
    }
  }, [isOpen]);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;
  const isView = modalType === 'view';

  // Image compression helper
  const compressImage = (file, { maxWidth = 800, maxHeight = 600, quality = 0.7 } = {}) =>
    new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(blob => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

  // Handle file input change
  const handleImageChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file, { maxWidth: 800, maxHeight: 600, quality: 0.7 });
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPreviewImage(base64);
      handleFormChange({
        target: { name: 'imageUrl', value: base64, type: 'text' }
      });
    };
    reader.readAsDataURL(compressed);
  };

  // Validate fields and submit
  const validateAndSubmit = async () => {
    if (!formData.title.trim()) {
      setModalNotification({ visible: true, type: 'error', message: 'Por favor ingresa el título' });
      return;
    }
    if (!formData.dateExpiration) {
      setModalNotification({ visible: true, type: 'error', message: 'Selecciona la fecha de expiración' });
      return;
    }
    if (!formData.newsLink.trim()) {
      setModalNotification({ visible: true, type: 'error', message: 'Ingresa el enlace de la noticia' });
      return;
    }
    setIsSaving(true);
    try {
      await handleSaveNews();
    } catch {
      setModalNotification({ visible: true, type: 'error', message: 'Error al guardar la noticia' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`
          bg-white dark:bg-gray-800
          rounded-xl shadow-xl w-full max-w-2xl overflow-hidden
          transition-all duration-300 animate-fadeIn my-4 relative
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 flex justify-between items-center bg-primary-blue">
          <h2 className="text-lg sm:text-xl font-medium text-white">
            {modalType === 'add' && 'Crear Nueva Noticia'}
            {modalType === 'edit' && 'Editar Noticia'}
            {modalType === 'view' && 'Detalles de la Noticia'}
          </h2>
          <button
            onClick={handleCloseModal}
            className="p-1 rounded-full text-white hover:text-primary-blue hover:bg-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {modalNotification.visible && (
            <div
              className={`
                w-full border-l-4 p-4 mb-5 flex items-center justify-between animate-fadeIn
                ${isDark
                  ? 'border-red-500 bg-red-900 bg-opacity-30 text-red-300'
                  : 'border-red-300 bg-red-50 text-red-700'}
              `}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className={isDark ? 'text-red-400' : 'text-red-500'} size={20} />
                <span>{modalNotification.message}</span>
              </div>
              <button
                onClick={() => setModalNotification(v => ({ ...v, visible: false }))}
                className={isDark ? 'text-red-300 hover:text-white' : 'text-red-700 hover:text-gray-900'}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form className="space-y-5">
            {/* Título */}
            <div>
              <label className="block mb-1 font-medium text-gray-800 dark:text-white">
                Título
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                readOnly={isView}
                className={`
                  w-full px-4 py-3 rounded-lg text-p focus:outline-none focus:ring-2 focus:ring-primary-blue
                  bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-200
                  dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600
                  ${isView ? 'cursor-not-allowed opacity-60' : ''}
                `}
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block mb-1 font-medium text-gray-800 dark:text-white">
                Categoría
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                disabled={isView}
                className={`
                  w-full px-4 py-3 rounded-lg text-p focus:outline-none focus:ring-2 focus:ring-primary-blue
                  bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-200
                  dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600
                  ${isView ? 'cursor-not-allowed opacity-60' : ''}
                `}
              >
                {newsCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha de Expiración */}
            <div>
              <label className="block mb-1 font-medium text-gray-800 dark:text-white">
                Fecha de Expiración
              </label>
              <input
                type="date"
                name="dateExpiration"
                value={
                  formData.dateExpiration
                    ? new Date(formData.dateExpiration).toISOString().split('T')[0]
                    : ''
                }
                onChange={handleFormChange}
                readOnly={isView}
                className={`
                  w-full px-4 py-3 rounded-lg text-p focus:outline-none focus:ring-2 focus:ring-primary-blue
                  bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-200
                  dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600
                  ${isView ? 'cursor-not-allowed opacity-60' : ''}
                `}
              />
            </div>

            {/* Imagen */}
            <div>
              <label className="block mb-1 font-medium text-gray-800 dark:text-white">
                Imagen
              </label>
              {!isView ? (
                <div className="flex flex-col space-y-2">
                  <label
                    className={`
                      flex flex-col items-center p-6 rounded-lg border cursor-pointer transition-colors
                      bg-gray-100 border-gray-200 text-gray-600
                      dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300
                      hover:bg-gray-200 dark:hover:bg-gray-600
                    `}
                  >
                    <Upload size={18} className="text-primary-blue" />
                    <span className="mt-2 text-p-small text-primary-blue">
                      Haz clic para subir una imagen
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  {(previewImage || formData.imageUrl) && (
                    <img
                      src={previewImage || formData.imageUrl}
                      alt="Vista previa"
                      className="max-h-40 rounded-lg object-contain mx-auto"
                    />
                  )}
                </div>
              ) : formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Imagen de la noticia"
                  className="max-h-40 rounded-lg object-contain mx-auto"
                />
              ) : (
                <p className={`text-p italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay imagen disponible
                </p>
              )}
            </div>

            {/* Enlace de la noticia */}
            <div>
              <label className="block mb-1 font-medium text-gray-800 dark:text-white">
                <span className="flex items-center gap-1">
                  <LinkIcon size={16} />
                  Enlace de la noticia
                </span>
              </label>
              <input
                type="url"
                name="newsLink"
                placeholder="https://example.com/noticias/mi-noticia"
                value={formData.newsLink || ''}
                onChange={handleFormChange}
                readOnly={isView}
                className={`
                  w-full px-4 py-3 rounded-lg text-p focus:outline-none focus:ring-2 focus:ring-primary-blue
                  bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-200
                  dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600
                  ${isView ? 'cursor-not-allowed opacity-60' : ''}
                `}
              />
              {!isView && (
                <p className={`mt-1 text-p-small ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Ingresa la URL completa donde se puede leer la noticia completa.
                </p>
              )}
              {isView && formData.newsLink && (
                <a
                  href={formData.newsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-p text-semantic-blue hover:text-primary-blue transition-colors mt-2"
                >
                  <LinkIcon size={14} className="mr-1" />
                  Ver noticia completa
                </a>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={`
          px-4 sm:px-6 py-4 flex justify-end gap-3 border-t
          bg-gray-100 border-gray-200 dark:bg-gray-700 dark:border-gray-600
        `}>
          <button
            onClick={handleCloseModal}
            className={`
              px-4 py-2 text-h3 border rounded-full transition-all duration-200 shadow-sm transform hover:-translate-y-0.5
              text-semantic.red bg-white border-semantic.red hover:bg-gray-50
              dark:text-semantic.red dark:bg-gray-700 dark:border-semantic.red dark:hover:bg-gray-600
            `}
          >
            {isView ? 'Cerrar' : 'Cancelar'}
          </button>
          {!isView && (
            <button
              onClick={validateAndSubmit}
              disabled={isSaving}
              className={`
                px-4 py-2 text-h3 text-white rounded-full transition-all duration-200 shadow-sm transform hover:-translate-y-0.5 hover:shadow-md
                bg-primary-blue dark:bg-primary-blue
                ${isSaving
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-semantic.green dark:hover:bg-semantic.green'}
              `}
            >
              {isSaving ? 'Guardando...' : modalType === 'add' ? 'Crear' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}