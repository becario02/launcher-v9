"use client";

import { Eye, Edit, ArrowUpCircle, ArrowDownCircle, Users } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function NewsCard({ 
  item, 
  handleOpenModal, 
  handleConfirmStatusToggle,
  handleOpenPermissionsModal,
  getCategoryColor 
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estilo para el valor de la categoría (en el círculo)
  const categoryValueStyle = 'bg-primary-blue text-white rounded-full px-2 py-0.5';

  return (
    <div 
      className={`${isDark ? 'bg-gray-7' : 'bg-white'} rounded-lg overflow-hidden border-b-4 ${
        item.status === 'ACTIVE' 
          ? 'border-primary-blue' 
          : isDark ? 'border-gray-6' : 'border-gray-3'
      } shadow-sm ${isDark ? 'hover:shadow-gray-900' : 'hover:shadow'} transition-all duration-300 h-full flex flex-col font-poppins`}
    >
      {/* Contenedor de imagen con tamaño reducido */}
      <div className={`w-full min-h-[180px] aspect-[16/9] overflow-hidden ${isDark ? 'bg-gray-6' : 'bg-gray-1'} flex items-center justify-center`}>
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${isDark ? 'text-gray-5' : 'text-gray-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      
      <div className="p-2.5 flex-grow flex flex-col">
        {/* Categoría y estado activo en la misma línea */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1 text-xs">
            <span className={isDark ? 'text-gray-3' : 'text-gray-4'}>Categoría:</span>
            <span className={categoryValueStyle}>
              {item.category}
            </span>
          </div>
          
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            item.status === 'ACTIVE'
              ? 'bg-primary-blue text-white'
              : isDark ? 'bg-gray-6 text-gray-3' : 'bg-gray-2 text-gray-4'
          }`}>
            {item.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        
        {/* Título */}
        <h3 className={`text-sm font-medium mb-1 line-clamp-2 ${isDark ? 'text-gray-2' : 'text-gray-5'} leading-tight`}>
          {item.title}
        </h3>
        
        <p className={`text-xs font-regular mb-1.5 ${isDark ? 'text-gray-3' : 'text-gray-3'} leading-tight`}>
        {(() => {
          try {
            const originalDate = new Date(item.date);
            if (isNaN(originalDate.getTime())) return "Fecha no disponible";
            const adjustedDate = new Date(originalDate.getTime() - (6 * 60 * 60 * 1000));
            const options = { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            };
            return `Publicado: ${adjustedDate.toLocaleDateString('es-MX', options)}`;
          } catch (e) {
            return `Publicado: ${item.date}`;
          }
        })()}
        </p>
        
        <div className={`border-t ${isDark ? 'border-gray-6' : 'border-gray-1'} pt-1.5 flex justify-between items-center mt-auto`}>
          <div className="flex gap-1">
            <button 
              onClick={() => handleOpenModal('view', item)}
              className={`p-1 rounded ${isDark ? 'hover:bg-gray-6' : 'hover:bg-gray-1'} transition-colors`}
              title="Ver detalles"
              aria-label="Ver detalles"
            >
              <Eye size={18} className={`${isDark ? 'text-gray-3' : 'text-gray-4'} hover:text-primary-blue`} />
            </button>
            <button 
              onClick={() => handleOpenModal('edit', item)}
              className={`p-1 rounded ${isDark ? 'hover:bg-gray-6' : 'hover:bg-gray-1'} transition-colors`}
              title="Editar"
              aria-label="Editar"
            >
              <Edit size={18} className={`${isDark ? 'text-gray-3' : 'text-gray-4'} hover:text-primary-blue`} />
            </button>

            <button 
              onClick={() => handleOpenPermissionsModal(item.id)}
              className={`p-1 rounded ${isDark ? 'hover:bg-gray-6' : 'hover:bg-gray-1'} transition-colors group relative`}
              title="Configurar audiencia"
              aria-label="Configurar audiencia"
            >
              <Users size={18} className={`${isDark ? 'text-gray-3' : 'text-gray-4'} group-hover:text-primary-blue transition-colors`} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </button>
          </div>
          
          <button 
            onClick={() => handleConfirmStatusToggle(item.id)}
            className={`p-1 rounded ${isDark ? 'hover:bg-gray-6' : 'hover:bg-gray-1'} transition-colors`}
            title={item.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
            aria-label={item.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
          >
            {item.status === 'ACTIVE' ? (
              <ArrowDownCircle size={18} className={`${isDark ? 'text-gray-3' : 'text-gray-4'} hover:text-primary-blue`} />
            ) : (
              <ArrowUpCircle size={18} className={`${isDark ? 'text-gray-3' : 'text-gray-4'} hover:text-primary-blue`} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}