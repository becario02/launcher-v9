"use client";

import { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';

export default function NewsModal({
  isOpen,
  modalType,
  formData,
  handleFormChange,
  handleCloseModal,
  handleSaveNews
}) {
  const [previewImage, setPreviewImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalNotification, setModalNotification] = useState({
    visible: false,
    type: 'error',
    message: ''
  });

  useEffect(() => {
    if (!isOpen) {
      setModalNotification({ visible: false, type: 'error', message: '' });
      setPreviewImage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressedFile = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.7
      });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64WithPrefix = reader.result;
        setPreviewImage(base64WithPrefix);
        handleFormChange({
          target: {
            name: 'imageUrl',
            value: base64WithPrefix,
            type: 'text'
          }
        });
      };
      reader.readAsDataURL(compressedFile);
    }
  };
  
  const compressImage = (file, options = {}) => {
    return new Promise((resolve) => {
      const { maxWidth = 800, maxHeight = 600, quality = 0.7 } = options;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {

          let width = img.width;
          let height = img.height;
          
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
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const validateAndSubmit = async () => {
    if (!formData.title) {
      setModalNotification({
        visible: true,
        type: 'error',
        message: 'Por favor ingresa el título de la noticia'
      });
      return;
    }

    if (!formData.date) {
      setModalNotification({
        visible: true,
        type: 'error',
        message: 'Por favor selecciona una fecha de expiración'
      });
      return;
    }

    if (!formData.newsLink) {
      setModalNotification({
        visible: true,
        type: 'error',
        message: 'Por favor ingresa el enlace de la noticia'
      });
      return;
    }

    setIsSaving(true);
    try {
      await handleSaveNews();
    } catch (error) {
      setModalNotification({
        visible: true,
        type: 'error',
        message: 'Ocurrió un error al guardar la noticia'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all duration-300 animate-fadeIn my-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 py-4 border-b border-primary-blue flex justify-between items-center bg-primary-blue">
          <h2 className="text-lg sm:text-xl font-medium text-white">
            {modalType === 'add' && 'Crear Nueva Noticia'}
            {modalType === 'edit' && 'Editar Noticia'}
            {modalType === 'view' && 'Detalles de la Noticia'}
          </h2>
          <button 
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-primary-blue transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} className='text-white hover:text-primary-blue'/>
          </button>
        </div>
        
        <div className="px-4 sm:px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {/* Notificación dentro del modal */}
          {modalNotification.visible && (
            <div className="w-full border-l-4 border-red-300 bg-red-50 p-4 mb-5 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center">
                <AlertCircle className="text-red-500" size={20} />
                <span className="ml-2 text-red-700">{modalNotification.message}</span>
              </div>
              <button
                onClick={() => setModalNotification({...modalNotification, visible: false})}
                className="text-red-700 hover:text-gray-900 focus:outline-none"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-h3 font-medium text-gray-5 mb-1">Título</label>
              <input 
                type="text" 
                id="title" 
                name="title"
                value={formData.title} 
                onChange={handleFormChange}
                readOnly={modalType === 'view'}
                className={`w-full px-4 py-3 border border-gray-2 rounded-lg text-primary-blue text-p focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent ${modalType === 'view' ? 'bg-gray-50 cursor-not-allowed' : ''}`} 
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-h3 font-medium text-gray-5 mb-1">Categoría</label>
              <select 
                id="category" 
                name="category"
                value={formData.category} 
                onChange={handleFormChange}
                disabled={modalType === 'view'}
                className={`w-full px-4 py-3 border text-primary-blue text-p border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent ${modalType === 'view' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              >
                <option value="NEWS">NEWS</option>
                <option value="ADVICE">ADVICE</option>
                <option value="NOTIFICATION">NOTIFICATION</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="date" className="block text-h3 font-medium text-gray-5 mb-1">Fecha de Expiración</label>
              <input 
                type="date" 
                id="date" 
                name="date"
                value={formData.dateExpiration ? new Date(formData.dateExpiration).toISOString().split('T')[0] : ''} 
                onChange={handleFormChange}
                readOnly={modalType === 'view'}
                className={`w-full px-4 py-3 border text-p text-primary-blue border-gray-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent ${modalType === 'view' ? 'bg-gray-50 cursor-not-allowed' : ''}`} 
              />
            </div>
            
            <div>
              <label className="block text-h3 font-medium text-gray-5 mb-1">Imagen</label>
              {modalType !== 'view' ? (
                <div className="flex flex-col space-y-2">
                  <label className="flex flex-col items-center px-4 py-6 bg-white text-gray-3 rounded-lg border border-gray-2 cursor-pointer hover:bg-gray-1 transition-colors">
                    <Upload size={18} className='text-primary-blue' />
                    <span className="mt-2 text-p-small text-primary-blue">Haz clic para subir una imagen</span>
                    <input 
                      type="file" 
                      name="image" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  {(previewImage || formData.imageUrl) && (
                    <div className="mt-2">
                      <img 
                        src={previewImage || formData.imageUrl} 
                        alt="Vista previa" 
                        className="max-h-40 rounded-lg mx-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              ) : formData.imageUrl ? (
                <div className="mt-2">
                  <img 
                    src={formData.imageUrl} 
                    alt="Imagen de la noticia" 
                    className="max-h-40 rounded-lg object-contain"
                  />
                </div>
              ) : (
                <p className="text-gray-3 text-p italic">No hay imagen disponible</p>
              )}
            </div>
            
            <div>
              <label htmlFor="newsLink" className="block text-h3 font-medium text-gray-5 mb-1">
                <span className="flex items-center gap-1">
                  <LinkIcon size={16} />
                  Enlace de la noticia
                </span>
              </label>
              <div className="relative">
                <input 
                  type="url" 
                  id="newsLink" 
                  name="newsLink"
                  placeholder="https://example.com/noticias/mi-noticia"
                  value={formData.newsLink || ''} 
                  onChange={handleFormChange}
                  readOnly={modalType === 'view'}
                  className={`w-full px-4 py-3 text-p text-primary-blue placeholder:text-semantic-blue border placeholder:text-p border-gray-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent ${modalType === 'view' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
              </div>
              {modalType !== 'view' && (
                <p className="text-p-small text-gray-3 mt-1">Ingresa la URL completa donde se puede leer la noticia completa.</p>
              )}
              {modalType === 'view' && formData.newsLink && (
                <div className="mt-2">
                  <a 
                    href={formData.newsLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-p text-semantic-blue hover:text-primary-blue transition-colors"
                  >
                    <LinkIcon size={14} className="mr-1" />
                    Ver noticia completa
                  </a>
                </div>
              )}
            </div>
          </form>
        </div>
        
        <div className="px-4 sm:px-6 py-4 bg-gray-1 border-t border-gray-2 flex justify-end gap-3">
          <button 
            onClick={handleCloseModal}
            className="px-4 py-2 text-h3 text-semantic.red bg-white border border-semantic.red rounded-full hover:bg-semantic-r transition-all duration-200 shadow-sm transform hover:-translate-y-0.5"
          >
            {modalType === 'view' ? 'Cerrar' : 'Cancelar'}
          </button>
          
          {modalType !== 'view' && (
            <button 
              onClick={validateAndSubmit}
              disabled={isSaving}
              className={`px-4 py-2 text-h3 text-white bg-primary-blue border border-primary-blue rounded-full transition-all duration-200 shadow-sm transform hover:-translate-y-0.5 hover:shadow-md ${
                isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-semantic-green'
              }`}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <span className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></span>
                  Guardando...
                </div>
              ) : (
                modalType === 'add' ? 'Crear' : 'Guardar'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}