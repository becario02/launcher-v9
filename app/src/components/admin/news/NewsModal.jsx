// components/admin/news/NewsModal.jsx
"use client";

import { useState } from 'react';
import { X, Upload } from 'lucide-react';

export default function NewsModal({
  isOpen,
  modalType,
  formData,
  handleFormChange,
  handleCloseModal,
  handleSaveNews
}) {
  const [previewImage, setPreviewImage] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Actualizar el formData con el archivo
      handleFormChange({
        target: {
          name: 'imageFile',
          value: file,
          type: 'file'
        }
      });

      // Crear URL para vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        // También guardar la URL en formData.imageUrl
        handleFormChange({
          target: {
            name: 'imageUrl',
            value: reader.result,
            type: 'text'
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all duration-300 animate-fadeIn my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg sm:text-xl font-medium text-gray-800">
            {modalType === 'add' && 'Crear Nueva Noticia'}
            {modalType === 'edit' && 'Editar Noticia'}
            {modalType === 'view' && 'Detalles de la Noticia'}
          </h2>
          <button 
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="px-4 sm:px-6 py-6 max-h-[70vh] overflow-y-auto">
          <form className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input 
                type="text" 
                id="title" 
                name="title"
                value={formData.title} 
                onChange={handleFormChange}
                readOnly={modalType === 'view'}
                className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent ${modalType === 'view' ? 'bg-gray-50 cursor-not-allowed' : ''}`} 
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select 
                id="category" 
                name="category"
                value={formData.category} 
                onChange={handleFormChange}
                disabled={modalType === 'view'}
                className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent ${modalType === 'view' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              >
                <option value="Tecnología">Tecnología</option>
                <option value="Actualizaciones">Actualizaciones</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Características">Características</option>
                <option value="Eventos">Eventos</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Publicación</label>
              <input 
                type="date" 
                id="date" 
                name="date"
                value={formData.date} 
                onChange={handleFormChange}
                readOnly={modalType === 'view'}
                className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent ${modalType === 'view' ? 'bg-gray-50 cursor-not-allowed' : ''}`} 
              />
            </div>
            
            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
              {modalType !== 'view' ? (
                <div className="flex flex-col space-y-2">
                  <label className="flex flex-col items-center px-4 py-6 bg-white text-gray-500 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload size={24} />
                    <span className="mt-2 text-sm">Haz clic para subir una imagen</span>
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
                <p className="text-gray-500 italic">No hay imagen disponible</p>
              )}
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
              <textarea 
                id="content" 
                name="content"
                rows="6" 
                value={formData.content}
                onChange={handleFormChange}
                readOnly={modalType === 'view'}
                className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent ${modalType === 'view' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              ></textarea>
            </div>
            
            {modalType !== 'add' && (
              <div>
                <label className="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    name="status"
                    checked={formData.status === 'active'} 
                    onChange={handleFormChange}
                    disabled={modalType === 'view'}
                    className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-800" 
                  />
                  <span className="ml-2 text-sm text-gray-700">Noticia activa</span>
                </label>
              </div>
            )}
          </form>
        </div>
        
        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={handleCloseModal}
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all duration-200 shadow-sm transform hover:-translate-y-0.5"
          >
            {modalType === 'view' ? 'Cerrar' : 'Cancelar'}
          </button>
          
          {modalType !== 'view' && (
            <button 
              onClick={handleSaveNews}
              className="px-4 py-2 text-sm text-white bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-full transition-all duration-200 shadow-sm transform hover:-translate-y-0.5 hover:shadow-md"
            >
              {modalType === 'add' ? 'Crear' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}