'use client';

import NewsCard from './NewsCard';
import EmptyState from './EmptyState'; // Importamos el componente que ya creaste
import { useTheme } from '@/context/ThemeContext';

export default function NewsGrid({ 
  currentItems,
  handleOpenModal,
  handleConfirmStatusToggle,
  handleOpenPermissionsModal,
  getCategoryColor,
  isLoading,
  searchTerm // Nueva prop para pasar a EmptyState
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Medidas exactas tomadas del componente NewsCard
  const cardHeight = "min-h-[180px]";
  const badgeHeight = "h-5";
  const titleHeight = "h-4";
  const dateHeight = "h-3";
  const actionSize = "w-6 h-6";
  const cardPadding = "p-2.5";
  const titleMargin = "mb-1";
  const dateMargin = "mb-1.5";
  const actionsPadding = "pt-1.5";
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 min-h-[600px]">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className={`${isDark ? 'bg-gray-7' : 'bg-white'} rounded-lg overflow-hidden border-b-4 ${isDark ? 'border-gray-6' : 'border-gray-3'} shadow-sm h-full flex flex-col font-poppins`}
            style={{ minHeight: '300px' }} // Altura estática para evitar saltos
          >
            {/* Imagen con dimensiones exactas */}
            <div className={`w-full ${cardHeight} aspect-[16/9] ${isDark ? 'bg-gray-6' : 'bg-gray-1'} flex items-center justify-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${isDark ? 'text-gray-5' : 'text-gray-2'} animate-pulse`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <div className={`${cardPadding} flex-grow flex flex-col`}>
              {/* Etiquetas de estado y categoría */}
              <div className="flex flex-wrap justify-between items-start gap-1 mb-1">
                <div className={`${badgeHeight} ${isDark ? 'bg-gray-6' : 'bg-gray-200'} rounded-full w-16 animate-pulse`}></div>
                <div className={`${badgeHeight} ${isDark ? 'bg-gray-6' : 'bg-gray-200'} rounded-full w-14 animate-pulse`}></div>
              </div>
              
              {/* Título */}
              <div className={`${titleMargin} flex-grow`}>
                <div className={`${titleHeight} ${isDark ? 'bg-gray-6' : 'bg-gray-200'} rounded w-full animate-pulse mb-1`}></div>
                <div className={`${titleHeight} ${isDark ? 'bg-gray-6' : 'bg-gray-200'} rounded w-4/5 animate-pulse`}></div>
              </div>
              
              {/* Fecha */}
              <div className={`${dateHeight} ${isDark ? 'bg-gray-6' : 'bg-gray-200'} rounded w-3/4 animate-pulse ${dateMargin}`}></div>
              
              {/* Acciones */}
              <div className={`border-t ${isDark ? 'border-gray-6' : 'border-gray-1'} ${actionsPadding} flex justify-between items-center mt-auto`}>
                <div className="flex gap-1">
                  <div className={`${actionSize} ${isDark ? 'bg-gray-6' : 'bg-gray-200'} rounded-full animate-pulse`}></div>
                  <div className={`${actionSize} ${isDark ? 'bg-gray-6' : 'bg-gray-200'} rounded-full animate-pulse`}></div>
                  <div className={`${actionSize} ${isDark ? 'bg-gray-6' : 'bg-gray-200'} rounded-full animate-pulse`}></div>
                </div>
                <div className={`${actionSize} ${isDark ? 'bg-gray-6' : 'bg-gray-200'} rounded-full animate-pulse`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }  

  if (currentItems.length === 0) {
    // Usamos el componente EmptyState en lugar del div directo
    return (
      <div className="min-h-[600px]">
        <EmptyState searchTerm={searchTerm} handleOpenModal={handleOpenModal} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 min-h-[600px]">
      {currentItems.map(item => (
        <NewsCard 
          key={item.id}
          item={item}
          handleOpenModal={handleOpenModal}
          handleConfirmStatusToggle={handleConfirmStatusToggle}
          handleOpenPermissionsModal={handleOpenPermissionsModal}
          getCategoryColor={getCategoryColor}
        />
      ))}
    </div>
  );
}