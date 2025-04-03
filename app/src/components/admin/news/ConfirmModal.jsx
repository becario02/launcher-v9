// components/admin/news/ConfirmModal.jsx
"use client";

import { X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  currentNews, 
  confirmAction, 
  handleCloseConfirmModal 
}) {
  if (!isOpen || !currentNews) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 animate-fadeIn my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-base sm:text-lg font-medium text-gray-800">
            Confirmar {currentNews.status === 'active' ? 'Desactivación' : 'Activación'}
          </h2>
          <button 
            onClick={handleCloseConfirmModal}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="px-4 sm:px-6 py-5 sm:py-6">
          <p className="text-gray-700 mb-4 text-sm sm:text-base">
            ¿Estás seguro que deseas {currentNews.status === 'active' ? 'desactivar' : 'activar'} la noticia <span className="font-medium">&quot;{currentNews.title}&quot;</span>?
          </p>
          
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500">
              {currentNews.status === 'active' 
                ? 'La noticia ya no será visible para los usuarios.' 
                : 'La noticia será visible nuevamente para todos los usuarios.'}
            </p>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={handleCloseConfirmModal}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all duration-200 shadow-sm transform hover:-translate-y-0.5"
          >
            Cancelar
          </button>
          
          <button 
            onClick={confirmAction}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm text-white rounded-full transition-all duration-200 ${
              currentNews.status === 'active' 
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600' 
                : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800'
            } transform hover:-translate-y-0.5 hover:shadow-md`}
          >
            {currentNews.status === 'active' ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  );
}