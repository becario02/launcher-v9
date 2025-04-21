'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, PlusCircle, Filter } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function NewsFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  handleOpenModal,
  setCurrentPage
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filterHeight, setFilterHeight] = useState(0);
  const filterRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (filterRef.current) {
      setFilterHeight(showFilters ? filterRef.current.scrollHeight : 0);
    }
  }, [showFilters]);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div
      className={`
        mb-5
        bg-white dark:bg-gray-7
        rounded-lg shadow-sm border
        ${showFilters ? 'border-semantic-blue' : 'border-primary-blue'}
        p-3 transition-all duration-300 hover:shadow-md
      `}
    >
      {/* Mobile */}
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <div className="relative flex-grow max-w-[180px]">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchTerm(e.target.value);
            }}
            className={`
              w-full pl-8 pr-2 py-2 border
              border-gray-2 bg-gray-1 text-primary-blue placeholder:text-primary-blue
              dark:border-gray-6 dark:bg-gray-8 dark:text-white dark:placeholder:text-gray-3
              rounded-full focus:outline-none focus:ring-1 focus:ring-primary-blue focus:ring-offset-1
              transition-all duration-200 text-xs
            `}
          />
          <Search
            size={14}
            className={`absolute left-2.5 top-1/2 transform -translate-y-1/2
              text-primary-blue dark:text-gray-3
            `}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setCurrentPage(1);
                setSearchTerm('');
              }}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2
                text-gray-3 hover:text-primary-blue dark:text-gray-4 dark:hover:text-white
              `}
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal('add')}
            className="
              bg-primary-blue hover:bg-semantic-blue text-white
              py-2 px-3 rounded-full text-xs flex items-center gap-1
              transition-all duration-200
            "
          >
            <PlusCircle size={14} />
            <span>Agregar</span>
          </button>

          <button
            onClick={toggleFilters}
            className={`
              border py-2 px-3 rounded-full text-xs flex items-center gap-1
              transition-all duration-200
              ${showFilters
                ? 'bg-primary-blue bg-opacity-10 dark:bg-opacity-30 border-primary-blue text-semantic-blue'
                : 'bg-white border-gray-2 text-primary-blue hover:bg-gray-1 dark:bg-gray-7 dark:border-gray-6 dark:text-white dark:hover:bg-gray-6'
              }
            `}
          >
            <Filter
              size={14}
              className={
                showFilters
                  ? 'text-semantic-blue'
                  : 'text-primary-blue dark:text-white'
              }
            />
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between gap-2 mb-3">
        <div className="relative flex-grow max-w-[300px]">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchTerm(e.target.value);
            }}
            className={`
              w-full pl-8 pr-2 py-2 border rounded-full
              focus:outline-none focus:ring-1 focus:ring-primary-blue focus:ring-offset-1
              transition-all duration-200 text-p
              border-gray-2 bg-gray-1 text-primary-blue placeholder:text-primary-blue
              dark:border-gray-6 dark:bg-gray-8 dark:text-white dark:placeholder:text-gray-3
            `}
          />
          <Search
            size={16}
            className={`absolute left-2.5 top-1/2 transform -translate-y-1/2
              text-primary-blue dark:text-gray-3
            `}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setCurrentPage(1);
                setSearchTerm('');
              }}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2
                text-gray-400 hover:text-primary-blue dark:text-gray-4 dark:hover:text-white
              `}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal('add')}
            className="
              bg-primary-blue hover:bg-semantic-blue text-white
              py-2 px-4 rounded-full text-p flex items-center gap-2
              transition-all duration-200
            "
          >
            <PlusCircle size={16} />
            <span>Agregar</span>
          </button>

          <button
            onClick={toggleFilters}
            className={`
              border py-2 px-4 rounded-full text-p flex items-center gap-2
              transition-all duration-300
              ${showFilters
                ? 'bg-primary-blue bg-opacity-10 dark:bg-opacity-30 border-primary-blue text-semantic-blue'
                : 'bg-gray-1 text-primary-blue border-gray-2 hover:bg-gray-1 dark:bg-gray-7 dark:border-gray-6 dark:text-white dark:hover:bg-gray-6'
              }
            `}
          >
            <Filter
              size={16}
              className={
                showFilters
                  ? 'text-semantic-blue'
                  : 'text-primary-blue dark:text-white'
              }
            />
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      {/* Panel de filtros extra */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: `${filterHeight}px`, opacity: showFilters ? 1 : 0 }}
      >
        <div
          ref={filterRef}
          className={`
            mt-3 pt-3 pb-2 sm:pb-3 md:pb-2 border-t
            border-gray-100 dark:border-gray-6
          `}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">
            <div className="flex flex-col gap-1 sm:gap-2">
              <span className="text-xs font-medium text-primary-blue dark:text-gray-2">
                Estado:
              </span>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {['all', 'ACTIVE', 'INACTIVE'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setCurrentPage(1);
                      setStatusFilter(status);
                    }}
                    className={`
                      px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm
                      transition-all duration-200
                      ${statusFilter === status
                        ? 'bg-primary-blue text-white'
                        : 'bg-gray-1 text-primary-blue hover:bg-primary-blue hover:bg-opacity-10 dark:bg-gray-6 dark:text-white dark:hover:bg-primary-blue dark:hover:bg-opacity-30'
                      }
                    `}
                  >
                    {status === 'all'
                      ? 'Todos'
                      : status === 'ACTIVE'
                      ? 'Activos'
                      : 'Inactivos'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 sm:gap-2 md:items-end">
              <span className="text-xs font-medium block md:mb-1 text-primary-blue dark:text-gray-2">
                Categoría:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCurrentPage(1);
                  setCategoryFilter(e.target.value);
                }}
                className={`
                  appearance-none pl-3 sm:pl-4 pr-8 sm:pr-10 py-1.5 sm:py-2 rounded-full
                  border text-xs sm:text-sm w-full max-w-xs md:w-auto
                  focus:outline-none focus:ring-1 focus:ring-primary-blue focus:ring-offset-1
                  transition-all duration-200
                  border-primary-blue bg-white text-primary-blue
                  dark:border-gray-6 dark:bg-gray-7 dark:text-white
                `}
              >
                <option value="all">Todas las categorías</option>
                {categories
                  .filter((cat) => cat !== 'all')
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}