// components/admin/news/NewsCard.jsx
"use client";

import { Eye, Edit, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function NewsCard({ 
  item, 
  handleOpenModal, 
  handleConfirmStatusToggle,
  getCategoryColor 
}) {
  return (
    <div 
      className={`bg-white rounded-lg overflow-hidden border-b-4 ${
        item.status === 'active' ? 'border-gray-800' : 'border-gray-400'
      } shadow-sm hover:shadow transition-all duration-300 h-full flex flex-col`}
    >
      {/* Imagen de la noticia (si existe) */}
      {item.imageUrl && (
        <div className="w-full h-[130px] overflow-hidden">
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-3 flex-grow flex flex-col">
        <div className="flex flex-wrap justify-between items-start gap-1 mb-1.5">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getCategoryColor(item.category)} text-white`}>
            {item.category}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            item.status === 'active'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}>
            {item.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        
        <h3 className="text-sm font-medium mb-1.5 line-clamp-2 flex-grow">
          {item.title}
        </h3>
        
        <p className="text-gray-500 text-[10px] mb-2">
          Publicado: {item.date}
        </p>
        
        <div className="border-t border-gray-100 pt-2 flex justify-between items-center mt-auto">
          <div className="flex gap-1">
            <button 
              onClick={() => handleOpenModal('view', item)}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Ver detalles"
              aria-label="Ver detalles"
            >
              <Eye size={15} className="text-gray-600" />
            </button>
            <button 
              onClick={() => handleOpenModal('edit', item)}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Editar"
              aria-label="Editar"
            >
              <Edit size={15} className="text-gray-600" />
            </button>
          </div>
          
          <button 
            onClick={() => handleConfirmStatusToggle(item.id)}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            title={item.status === 'active' ? 'Desactivar' : 'Activar'}
            aria-label={item.status === 'active' ? 'Desactivar' : 'Activar'}
          >
            {item.status === 'active' ? (
              <ArrowDownCircle size={15} className="text-gray-600" />
            ) : (
              <ArrowUpCircle size={15} className="text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}