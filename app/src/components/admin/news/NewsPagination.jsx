'use client';

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
  // Note: no longer need `isDark` – we handle styles via Tailwind's `dark:` classes

  if (filteredNewsLength === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-p mt-4 mb-6">
      <div className="flex items-center gap-3 order-2 sm:order-1">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className="
            flex items-center gap-1 px-2 py-1 rounded
            hover:bg-gray-1 dark:hover:bg-gray-6
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          <ChevronLeft
            size={18}
            className="
              text-gray-5 dark:text-gray-3
              disabled:text-gray-3 dark:disabled:text-gray-5
            "
          />
          <span
            className="
              text-p text-gray-4 dark:text-gray-3
              disabled:text-gray-3 dark:disabled:text-gray-5
            "
          >
            Anterior
          </span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-medium text-black dark:text-white">
            {currentPage}
          </span>
          <span className="text-gray-5 dark:text-gray-3">/</span>
          <span className="text-black dark:text-white">
            {totalPages}
          </span>
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          aria-label="Página siguiente"
          className="
            flex items-center gap-1 px-2 py-1 rounded
            hover:bg-gray-1 dark:hover:bg-gray-6
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          <span
            className="
              text-p text-gray-4 dark:text-gray-3
              disabled:text-gray-3 dark:disabled:text-gray-5
            "
          >
            Siguiente
          </span>
          <ChevronRight
            size={18}
            className="
              text-gray-5 dark:text-gray-3
              disabled:text-gray-3 dark:disabled:text-gray-5
            "
          />
        </button>
      </div>

      <span className="order-1 sm:order-2 text-p-small sm:text-p text-center sm:text-right text-gray-4 dark:text-gray-3">
        Mostrando {indexOfFirstItem + 1}‑{Math.min(indexOfLastItem, filteredNewsLength)} de {filteredNewsLength} noticias
      </span>
    </div>
  );
}