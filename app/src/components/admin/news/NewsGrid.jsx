'use client';

import { Search, PlusCircle } from 'lucide-react';
import NewsCard from './NewsCard';

export default function NewsGrid({ 
  currentItems,
  handleOpenModal,
  handleConfirmStatusToggle,
  handleOpenPermissionsModal,
  getCategoryColor,
  isLoading
}) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-lg overflow-hidden border-b-4 border-gray-3 shadow-sm h-full flex flex-col font-poppins`}
            style={{ minHeight: '300px' }} // Altura estática para evitar saltos
          >
            {/* Imagen con dimensiones exactas */}
            <div className={`w-full ${cardHeight} aspect-[16/9] bg-gray-1 flex items-center justify-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <div className={`${cardPadding} flex-grow flex flex-col`}>
              {/* Etiquetas de estado y categoría */}
              <div className="flex flex-wrap justify-between items-start gap-1 mb-1">
                <div className={`${badgeHeight} bg-gray-200 rounded-full w-16 animate-pulse`}></div>
                <div className={`${badgeHeight} bg-gray-200 rounded-full w-14 animate-pulse`}></div>
              </div>
              
              {/* Título */}
              <div className={`${titleMargin} flex-grow`}>
                <div className={`${titleHeight} bg-gray-200 rounded w-full animate-pulse mb-1`}></div>
                <div className={`${titleHeight} bg-gray-200 rounded w-4/5 animate-pulse`}></div>
              </div>
              
              {/* Fecha */}
              <div className={`${dateHeight} bg-gray-200 rounded w-3/4 animate-pulse ${dateMargin}`}></div>
              
              {/* Acciones */}
              <div className={`border-t border-gray-1 ${actionsPadding} flex justify-between items-center mt-auto`}>
                <div className="flex gap-1">
                  <div className={`${actionSize} bg-gray-200 rounded-full animate-pulse`}></div>
                  <div className={`${actionSize} bg-gray-200 rounded-full animate-pulse`}></div>
                  <div className={`${actionSize} bg-gray-200 rounded-full animate-pulse`}></div>
                </div>
                <div className={`${actionSize} bg-gray-200 rounded-full animate-pulse`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }  

  if (currentItems.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div className="col-span-full flex flex-col items-center gap-4 py-8">
          <div className="mb-4 flex justify-center">
            <Search size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl sm:text-2xl font-medium text-gray-800 mb-2 text-center">
            No se encontraron noticias
          </h3>
          <p className="text-gray-500 text-base sm:text-lg text-center">
            Intenta con otros criterios de búsqueda o crea una nueva noticia.
          </p>
          <button 
            onClick={() => handleOpenModal('add')}
            className="mt-2 bg-primary-blue hover:bg-semantic-blue text-white py-2 px-4 rounded-full text-sm flex items-center gap-2 transition-all duration-200"
          >
            <PlusCircle size={16} />
            <span>Crear noticia</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
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