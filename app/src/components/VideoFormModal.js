'use client';

import { useState, useEffect } from 'react';
import { X, Video } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { usePrimaryColor } from '@/context/primaryColor';
import clsx from 'clsx';

export default function VideoFormModal({ isOpen, modalType, video, onClose, onSubmit }) {
  const { theme } = useTheme();
  const { primaryColor } = usePrimaryColor();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    status: 'ACTIVE'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Función para extraer el embed URL de diferentes plataformas
  const getEmbedUrl = (url) => {
    if (!url) return null;

    try {
      // YouTube
      const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      }

      // Vimeo
      const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }

      // Facebook
      const facebookMatch = url.match(/(?:https?:\/\/)?(?:www\.)?facebook\.com\/.*\/videos\/(\d+)/);
      if (facebookMatch) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
      }

      // Dailymotion
      const dailymotionMatch = url.match(/(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
      if (dailymotionMatch) {
        return `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}`;
      }

      // Si no es una plataforma reconocida, devolver la URL original
      return url;
    } catch {
      return null;
    }
  };

  // Verificar si la URL es embeddable
  const isVideoEmbeddable = (url) => {
    if (!url) return false;
    const embedUrl = getEmbedUrl(url);
    return embedUrl !== null;
  };

  // Sincronizar formData con props cuando cambia el video
  useEffect(() => {
    if (isOpen) {
      if (video) {
        setFormData({
          title: video.title || '',
          url: video.url || '',
          status: video.status || 'ACTIVE'
        });
      } else {
        setFormData({
          title: '',
          url: '',
          status: 'ACTIVE'
        });
      }
      setError('');
    }
  }, [isOpen, video]);

  // Lock body scroll cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const isView = modalType === 'view';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('El título es requerido');
      return false;
    }
    if (!formData.url.trim()) {
      setError('La URL es requerida');
      return false;
    }
    // Validación básica de URL
    try {
      new URL(formData.url);
    } catch {
      setError('Por favor, ingresa una URL válida');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Error al guardar el video');
    } finally {
      setIsSaving(false);
    }
  };

  // Obtener el título del modal según el tipo
  const getModalTitle = () => {
    switch (modalType) {
      case 'add':
        return 'Crear nuevo video';
      case 'edit':
        return 'Editar video';
      case 'view':
        return formData.title || 'Detalles del video';
      default:
        return '';
    }
  };

  // Obtener el texto del botón según el estado
  const getButtonText = () => {
    if (isSaving) return 'Guardando...';
    if (modalType === 'add') return 'Crear video';
    if (modalType === 'edit') return 'Guardar cambios';
    return '';
  };

  // Renderizado especial para modo view - video centrado
  if (isView) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-[#1C1C24] rounded-xl shadow-xl relative max-w-3xl w-full">
          {/* Botón cerrar */}
          <button 
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white z-10" 
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Contenedor del video */}
          {isVideoEmbeddable(formData.url) ? (
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <iframe
                src={getEmbedUrl(formData.url)}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={formData.title}
              />
            </div>
          ) : (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="text-center p-6">
                <Video className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No se pudo cargar el video como embebido
                </p>
                <a
                  href={formData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Ver video en una nueva pestaña
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Renderizado normal para create/edit
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-[#1C1C24] rounded-xl w-full max-w-lg shadow-xl p-6 relative font-poppins">
        {/* Botón cerrar */}
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white" 
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título del modal */}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          {getModalTitle()}
        </h2>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md mb-5 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {/* Título */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Título
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={clsx(
                "w-full rounded-md px-3 py-2 border",
                "bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white",
                "border-gray-300 dark:border-[#2C2C38]",
                "focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
              )}
            />
          </div>

          {/* URL */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              URL del Video
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
              placeholder="https://example.com/video"
              className={clsx(
                "w-full rounded-md px-3 py-2 border",
                "bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white",
                "border-gray-300 dark:border-[#2C2C38]",
                "focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
              )}
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={clsx(
                "w-full rounded-md px-3 py-2 border",
                "bg-white dark:bg-[#1C1C24] text-gray-800 dark:text-white",
                "border-gray-300 dark:border-[#2C2C38]",
                "focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
              )}
            >
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>

          {/* Botón de acción */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className={clsx(
                'px-5 py-2 rounded-md text-white font-medium text-sm shadow',
                'hover:opacity-90 transition',
                isSaving && 'opacity-50 cursor-not-allowed'
              )}
              style={{ backgroundColor: primaryColor }}
            >
              {getButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}