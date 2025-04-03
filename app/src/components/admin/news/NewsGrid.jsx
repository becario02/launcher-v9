"use client";

import { Search } from 'lucide-react';
import NewsCard from './NewsCard';

export default function NewsGrid({ 
  currentItems,
  handleOpenModal,
  handleConfirmStatusToggle,
  getCategoryColor
}) {
  if (currentItems.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm">
        <div className="mb-4 flex justify-center">
          <Search size={40} className="text-gray-300" />
        </div>
        <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">No se encontraron noticias</h3>
        <p className="text-gray-500 text-sm sm:text-base">Intenta con otros criterios de búsqueda o crea una nueva noticia.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
      {currentItems.map(item => (
        <NewsCard 
          key={item.id}
          item={item}
          handleOpenModal={handleOpenModal}
          handleConfirmStatusToggle={handleConfirmStatusToggle}
          getCategoryColor={getCategoryColor}
        />
      ))}
    </div>
  );
}