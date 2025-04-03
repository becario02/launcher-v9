"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NewsPagination({
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  filteredNewsLength,
  prevPage,
  nextPage
}) {
  if (filteredNewsLength === 0) return null;
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm mt-4 mb-6">
      <span className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
        Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredNewsLength)} de {filteredNewsLength} noticias
      </span>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={prevPage}
          disabled={currentPage === 1}
          className="flex items-center"
          aria-label="Página anterior"
        >
          <ChevronLeft size={20} className={`${currentPage === 1 ? 'text-gray-300' : 'text-gray-600 hover:text-gray-900'}`} />
          <span className="sr-only">Anterior</span>
        </button>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">{currentPage}</span>
          <span className="text-gray-400">/</span>
          <span>{totalPages}</span>
        </div>
        
        <button 
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="flex items-center"
          aria-label="Página siguiente"
        >
          <span className="sr-only">Siguiente</span>
          <ChevronRight size={20} className={`${currentPage === totalPages ? 'text-gray-300' : 'text-gray-600 hover:text-gray-900'}`} />
        </button>
      </div>
    </div>
  );
}