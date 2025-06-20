'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, PlusCircle, Filter } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { usePrimaryColor } from '@/context/primaryColor';

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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const filterRef = useRef(null);
  const dropdownRef = useRef(null);
  const { theme } = useTheme();
  const { primaryColor } = usePrimaryColor();

  useEffect(() => {
    if (filterRef.current) {
      setFilterHeight(showFilters ? filterRef.current.scrollHeight : 0);
    }
  }, [showFilters]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleFilters = () => setShowFilters(prev => !prev);
  const filterBg = showFilters ? `${primaryColor}33` : 'transparent';
  
  const categoryTranslations = {
    'COMMUNICATION': 'Comunicados',
    'MAINTENANCE_EXTERNAL': 'Mantenimiento Externo',
    'GENERAL_NEWS': 'Noticias',
    'LEGAL_NEWS': 'Noticias Normativas',
    'BLOG': 'Blog',
    'PRODUCTS_SERVICES': 'Productos y Servicios',
    'SUCCESS_STORY': 'Casos de Éxito',
    'PROMOTIONAL': 'Promocional',
    'CLOUD_PROMO': 'Nube Promocional',
    'UPCOMING_EVENTS': 'Eventos Próximos'
  };

  return (
    <div
      className="
        mb-5
        bg-white dark:bg-gray-7
        rounded-lg shadow-sm
        border border-gray-200 dark:border-white/20  
        p-3 transition-all duration-300 hover:shadow-md
        relative z-0
      "
      style={{ overflow: 'visible' }}
    >
      {/* Mobile */}
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <div className="relative flex-grow max-w-[180px]">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={e => { setCurrentPage(1); setSearchTerm(e.target.value); }}
            className="
              w-full pl-8 pr-2 py-2
              border border-gray-200 bg-gray-1 text-primary-blue placeholder:text-primary-blue
              dark:border-[#2C2C38] dark:bg-gray-8 dark:text-white dark:placeholder:text-gray-3
              rounded-full
              focus:outline-none focus:ring-1 focus:ring-primary-blue focus:ring-offset-1
              transition-all duration-200 text-xs
            "
          />
          <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-primary-blue dark:text-gray-3" />
          {searchTerm && (
            <button
              onClick={() => { setCurrentPage(1); setSearchTerm(''); }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-3 hover:text-primary-blue dark:text-gray-4 dark:hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Agregar - dinámico */}
          <button
            onClick={() => handleOpenModal('add')}
            style={{ backgroundColor: primaryColor }}
            className="text-white py-2 px-3 rounded-full text-xs flex items-center gap-1 transition-all duration-200"
          >
            <PlusCircle size={14} />
            <span>Agregar</span>
          </button>

          {/* Filtrar - dinámico */}
          <button
            onClick={toggleFilters}
            style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: filterBg }}
            className="border py-2 px-3 rounded-full text-xs flex items-center gap-1 transition-all duration-300"
          >
            <Filter size={14} />
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
            onChange={e => { setCurrentPage(1); setSearchTerm(e.target.value); }}
            className="
              w-full pl-8 pr-2 py-2
              border border-gray-200 rounded-full
              bg-gray-1 text-primary placeholder:text-primary
              dark:border-[#2C2C38] dark:bg-gray-8 dark:text-primary dark:placeholder:text-primary
              focus:outline-none focus:ring-1 focus:ring-primary
              transition-all duration-200 text-p
            "
          />
          <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-primary dark:text-primary" />
          {searchTerm && (
            <button
              onClick={() => { setCurrentPage(1); setSearchTerm(''); }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-blue dark:text-gray-4 dark:hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Agregar - dinámico */}
          <button
            onClick={() => handleOpenModal('add')}
            style={{ backgroundColor: primaryColor }}
            className="text-white py-2 px-4 rounded-full text-p flex items-center gap-2 transition-all duration-200"
          >
            <PlusCircle size={16} />
            <span>Agregar</span>
          </button>

          {/* Filtrar - dinámico */}
          <button
            onClick={toggleFilters}
            style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: filterBg }}
            className="border py-2 px-4 rounded-full text-p flex items-center gap-2 transition-all duration-300"
          >
            <Filter size={16} />
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      {/* Panel de filtros extra - ANIMACIÓN ELEGANTE Y SUAVE */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ overflow: showFilters ? 'visible' : 'hidden' }}
      >
        <div
          ref={filterRef}
          style={{ borderTop: `1px solid ${primaryColor}` }}
          className={`mt-3 pt-3 pb-2 sm:pb-3 md:pb-2 transform transition-all duration-500 ease-out ${
            showFilters 
              ? 'translate-y-0 opacity-100 scale-100' 
              : '-translate-y-6 opacity-0 scale-95'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">
            <div className="flex flex-col gap-1 sm:gap-2">
              <span
                style={{ color: primaryColor }}
                className="text-xs font-medium dark:text-gray-2"
              >
                Estado:
              </span>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {['all', 'ACTIVE', 'INACTIVE'].map(status => {
                  const isActive = statusFilter === status;
                  return (
                    <button
                      key={status}
                      onClick={() => { setCurrentPage(1); setStatusFilter(status); }}
                      style={
                        isActive
                          ? { backgroundColor: primaryColor, color: '#fff' }
                          : { color: primaryColor }
                      }
                      className={`
                        px-3 py-1 sm:py-2 rounded-full text-xs sm:text-p
                        transition-all duration-200
                        bg-gray-1 dark:bg-gray-6
                        ${isActive ? '' : 'hover:bg-opacity-10 dark:hover:bg-opacity-30'}
                      `}
                    >
                      {status === 'all'
                        ? 'Todos'
                        : status === 'ACTIVE'
                        ? 'Activos'
                        : 'Inactivos'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1 sm:gap-2 md:items-end md:justify-self-end">
              <span
                style={{ color: primaryColor }}
                className="text-xs font-medium block md:mb-1 dark:text-gray-2 md:text-right"
              >
                Categoría:
              </span>
              {/* DROPDOWN PERSONALIZADO PARA CATEGORÍAS */}
              <div className="relative z-10 md:w-fit w-full" ref={dropdownRef}>
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  style={{
                    border: `1px solid ${primaryColor}`,
                    color: primaryColor
                  }}
                  className="
                    w-full text-left pl-3 sm:pl-4 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-full
                    bg-gray-1 dark:bg-gray-6
                    focus:outline-none focus:ring-0
                    transition-all duration-200
                    md:min-w-[220px] md:max-w-[280px] flex items-center justify-between
                    hover:bg-opacity-80
                    text-xs sm:text-p
                  "
                >
                  <span className="truncate">
                    {categoryFilter === 'all' 
                      ? 'Todas las categorías' 
                      : (categoryTranslations[categoryFilter] || categoryFilter)
                    }
                  </span>
                  <div 
                    className={`transform transition-transform duration-200 flex-shrink-0 ${
                      showCategoryDropdown ? 'rotate-180' : 'rotate-0'
                    }`}
                    style={{ color: primaryColor }}
                  >
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                      <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </div>
                </button>

                {/* Dropdown Options */}
                {showCategoryDropdown && (
                  <div 
                    className="
                      absolute top-full left-0 right-0 mt-1
                      bg-white dark:bg-gray-7
                      border border-gray-200 dark:border-gray-6
                      rounded-lg shadow-lg
                      max-h-60 overflow-y-auto
                      z-50
                      md:right-0 md:left-auto md:w-80
                    "
                    style={{ 
                      borderColor: `${primaryColor}33`,
                      boxShadow: `0 4px 6px -1px ${primaryColor}20, 0 2px 4px -1px ${primaryColor}10`
                    }}
                  >
                    <div 
                      onClick={() => {
                        setCurrentPage(1);
                        setCategoryFilter('all');
                        setShowCategoryDropdown(false);
                      }}
                      className={`
                        px-4 py-2 cursor-pointer transition-colors duration-150
                        hover:bg-gray-50 dark:hover:bg-gray-6
                        ${categoryFilter === 'all' ? 'font-medium' : ''}
                        text-xs sm:text-p
                      `}
                      style={{ 
                        color: categoryFilter === 'all' ? primaryColor : 'inherit',
                        backgroundColor: categoryFilter === 'all' ? `${primaryColor}10` : 'transparent'
                      }}
                    >
                      Todas las categorías
                    </div>
                    {Object.keys(categoryTranslations).map(category => (
                      <div
                        key={category}
                        onClick={() => {
                          setCurrentPage(1);
                          setCategoryFilter(category);
                          setShowCategoryDropdown(false);
                        }}
                        className={`
                          px-4 py-2 cursor-pointer transition-colors duration-150
                          hover:bg-gray-50 dark:hover:bg-gray-6
                          ${categoryFilter === category ? 'font-medium' : ''}
                          text-xs sm:text-p
                        `}
                        style={{ 
                          color: categoryFilter === category ? primaryColor : 'inherit',
                          backgroundColor: categoryFilter === category ? `${primaryColor}10` : 'transparent'
                        }}
                      >
                        {categoryTranslations[category]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}