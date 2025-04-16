"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function NewsPagination({
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  filteredNewsLength,
  prevPage,
  nextPage
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (filteredNewsLength === 0) return null;
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-p mt-4 mb-6">
      <div className="flex items-center gap-3 order-2 sm:order-1">
        <button 
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-2 py-1 rounded ${
            isDark 
              ? 'hover:bg-gray-6' 
              : 'hover:bg-gray-1'
          }`}
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} className={`${
            currentPage === 1 
              ? isDark ? 'text-gray-5' : 'text-gray-3' 
              : isDark ? 'text-gray-3' : 'text-gray-5'
          }`} />
          <span className={`text-p ${
            currentPage === 1 
              ? isDark ? 'text-gray-5' : 'text-gray-3' 
              : isDark ? 'text-gray-3' : 'text-gray-4'
          }`}>Anterior</span>
        </button>
        
        <div className="flex items-center gap-2">
          <span className={`font-medium ${isDark ? 'text-white' : ''}`}>{currentPage}</span>
          <span className={isDark ? 'text-gray-3' : 'text-gray-5'}>/</span>
          <span className={isDark ? 'text-gray-3' : ''}>{totalPages}</span>
        </div>
        
        <button 
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-2 py-1 rounded ${
            isDark 
              ? 'hover:bg-gray-6' 
              : 'hover:bg-gray-1'
          }`}
          aria-label="Página siguiente"
        >
          <span className={`text-p ${
            currentPage === totalPages 
              ? isDark ? 'text-gray-5' : 'text-gray-3' 
              : isDark ? 'text-gray-3' : 'text-gray-5'
          }`}>Siguiente</span>
          <ChevronRight size={18} className={`${
            currentPage === totalPages 
              ? isDark ? 'text-gray-5' : 'text-gray-3' 
              : isDark ? 'text-gray-3' : 'text-gray-4'
          }`} />
        </button>
      </div>
      
      <span className={`${
        isDark ? 'text-gray-3' : 'text-gray-4'
      } text-p-small sm:text-p text-center sm:text-right order-1 sm:order-2`}>
        Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredNewsLength)} de {filteredNewsLength} noticias
      </span>
    </div>
  );
}