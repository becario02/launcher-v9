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
  searchTerm,
  deleteNews
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
            className="
              bg-white dark:bg-gray-7
              rounded-lg overflow-hidden border-b-4
              border-gray-3 dark:border-gray-6
              shadow-sm h-full flex flex-col font-poppins
            "
            style={{ minHeight: '300px' }} // Altura estática para evitar saltos
          >
            {/* Imagen con dimensiones exactas */}
            <div
              className={`
                w-full ${cardHeight} aspect-[16/9]
                bg-gray-1 dark:bg-gray-6
                flex items-center justify-center
              `}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-2 dark:text-gray-5 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            
            <div className={`${cardPadding} flex-grow flex flex-col`}>
              {/* Etiquetas de estado y categoría */}
              <div className="flex flex-wrap justify-between items-start gap-1 mb-1">
                <div className={`${badgeHeight} w-16 bg-gray-200 dark:bg-gray-6 rounded-full animate-pulse`} />
                <div className={`${badgeHeight} w-14 bg-gray-200 dark:bg-gray-6 rounded-full animate-pulse`} />
              </div>
              
              {/* Título */}
              <div className={`${titleMargin} flex-grow`}>
                <div className={`${titleHeight} w-full bg-gray-200 dark:bg-gray-6 rounded animate-pulse mb-1`} />
                <div className={`${titleHeight} w-4/5 bg-gray-200 dark:bg-gray-6 rounded animate-pulse`} />
              </div>
              
              {/* Fecha */}
              <div className={`${dateHeight} w-3/4 bg-gray-200 dark:bg-gray-6 rounded animate-pulse ${dateMargin}`} />
              
              {/* Acciones */}
              <div className={`border-t border-gray-1 dark:border-gray-6 ${actionsPadding} flex justify-between items-center mt-auto`}>
                <div className="flex gap-1">
                  <div className={`${actionSize} bg-gray-200 dark:bg-gray-6 rounded-full animate-pulse`} />
                  <div className={`${actionSize} bg-gray-200 dark:bg-gray-6 rounded-full animate-pulse`} />
                  <div className={`${actionSize} bg-gray-200 dark:bg-gray-6 rounded-full animate-pulse`} />
                </div>
                <div className={`${actionSize} bg-gray-200 dark:bg-gray-6 rounded-full animate-pulse`} />
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
          onDelete={deleteNews}
        />
      ))}
    </div>
  );
}