'use client';

import { Search, PlusCircle } from 'lucide-react';

export default function EmptyState({ searchTerm, handleOpenModal }) {

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[400px] py-12">
      <div className="rounded-full p-6 mb-6 bg-gray-100 dark:bg-gray-7">
        <Search size={48} className="text-gray-300 dark:text-gray-5" />
      </div>
      <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-2">
        No se encontraron noticias
      </h3>
      <p className="text-center max-w-md mb-8 text-gray-500 dark:text-gray-3">
        {searchTerm 
          ? `No hay resultados para "${searchTerm}". Intenta con otros criterios de búsqueda o crea una nueva noticia.`
          : 'Intenta con otros criterios de búsqueda o crea una nueva noticia.'}
      </p>
      <button
        onClick={() => handleOpenModal('add')}
        className="
          bg-primary-blue hover:bg-semantic-blue
          text-white py-3 px-6 rounded-full text-sm
          flex items-center gap-2 transition-all duration-200
          dark:bg-primary-blue dark:hover:bg-semantic-blue
        "
      >
        <PlusCircle size={18} />
        <span>Crear noticia</span>
      </button>
    </div>
  );
}