'use client';

import { Search, PlusCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function EmptyState({ searchTerm, handleOpenModal }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[400px] py-12">
      <div className={`${isDark ? 'bg-gray-7' : 'bg-gray-100'} rounded-full p-6 mb-6`}>
        <Search size={48} className={isDark ? 'text-gray-5' : 'text-gray-300'} />
      </div>
      <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-gray-2' : 'text-gray-800'}`}>
        No se encontraron noticias
      </h3>
      <p className={`${isDark ? 'text-gray-3' : 'text-gray-500'} text-center max-w-md mb-8`}>
        {searchTerm 
          ? `No hay resultados para "${searchTerm}". Intenta con otros criterios de búsqueda o crea una nueva noticia.`
          : 'Intenta con otros criterios de búsqueda o crea una nueva noticia.'}
      </p>
      <button
        onClick={() => handleOpenModal('add')}
        className="bg-primary-blue hover:bg-semantic-blue text-white py-3 px-6 rounded-full text-sm flex items-center gap-2 transition-all duration-200"
      >
        <PlusCircle size={18} />
        <span>Crear noticia</span>
      </button>
    </div>
  );
}